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
    public ResponseEntity<TicketResponseDTO> createTicket(
            @Valid @RequestBody TicketRequestDTO request,
            @AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.parseLong(jwt.getSubject());
        return ResponseEntity.status(201).body(ticketService.createTicket(request, userId));
    }

    // GET /api/tickets — ADMIN sees all tickets
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // GET /api/tickets/my — logged-in user sees their own tickets
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(
            @AuthenticationPrincipal Jwt jwt) {
        Long userId = Long.parseLong(jwt.getSubject());
        return ResponseEntity.ok(ticketService.getMyTickets(userId));
    }

    // GET /api/tickets/{id} — get a single ticket by ID
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // PATCH /api/tickets/{id}/status — ADMIN or TECHNICIAN updates status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<TicketResponseDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDTO dto) {
        return ResponseEntity.ok(ticketService.updateStatus(id, dto));
    }

    // DELETE /api/tickets/{id} — ADMIN deletes a ticket
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/tickets/{id}/images — upload up to 3 images as evidence
    @PostMapping("/{id}/images")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponseDTO> uploadImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) {
        return ResponseEntity.ok(ticketService.uploadImages(id, files));
    }
}