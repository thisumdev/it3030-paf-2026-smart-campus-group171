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
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    // POST /api/tickets — any logged-in user creates a ticket
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> createTicket(
            @Valid @RequestBody TicketRequestDTO request,
            @AuthenticationPrincipal User user) {
        TicketResponseDTO ticket = ticketService.createTicket(request, user.getId());
        return ResponseEntity.status(201).body(ApiResponse.created("Ticket created", ticket));
    }

    // GET /api/tickets — ADMIN sees all tickets
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TicketResponseDTO>>> getAllTickets() {
        return ResponseEntity.ok(ApiResponse.success("Tickets retrieved", ticketService.getAllTickets()));
    }

    // GET /api/tickets/my — logged-in user sees their own tickets
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<TicketResponseDTO>>> getMyTickets(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success("Tickets retrieved", ticketService.getMyTickets(user.getId())));
    }

    // GET /api/tickets/{id} — get a single ticket by ID
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Ticket retrieved", ticketService.getTicketById(id)));
    }

    // PATCH /api/tickets/{id}/status — ADMIN or TECHNICIAN updates status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated", ticketService.updateStatus(id, dto)));
    }

    // DELETE /api/tickets/{id} — ADMIN deletes a ticket
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.status(204).body(ApiResponse.noContent("Ticket deleted"));
    }

    // POST /api/tickets/{id}/images — upload up to 3 images as evidence
    @PostMapping("/{id}/images")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> uploadImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) {
        return ResponseEntity.ok(ApiResponse.success("Images uploaded", ticketService.uploadImages(id, files)));
    }
}
