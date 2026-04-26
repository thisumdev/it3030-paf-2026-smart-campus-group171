package com.smart_campus.smart_campus.booking.exception;

import lombok.Getter;

@Getter
public class BookingConflictException extends RuntimeException {

    private final String conflictingStart;
    private final String conflictingEnd;

    public BookingConflictException(String conflictingStart, String conflictingEnd) {
        super("Booking conflict: " + conflictingStart);
        this.conflictingStart = conflictingStart;
        this.conflictingEnd = conflictingEnd;
    }
}
