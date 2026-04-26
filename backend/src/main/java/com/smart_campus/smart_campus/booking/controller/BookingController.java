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

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final BookingReportService bookingReportService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> createBooking(@RequestBody @Valid BookingRequestDTO dto,
                                           org.springframework.security.core.Authentication auth) {
        Long userId = ((com.smart_campus.smart_campus.user.entity.User) auth.getPrincipal()).getId();
        List<BookingResponseDTO> result = bookingService.createBooking(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getBookingHistory() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(bookingService.getBookingHistory(userId));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getBookingAnalytics() {
        return ResponseEntity.ok(bookingService.getBookingAnalytics());
    }

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

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> approveBooking(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(bookingService.approveBooking(id, userId));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> rejectBooking(
            @PathVariable Long id,
            @RequestBody BookingStatusUpdateDTO dto) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(bookingService.rejectBooking(id, userId, dto.getReason()));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId));
    }

    @PutMapping("/recurring/{groupId}/cancel")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> cancelRecurringSeries(@PathVariable String groupId,
                                                   org.springframework.security.core.Authentication auth) {
        Long userId = ((com.smart_campus.smart_campus.user.entity.User) auth.getPrincipal()).getId();
        bookingService.cancelRecurringSeries(groupId, userId);
        return ResponseEntity.ok(Map.of("message", "Recurring series cancelled successfully"));
    }

    @PutMapping("/recurring/{groupId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveRecurringSeries(
            @PathVariable String groupId,
            org.springframework.security.core.Authentication auth) {
        Long adminId = ((com.smart_campus.smart_campus.user.entity.User) auth.getPrincipal()).getId();
        bookingService.approveRecurringSeries(groupId, adminId);
        return ResponseEntity.ok(Map.of("message", "All sessions approved successfully"));
    }

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

    @PostMapping("/checkin")
    public ResponseEntity<BookingResponseDTO> checkIn(@RequestParam String token) {
        return ResponseEntity.ok(bookingService.checkIn(token));
    }

    @GetMapping("/public/calendar")
    public ResponseEntity<List<Map<String, Object>>> getPublicCalendarEvents(
            @RequestParam(required = false) Long resourceId) {
        return ResponseEntity.ok(bookingService.getPublicCalendarEvents(resourceId));
    }

    @GetMapping("/checkins")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCheckedInBookings() {
        return ResponseEntity.ok(bookingService.getCheckedInBookings());
    }

    @GetMapping("/no-shows")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getNoShowBookings() {
        return ResponseEntity.ok(bookingService.getBookingsByStatus(BookingStatus.AUTO_CANCELLED));
    }

    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> restoreBooking(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long adminId = ((com.smart_campus.smart_campus.user.entity.User) auth.getPrincipal()).getId();
        return ResponseEntity.ok(bookingService.restoreBooking(id, adminId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok(Map.of("message", "Booking deleted successfully"));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((User) auth.getPrincipal()).getId();
    }
}
