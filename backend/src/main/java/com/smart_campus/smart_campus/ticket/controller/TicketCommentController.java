package com.smart_campus.smart_campus.ticket.controller;

import com.smart_campus.smart_campus.core.util.ApiResponse;
import com.smart_campus.smart_campus.ticket.dto.*;
import com.smart_campus.smart_campus.ticket.service.TicketService;
import com.smart_campus.smart_campus.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class TicketCommentController {

    private final TicketService ticketService;

    // POST /api/tickets/{ticketId}/comments — add a comment
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CommentResponseDTO>> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CommentRequestDTO dto,
            @AuthenticationPrincipal User user) {
        CommentResponseDTO comment = ticketService.addComment(ticketId, dto, user.getId());
        return ResponseEntity.status(201).body(ApiResponse.created("Comment added", comment));
    }

    // GET /api/tickets/{ticketId}/comments — get all comments on a ticket
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<CommentResponseDTO>>> getComments(
            @PathVariable Long ticketId) {
        return ResponseEntity.ok(ApiResponse.success("Comments retrieved", ticketService.getComments(ticketId)));
    }

    // DELETE /api/tickets/{ticketId}/comments/{commentId} — delete own comment
    @DeleteMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user) {
        ticketService.deleteComment(commentId, user.getId());
        return ResponseEntity.status(204).body(ApiResponse.noContent("Comment deleted"));
    }
}
