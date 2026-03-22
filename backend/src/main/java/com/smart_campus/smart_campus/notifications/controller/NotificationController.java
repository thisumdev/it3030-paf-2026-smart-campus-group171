package com.smart_campus.smart_campus.notifications.controller;

import com.smart_campus.smart_campus.core.util.ApiResponse;
import com.smart_campus.smart_campus.notifications.dto.NotificationResponse;
import com.smart_campus.smart_campus.notifications.dto.SendNotificationRequest;
import com.smart_campus.smart_campus.notifications.dto.UnreadCountResponse;
import com.smart_campus.smart_campus.notifications.entity.Notification;
import com.smart_campus.smart_campus.notifications.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // ─────────────────────────────────────────────────────────────────────────
    // USER-FACING ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/notifications
     * Returns current user's full notification list, newest first.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications() {
        return ResponseEntity.ok(
                ApiResponse.success("Notifications retrieved", notificationService.getMyNotifications())
        );
    }

    /**
     * GET /api/notifications/bell
     * Returns last 5 notifications for the bell dropdown.
     */
    @GetMapping("/bell")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getBellNotifications() {
        return ResponseEntity.ok(
                ApiResponse.success("Bell notifications retrieved", notificationService.getMyRecentForBell())
        );
    }

    /**
     * GET /api/notifications/unread-count
     * Returns { "count": N } — polled every 30s by the bell badge.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(
                ApiResponse.success("Unread count", new UnreadCountResponse(count))
        );
    }

    /**
     * PUT /api/notifications/{id}/read
     * Marks a single notification as read. Must be owned by caller.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.noContent("Notification marked as read"));
    }

    /**
     * PUT /api/notifications/read-all
     * Marks every unread notification for the current user as read.
     */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.noContent("All notifications marked as read"));
    }

    /**
     * DELETE /api/notifications/{id}
     * Deletes a notification owned by the current user.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMyNotification(@PathVariable Long id) {
        notificationService.deleteMyNotification(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.noContent("Notification deleted"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN — SEND
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/notifications/send
     * Admin creates and sends notification(s).
     * targetType controls routing: USER | SELECTED | ROLE | ALL
     */
    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> send(
            @Valid @RequestBody SendNotificationRequest req) {
        notificationService.adminSend(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.noContent("Notification(s) sent successfully"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN — MANAGE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/notifications/admin/all
     * Returns all notifications with optional filters.
     * Query params: userId, type, isRead
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAllNotifications(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Notification.NotificationType type,
            @RequestParam(required = false) Boolean isRead) {

        List<NotificationResponse> list =
                notificationService.getAllNotifications(userId, type, isRead);
        return ResponseEntity.ok(ApiResponse.success("All notifications retrieved", list));
    }

    /**
     * PUT /api/notifications/admin/{id}
     * Admin edits title and/or message of any notification.
     * Body: { "title": "...", "message": "..." }
     */
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NotificationResponse>> adminUpdate(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        NotificationResponse updated = notificationService.adminUpdate(
                id, body.get("title"), body.get("message"));
        return ResponseEntity.ok(ApiResponse.success("Notification updated", updated));
    }

    /**
     * DELETE /api/notifications/admin/{id}
     * Admin deletes any notification regardless of owner.
     */
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> adminDelete(@PathVariable Long id) {
        notificationService.adminDelete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.noContent("Notification deleted"));
    }
}

