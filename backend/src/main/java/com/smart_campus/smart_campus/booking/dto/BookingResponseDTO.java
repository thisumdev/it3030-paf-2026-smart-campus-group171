package com.smart_campus.smart_campus.booking.dto;

import com.smart_campus.smart_campus.booking.entity.Booking;
import com.smart_campus.smart_campus.booking.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDTO {

    private Long id;
    private Long resourceId;
    private String resourceName;
    private String resourceLocation;
    private Long userId;
    private String userName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer attendees;
    private BookingStatus status;
    private String rejectionReason;
    private boolean checkedIn;
    private LocalDateTime checkedInAt;
    private LocalDateTime createdAt;
    private boolean recurring;
    private String recurrenceGroupId;
    private java.time.LocalDate recurrenceEndDate;

    public static BookingResponseDTO fromEntity(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .resourceId(booking.getResource().getId())
                .resourceName(booking.getResource().getName())
                .resourceLocation(booking.getResource().getLocation())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getFullName())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .attendees(booking.getAttendees())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .checkedIn(booking.getCheckedInAt() != null)
                .checkedInAt(booking.getCheckedInAt())
                .createdAt(booking.getCreatedAt())
                .recurring(booking.isRecurring())
                .recurrenceGroupId(booking.getRecurrenceGroupId())
                .recurrenceEndDate(booking.getRecurrenceEndDate())
                .build();
    }
}
