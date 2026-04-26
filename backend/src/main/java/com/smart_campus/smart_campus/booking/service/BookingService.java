package com.smart_campus.smart_campus.booking.service;

import com.smart_campus.smart_campus.booking.dto.BookingRequestDTO;
import com.smart_campus.smart_campus.booking.dto.BookingResponseDTO;
import com.smart_campus.smart_campus.booking.entity.Booking;
import com.smart_campus.smart_campus.booking.entity.BookingStatus;
import com.smart_campus.smart_campus.booking.exception.BookingConflictException;
import com.smart_campus.smart_campus.booking.exception.BookingNotAuthorizedException;
import com.smart_campus.smart_campus.booking.exception.BookingNotFoundException;
import com.smart_campus.smart_campus.booking.repository.BookingRepository;
import com.smart_campus.smart_campus.facility.entity.Resource;
import com.smart_campus.smart_campus.facility.repository.ResourceRepository;
import com.smart_campus.smart_campus.notifications.entity.Notification.NotificationType;
import com.smart_campus.smart_campus.notifications.service.NotificationService;
import com.smart_campus.smart_campus.user.entity.User;
import com.smart_campus.smart_campus.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Core booking workflow: create pending requests, resolve overlaps, admin approve/reject,
 * owner/admin cancel, token check-in, and read-side APIs for dashboards and public calendar.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;
    private final BookingEmailService bookingEmailService;

    // ── Create, lookups & lists ─────────────────────────────────────────────────

    /**
     * Creates a PENDING booking after validating times and ensuring no overlap with another
     * APPROVED booking on the same resource (same slot cannot be double-booked).
     */
    public BookingResponseDTO createBooking(Long userId, BookingRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                dto.getResourceId(), dto.getStartTime(), dto.getEndTime());

        if (!conflicts.isEmpty()) {
            Booking conflicting = conflicts.get(0);
            throw new BookingConflictException(
                    conflicting.getStartTime().toString(),
                    conflicting.getEndTime().toString());
        }

        Booking booking = Booking.builder()
                .user(user)
                .resource(resource)
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose())
                .attendees(dto.getAttendees())
                .status(BookingStatus.PENDING)
                .checkInToken(UUID.randomUUID().toString())
                .build();

        Booking saved = bookingRepository.save(booking);
        notificationService.notify(
                user.getId(),
                NotificationType.BOOKING_PENDING,
                "Your booking for " + resource.getName() + " on " +
                        dto.getStartTime().toLocalDate() + " from " +
                        dto.getStartTime().toLocalTime().withSecond(0).withNano(0) + " to " +
                        dto.getEndTime().toLocalTime().withSecond(0).withNano(0) + " has been submitted and is awaiting approval.",
                saved.getId(),
                "BOOKING"
        );
        return BookingResponseDTO.fromEntity(saved);
    }

    public BookingResponseDTO getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        return BookingResponseDTO.fromEntity(booking);
    }

    public List<BookingResponseDTO> getMyBookings(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(BookingResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(BookingResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // ── Admin resolution (PENDING → APPROVED / REJECTED) + email ─────────────────

    public BookingResponseDTO approveBooking(Long bookingId, Long adminUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        Booking approvedBooking = bookingRepository.save(booking);
        notificationService.notify(
                booking.getUser().getId(),
                NotificationType.BOOKING_APPROVED,
                "Your booking for " + booking.getResource().getName() + " on " +
                        booking.getStartTime().toLocalDate() + " from " +
                        booking.getStartTime().toLocalTime().withSecond(0).withNano(0) + " to " +
                        booking.getEndTime().toLocalTime().withSecond(0).withNano(0) + " has been approved.",
                booking.getId(),
                "BOOKING"
        );
        // SMTP failures must not roll back approval; log only.
        try {
            bookingEmailService.sendBookingApprovalEmail(
                    booking.getUser().getEmail(),
                    booking.getUser().getFullName(),
                    booking.getResource().getName(),
                    booking.getResource().getLocation(),
                    booking.getStartTime(),
                    booking.getEndTime(),
                    booking.getPurpose(),
                    booking.getAttendees(),
                    booking.getCheckInToken()
            );
        } catch (Exception e) {
            System.err.println("Failed to send approval email: " + e.getMessage());
        }
        return BookingResponseDTO.fromEntity(approvedBooking);
    }

    public BookingResponseDTO rejectBooking(Long bookingId, Long adminUserId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        Booking rejectedBooking = bookingRepository.save(booking);
        notificationService.notify(
                booking.getUser().getId(),
                NotificationType.BOOKING_REJECTED,
                "Your booking for " + booking.getResource().getName() + " on " +
                        booking.getStartTime().toLocalDate() + " has been rejected. Reason: " + reason,
                booking.getId(),
                "BOOKING"
        );
        return BookingResponseDTO.fromEntity(rejectedBooking);
    }

    // ── Cancel (owner or admin) ─────────────────────────────────────────────────

    public BookingResponseDTO cancelBooking(Long bookingId, Long requestingUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        User requestingUser = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Bookings are scoped to the resource owner in the UI, but admins may cancel any.
        boolean isOwner = booking.getUser().getId().equals(requestingUserId);
        boolean isAdmin = requestingUser.getRole() == User.Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new BookingNotAuthorizedException();
        }

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("Only PENDING or APPROVED bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking cancelledBooking = bookingRepository.save(booking);
        notificationService.notify(
                booking.getUser().getId(),
                NotificationType.BOOKING_CANCELLED,
                "Your booking for " + booking.getResource().getName() + " on " +
                        booking.getStartTime().toLocalDate() + " has been cancelled.",
                booking.getId(),
                "BOOKING"
        );
        return BookingResponseDTO.fromEntity(cancelledBooking);
    }

    // ── Check-in (token link, narrow time window) ───────────────────────────────

    /**
     * Records attendance for an APPROVED booking: valid only from scheduled start until
     * 15 minutes after start (late arrivals within grace; no early check-in).
     */
    public BookingResponseDTO checkIn(String token) {
        Booking booking = bookingRepository.findByCheckInToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid check-in token"));

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("Booking is not approved");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowEnd = booking.getStartTime().plusMinutes(15);

        if (now.isBefore(booking.getStartTime()) || now.isAfter(windowEnd)) {
            throw new IllegalStateException("Check-in window has expired or not yet open");
        }

        booking.setCheckedInAt(now);
        return BookingResponseDTO.fromEntity(bookingRepository.save(booking));
    }

    // ── User history & admin attendance views ───────────────────────────────────

    public List<BookingResponseDTO> getBookingHistory(Long userId) {
        return bookingRepository.findPastBookingsByUserId(userId, LocalDateTime.now()).stream()
                .map(BookingResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getCheckedInBookings() {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getCheckedInAt() != null)
                .sorted((a, b) -> b.getCheckedInAt().compareTo(a.getCheckedInAt()))
                .map(BookingResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // ── Admin lists & recovery ─────────────────────────────────────────────────

    public List<BookingResponseDTO> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status)
                .stream()
                .map(BookingResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public BookingResponseDTO restoreBooking(Long bookingId, Long adminUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        if (booking.getStatus() != BookingStatus.AUTO_CANCELLED) {
            throw new IllegalStateException("Only AUTO_CANCELLED bookings can be restored");
        }
        booking.setStatus(BookingStatus.APPROVED);
        Booking saved = bookingRepository.save(booking);
        notificationService.notify(
                booking.getUser().getId(),
                NotificationType.BOOKING_APPROVED,
                "Your booking for " + booking.getResource().getName() + " on " +
                        booking.getStartTime().toLocalDate() + " has been restored by admin.",
                booking.getId(),
                "BOOKING"
        );
        return BookingResponseDTO.fromEntity(saved);
    }

    public void deleteBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
        bookingRepository.delete(booking);
    }

    // ── Public calendar (no sensitive fields; only confirmed slots) ─────────────

    /**
     * Calendar feed: APPROVED bookings only, optionally filtered to one resource.
     * Status is exposed as a generic "BOOKED" for external consumers.
     */
    public List<Map<String, Object>> getPublicCalendarEvents(Long resourceId) {
        List<Booking> bookings;
        if (resourceId != null) {
            bookings = bookingRepository.findByResourceIdAndStatus(resourceId, BookingStatus.APPROVED);
        } else {
            bookings = bookingRepository.findByStatus(BookingStatus.APPROVED);
        }
        return bookings.stream().map(b -> {
            Map<String, Object> event = new LinkedHashMap<>();
            event.put("id", b.getId());
            event.put("resourceId", b.getResource().getId());
            event.put("resourceName", b.getResource().getName());
            event.put("startTime", b.getStartTime());
            event.put("endTime", b.getEndTime());
            event.put("status", "BOOKED");
            return event;
        }).collect(Collectors.toList());
    }

    // ── Admin analytics (aggregates for dashboards) ───────────────────────────────

    /**
     * Builds a single payload for booking analytics. Native / JPQL scalar rows often return
     * {@link Integer} or {@link Long} depending on the JDBC driver
     * normalises counts without ClassCastException on SQLite.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getBookingAnalytics() {
        Map<String, Object> analytics = new LinkedHashMap<>();

        // 1. Status breakdown — one row per enum name + count (drives pie chart + headline totals).
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        bookingRepository.countByStatus().forEach(row -> {
            if (row[0] != null && row[1] != null) {
                statusCounts.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        });
        analytics.put("statusBreakdown", statusCounts);

        // 2. Totals & rates — approval = approved / all; cancellation includes user cancel + auto no-show.
        long total = statusCounts.values().stream().mapToLong(Long::longValue).sum();
        long approved = statusCounts.getOrDefault("APPROVED", 0L);
        long pending = statusCounts.getOrDefault("PENDING", 0L);
        long rejected = statusCounts.getOrDefault("REJECTED", 0L);
        long cancelled = statusCounts.getOrDefault("CANCELLED", 0L);
        long autoCancelled = statusCounts.getOrDefault("AUTO_CANCELLED", 0L);
        analytics.put("totalBookings", total);
        analytics.put("approvedBookings", approved);
        analytics.put("pendingBookings", pending);
        analytics.put("rejectedBookings", rejected);
        analytics.put("cancelledBookings", cancelled);
        analytics.put("autoCancelledBookings", autoCancelled);
        analytics.put("approvalRate", total > 0 ? Math.round((approved * 100.0) / total) : 0);
        analytics.put("cancellationRate", total > 0 ? Math.round(((cancelled + autoCancelled) * 100.0) / total) : 0);

        // 3. Check-in summary — denominator is APPROVED + AUTO_CANCELLED rows; checkedIn has timestamp set;
        // ghosted = scheduler auto-cancelled (no-show), used with checkedIn for the stacked bar on the UI.
        try {
            Object[] checkIn = bookingRepository.getCheckInSummary();
            long totalApprovedAndAuto = 0L;
            long checkedIn = 0L;
            long ghosted = 0L;

            if (checkIn != null) {
                // Native query may return a single Object[] or wrapped differently
                // Handle both cases
                Object[] row = checkIn;
                if (checkIn.length > 0 && checkIn[0] instanceof Object[]) {
                    row = (Object[]) checkIn[0];
                }
                if (row.length >= 1 && row[0] != null) totalApprovedAndAuto = ((Number) row[0]).longValue();
                if (row.length >= 2 && row[1] != null) checkedIn = ((Number) row[1]).longValue();
                if (row.length >= 3 && row[2] != null) ghosted = ((Number) row[2]).longValue();
            }

            analytics.put("totalApprovedBookings", totalApprovedAndAuto);
            analytics.put("checkedInCount", checkedIn);
            analytics.put("ghostedCount", ghosted);
            analytics.put("checkInRate", totalApprovedAndAuto > 0 ? Math.round((checkedIn * 100.0) / totalApprovedAndAuto) : 0);
        } catch (Exception e) {
            System.err.println("Check-in summary error: " + e.getMessage());
            analytics.put("totalApprovedBookings", 0L);
            analytics.put("checkedInCount", 0L);
            analytics.put("ghostedCount", 0L);
            analytics.put("checkInRate", 0L);
        }

        // 4. User behaviour — top bookers with explicit manual vs auto cancel counts + rate.
        List<Map<String, Object>> userStats = new java.util.ArrayList<>();
        bookingRepository.getUserBookingStats().forEach(row -> {
            try {
                if (row[0] == null) return;
                Map<String, Object> user = new LinkedHashMap<>();
                user.put("userId", row[0]);
                user.put("userName", row[1] != null ? row[1] : "Unknown");
                user.put("email", row[2] != null ? row[2] : "");
                long userTotal = row[3] != null ? ((Number) row[3]).longValue() : 0L;
                long userCancelledCount = row[4] != null ? ((Number) row[4]).longValue() : 0L;
                long userAutoCancelledCount = row[5] != null ? ((Number) row[5]).longValue() : 0L;
                user.put("totalBookings", userTotal);
                user.put("cancelledBookings", userCancelledCount);
                user.put("autoCancelledBookings", userAutoCancelledCount);
                long totalCancelled = userCancelledCount + userAutoCancelledCount;
                user.put("cancellationRate", userTotal > 0 ? Math.round((totalCancelled * 100.0) / userTotal) : 0);
                userStats.add(user);
            } catch (Exception e) {
                // Malformed native-query row (wrong types / nulls); omit rather than failing the whole report.
            }
        });
        analytics.put("userStats", userStats.stream().limit(10).collect(java.util.stream.Collectors.toList()));

        // 5. Bookings by day of week — SQLite strftime weekday 0=Sun … 6=Sat; skip bad indices quietly.
        String[] dayNames = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};
        List<Map<String, Object>> dayData = new java.util.ArrayList<>();
        bookingRepository.countByDayOfWeek().forEach(row -> {
            try {
                if (row[0] == null) return;
                String dayStr = row[0].toString().trim();
                if (dayStr.isEmpty()) return;
                int dayIdx = Integer.parseInt(dayStr);
                if (dayIdx < 0 || dayIdx > 6) return;
                Map<String, Object> day = new LinkedHashMap<>();
                day.put("day", dayNames[dayIdx]);
                day.put("count", row[1]);
                dayData.add(day);
            } catch (NumberFormatException e) {
                // Non-numeric day label from DB; ignore this bucket.
            }
        });
        analytics.put("bookingsByDay", dayData);

        return analytics;
    }
}
