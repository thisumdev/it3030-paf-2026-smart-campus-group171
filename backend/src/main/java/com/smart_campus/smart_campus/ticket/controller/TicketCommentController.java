package com.smart_campus.smart_campus.ticket.controller;

import com.smart_campus.smart_campus.ticket.dto.*;
import com.smart_campus.smart_campus.ticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CommentRequestDTO dto,
            @AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.parseLong(jwt.getSubject());
        return ResponseEntity.status(201)
                .body(ticketService.addComment(ticketId, dto, userId));
    }

    // GET /api/tickets/{ticketId}/comments — get all comments on a ticket
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CommentResponseDTO>> getComments(
            @PathVariable Long ticketId) {
        return ResponseEntity.ok(ticketService.getComments(ticketId));
    }

    // DELETE /api/tickets/{ticketId}/comments/{commentId} — delete own comment
    @DeleteMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.parseLong(jwt.getSubject());
        ticketService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}
