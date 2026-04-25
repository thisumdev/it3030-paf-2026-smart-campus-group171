package com.smart_campus.smart_campus.booking.exception;

public class BookingNotAuthorizedException extends RuntimeException {

    public BookingNotAuthorizedException() {
        super("You are not authorized to perform this action on this booking");
    }
}
