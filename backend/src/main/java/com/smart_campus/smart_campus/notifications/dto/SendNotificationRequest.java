package com.smart_campus.smart_campus.notifications.dto;

import com.smart_campus.smart_campus.notifications.entity.Notification;
import com.smart_campus.smart_campus.user.entity.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

/**
 * Single DTO for all admin send modes.
 *
 * targetType → required fields:
 *   "USER"     → userId
 *   "SELECTED" → userIds
 *   "ROLE"     → role
 *   "ALL"      → (none)
 */
@Data
public class SendNotificationRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "targetType is required: USER | SELECTED | ROLE | ALL")
    private String targetType;

    // Conditional — checked in service based on targetType
    private Long userId;
    private List<Long> userIds;
    private User.Role role;

    // Optional — for booking/ticket manual sends from admin panel
    private Notification.NotificationType type;  // defaults to GENERAL if null
    private Long referenceId;
    private String referenceType;
}
