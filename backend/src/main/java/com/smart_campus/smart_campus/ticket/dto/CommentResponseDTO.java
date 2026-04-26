package com.smart_campus.smart_campus.ticket.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponseDTO {
    private Long id;
    private String authorName;
    private String commentText;
    private LocalDateTime createdAt;
}
