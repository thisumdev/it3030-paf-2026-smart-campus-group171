package com.smart_campus.smart_campus.core.exception;


import com.smart_campus.smart_campus.booking.exception.BookingConflictException;
import com.smart_campus.smart_campus.booking.exception.BookingNotAuthorizedException;
import com.smart_campus.smart_campus.booking.exception.BookingNotFoundException;
import com.smart_campus.smart_campus.core.util.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── Validation Errors (@Valid) ───────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(400, "Validation failed", fieldErrors));
    }

    // ── 404 Not Found ────────────────────────────────
    @ExceptionHandler(CustomExceptions.ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(
            CustomExceptions.ResourceNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(404, ex.getMessage()));
    }

    // ── 409 Conflict ─────────────────────────────────
    @ExceptionHandler({
            CustomExceptions.ResourceConflictException.class,
            CustomExceptions.BookingConflictException.class
    })
    public ResponseEntity<ApiResponse<Void>> handleConflict(RuntimeException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(409, ex.getMessage()));
    }

    // ── 400 Bad Request ──────────────────────────────
    @ExceptionHandler({
            CustomExceptions.BadRequestException.class,
            CustomExceptions.FileUploadException.class
    })
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(RuntimeException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(400, ex.getMessage()));
    }

    // ── 403 Forbidden ────────────────────────────────
    @ExceptionHandler({
            CustomExceptions.ForbiddenException.class,
            AccessDeniedException.class
    })
    public ResponseEntity<ApiResponse<Void>> handleForbidden(RuntimeException ex) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(403, ex.getMessage()));
    }

    // ── 401 Unauthorized ─────────────────────────────
    @ExceptionHandler({
            CustomExceptions.UnauthorizedException.class,
            AuthenticationException.class
    })
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(RuntimeException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(401, ex.getMessage()));
    }

    // ── 422 Unprocessable ────────────────────────────
    @ExceptionHandler(CustomExceptions.UnprocessableEntityException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnprocessable(
            CustomExceptions.UnprocessableEntityException ex) {

        return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiResponse.error(422, ex.getMessage()));
    }

    // ── Type Mismatch (e.g. string passed for Long id) ──
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex) {

        String message = String.format(
                "Invalid value '%s' for parameter '%s'",
                ex.getValue(), ex.getName()
        );
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(400, message));
    }

    // ── Booking: 404 Not Found ───────────────────────
    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleBookingNotFound(BookingNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "BOOKING_NOT_FOUND", "message", ex.getMessage()));
    }

    // ── Booking: 409 Conflict ────────────────────────
    @ExceptionHandler(BookingConflictException.class)
    public ResponseEntity<Map<String, Object>> handleBookingConflict(BookingConflictException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "BOOKING_CONFLICT");
        body.put("message", ex.getMessage());
        body.put("conflictingSlot", Map.of(
                "start", ex.getConflictingStart(),
                "end", ex.getConflictingEnd()
        ));
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    // ── Booking: 403 Forbidden ───────────────────────
    @ExceptionHandler(BookingNotAuthorizedException.class)
    public ResponseEntity<Map<String, String>> handleBookingNotAuthorized(BookingNotAuthorizedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "FORBIDDEN", "message", ex.getMessage()));
    }

    // ── 400 Illegal State ────────────────────────────
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "INVALID_STATE", "message", ex.getMessage()));
    }

    // ── 400 Illegal Argument ─────────────────────────
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "INVALID_ARGUMENT", "message", ex.getMessage()));
    }

    // ── 500 Catch-All ────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500,
                        "An unexpected error occurred. Please try again later."));
    }
}