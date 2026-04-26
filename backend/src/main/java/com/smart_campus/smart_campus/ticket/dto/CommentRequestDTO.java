package com.smart_campus.smart_campus.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequestDTO {

    @NotBlank(message = "Comment cannot be empty")
    private String commentText;
}