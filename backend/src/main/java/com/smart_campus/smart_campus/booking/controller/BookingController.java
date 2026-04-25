package com.smart_campus.smart_campus.booking.controller;

import com.smart_campus.smart_campus.booking.dto.BookingRequestDTO;
import com.smart_campus.smart_campus.booking.dto.BookingResponseDTO;
import com.smart_campus.smart_campus.booking.dto.BookingStatusUpdateDTO;
import com.smart_campus.smart_campus.booking.entity.BookingStatus;
import com.smart_campus.smart_campus.booking.service.BookingService;
import com.smart_campus.smart_campus.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<BookingResponseDTO> createBooking(@RequestBody @Valid BookingRequestDTO dto) {
        Long userId = getCurrentUserId();
        BookingResponseDTO result = bookingService.createBooking(userId, dto);
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
