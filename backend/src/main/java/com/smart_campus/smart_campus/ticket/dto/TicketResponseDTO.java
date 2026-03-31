package com.smart_campus.smart_campus.ticket.dto;

import com.smart_campus.smart_campus.ticket.entity.Ticket.TicketCategory;
import com.smart_campus.smart_campus.ticket.entity.Ticket.TicketPriority;
import com.smart_campus.smart_campus.ticket.entity.Ticket.TicketStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TicketResponseDTO {
    private Long id;
    private String reporterName;
    private String resourceName;
    private String assigneeName;
    private String title;
    private String description;
    private TicketStatus status;
    private TicketPriority priority;
    private TicketCategory category;
    private String preferredContact;
    private String rejectionReason;
    private String resolutionNotes;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
