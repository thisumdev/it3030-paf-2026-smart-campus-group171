package com.smart_campus.smart_campus.ticket.dto;

import com.smart_campus.smart_campus.ticket.entity.Ticket.TicketCategory;
import com.smart_campus.smart_campus.ticket.entity.Ticket.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotNull(message = "Resource ID is required")
    private Long resourceId;

    private String preferredContact;
}