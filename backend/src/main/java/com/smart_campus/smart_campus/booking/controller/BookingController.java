package com.smart_campus.smart_campus.booking.controller;

import com.smart_campus.smart_campus.booking.dto.BookingRequestDTO;
import com.smart_campus.smart_campus.booking.dto.BookingResponseDTO;
import com.smart_campus.smart_campus.booking.dto.BookingStatusUpdateDTO;
import com.smart_campus.smart_campus.booking.entity.BookingStatus;
import com.smart_campus.smart_campus.booking.service.BookingReportService;
import com.smart_campus.smart_campus.booking.service.BookingService;
import com.smart_campus.smart_campus.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for managing facility bookings
 * Handles creation, retrieval, approval, cancellation, and reporting of bookings
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final BookingReportService bookingReportService;

    // ========== CREATE OPERATIONS ==========

    /** Create a new booking for the authenticated user */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> createBooking(@RequestBody @Valid BookingRequestDTO dto,
                                           org.springframework.security.core.Authentication auth) {
        Long userId = ((com.smart_campus.smart_campus.user.entity.User) auth.getPrincipal()).getId();
        List<BookingResponseDTO> result = bookingService.createBooking(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // ========== RETRIEVE OPERATIONS ==========

    /** Retrieve all bookings (Admin only) */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    /** Get current user's active bookings */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    /** Get current user's booking history (past and completed) */
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getBookingHistory() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(bookingService.getBookingHistory(userId));
    }

    /** Get booking statistics and analytics (Admin only) */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getBookingAnalytics() {
        return ResponseEntity.ok(bookingService.getBookingAnalytics());
    }

    /** Generate daily booking report as PDF (Admin only) */
    @GetMapping("/report/daily")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> generateDailyReport(
            @RequestParam(required = false) String date) {
        try {
            LocalDate reportDate = (date != null && !date.isEmpty())
                    ? LocalDate.parse(date)
                    : LocalDate.now();
            byte[] pdfBytes = bookingReportService.generateDailyReport(reportDate);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    "booking-report-" + reportDate + ".pdf");
            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /** Get specific booking details by ID */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // ========== APPROVAL/REJECTION OPERATIONS ==========

    /** Approve a pending booking (Admin only) */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> approveBooking(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(bookingService.approveBooking(id, userId));
    }

    /** Reject a pending booking with reason (Admin only) */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> rejectBooking(
            @PathVariable Long id,
            @RequestBody BookingStatusUpdateDTO dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(bookingService.rejectBooking(id, userId, dto.getReason()));
    }

    /** Cancel a single booking */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId));
    }

    // ========== RECURRING BOOKING OPERATIONS ==========

    /** Cancel all bookings in a recurring series */
    @PutMapping("/recurring/{groupId}/cancel")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> cancelRecurringSeries(@PathVariable String groupId,
                                                   org.springframework.security.core.Authentication auth) {
        Long userId = ((com.smart_campus.smart_campus.user.entity.User) auth.getPrincipal()).getId();
        bookingService.cancelRecurringSeries(groupId, userId);
        return ResponseEntity.ok(Map.of("message", "Recurring series cancelled successfully"));
    }

    /** Approve all bookings in a recurring series (Admin only) */
    @PutMapping("/recurring/{groupId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveRecurringSeries(
            @PathVariable String groupId,
            org.springframework.security.core.Authentication auth) {
        Long adminId = ((com.smart_campus.smart_campus.user.entity.User) auth.getPrincipal()).getId();
        bookingService.approveRecurringSeries(groupId, adminId);
        return ResponseEntity.ok(Map.of("message", "All sessions approved successfully"));
    }

    /** Reject all bookings in a recurring series (Admin only) */
    @PutMapping("/recurring/{groupId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectRecurringSeries(
            @PathVariable String groupId,
            @RequestBody BookingStatusUpdateDTO dto,
            org.springframework.security.core.Authentication auth) {
        Long adminId = ((com.smart_campus.smart_campus.user.entity.User) auth.getPrincipal()).getId();
        bookingService.rejectRecurringSeries(groupId, adminId, dto.getReason());
        return ResponseEntity.ok(Map.of("message", "All sessions rejected"));
    }

    // ========== CHECK-IN & CALENDAR OPERATIONS ==========

    /** Perform check-in using token (public endpoint) */
    @PostMapping("/checkin")
    public ResponseEntity<BookingResponseDTO> checkIn(@RequestParam String token) {
        return ResponseEntity.ok(bookingService.checkIn(token));
    }

    /** Get public calendar events for resource (public endpoint) */
    @GetMapping("/public/calendar")
    public ResponseEntity<List<Map<String, Object>>> getPublicCalendarEvents(
            @RequestParam(required = false) Long resourceId) {
        return ResponseEntity.ok(bookingService.getPublicCalendarEvents(resourceId));
    }

    /** Get all checked-in bookings (Admin only) */
    @GetMapping("/checkins")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCheckedInBookings() {
        return ResponseEntity.ok(bookingService.getCheckedInBookings());
    }

    /** Get no-show bookings (auto-cancelled) (Admin only) */
    @GetMapping("/no-shows")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getNoShowBookings() {
        return ResponseEntity.ok(bookingService.getBookingsByStatus(BookingStatus.AUTO_CANCELLED));
    }

    // ========== DELETE/RESTORE OPERATIONS ==========

    /** Restore a previously deleted booking (Admin only) */
    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> restoreBooking(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long adminId = ((com.smart_campus.smart_campus.user.entity.User) auth.getPrincipal()).getId();
        return ResponseEntity.ok(bookingService.restoreBooking(id, adminId));
    }

    /** Permanently delete a booking (Admin only) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok(Map.of("message", "Booking deleted successfully"));
    }

    // ========== HELPER METHODS ==========

    /** Extract current authenticated user's ID */
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((User) auth.getPrincipal()).getId();
    }
}
