package com.smart_campus.smart_campus.booking.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Validated in service: endTime must be after startTime
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDTO {

    @NotNull
    private Long resourceId;

    @NotNull
    @Future
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    @NotBlank
    @Size(max = 500)
    private String purpose;

    @Min(1)
    private Integer attendees;

    private boolean recurring = false;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd")
    private java.time.LocalDate recurrenceEndDate;
}
