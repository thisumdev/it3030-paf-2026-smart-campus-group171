package com.smart_campus.smart_campus.ticket.dto;

import com.smart_campus.smart_campus.ticket.entity.Ticket.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateDTO {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    private String reason;           // used when status = REJECTED
    private String resolutionNotes;  // used when status = RESOLVED
    private Long assigneeId;         // used to assign a technician
}