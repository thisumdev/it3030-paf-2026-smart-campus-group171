package com.smart_campus.smart_campus.ticket.service;

import com.smart_campus.smart_campus.core.exception.CustomExceptions.BadRequestException;
import com.smart_campus.smart_campus.core.exception.CustomExceptions.ForbiddenException;
import com.smart_campus.smart_campus.core.exception.CustomExceptions.ResourceNotFoundException;
import com.smart_campus.smart_campus.core.exception.CustomExceptions.FileUploadException;
import com.smart_campus.smart_campus.notifications.entity.Notification.NotificationType;
import com.smart_campus.smart_campus.notifications.service.NotificationService;
import com.smart_campus.smart_campus.ticket.repository.ResourceRepository;
import com.smart_campus.smart_campus.ticket.entity.Ticket.TicketStatus;
import com.smart_campus.smart_campus.ticket.dto.*;
import com.smart_campus.smart_campus.ticket.entity.*;
import com.smart_campus.smart_campus.ticket.repository.*;
import com.smart_campus.smart_campus.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final TicketImageRepository ticketImageRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    private static final String UPLOAD_DIR = "uploads/tickets/";
    private static final int MAX_IMAGES = 3;

    // ─── CREATE TICKET ───────────────────────────────────────────────
    @Override
    @Transactional
    public TicketResponseDTO createTicket(TicketRequestDTO request, Long reporterId) {
        var reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", reporterId));
        var resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource", request.getResourceId()));

        Ticket ticket = Ticket.builder()
                .reporter(reporter)
                .resource(resource)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .category(request.getCategory())
                .preferredContact(request.getPreferredContact())
                .status(TicketStatus.OPEN)
                .build();

        return mapToResponse(ticketRepository.save(ticket));
    }

    // ─── GET SINGLE TICKET ───────────────────────────────────────────
    @Override
    public TicketResponseDTO getTicketById(Long id) {
        return mapToResponse(ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id)));
    }

    // ─── GET ALL TICKETS (admin) ─────────────────────────────────────
    @Override
    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── GET MY TICKETS (user) ───────────────────────────────────────
    @Override
    public List<TicketResponseDTO> getMyTickets(Long userId) {
        return ticketRepository.findByReporterId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── GET ASSIGNED TICKETS (technician) ──────────────────────────
    @Override
    public List<TicketResponseDTO> getAssignedTickets(Long technicianId) {
        return ticketRepository.findByAssigneeId(technicianId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── UPDATE STATUS ───────────────────────────────────────────────
    @Override
    @Transactional
    public TicketResponseDTO updateStatus(Long ticketId, StatusUpdateDTO dto) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));

        ticket.setStatus(dto.getStatus());

        if (dto.getStatus() == TicketStatus.REJECTED) {
            if (dto.getReason() == null || dto.getReason().isBlank()) {
                throw new BadRequestException("Rejection reason is required");
            }
            ticket.setRejectionReason(dto.getReason());
        }
        if (dto.getStatus() == TicketStatus.RESOLVED) {
            ticket.setResolutionNotes(dto.getResolutionNotes());
            ticket.setResolvedAt(LocalDateTime.now());
        }
        if (dto.getAssigneeId() != null) {
            var assignee = userRepository.findById(dto.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee", dto.getAssigneeId()));
            ticket.setAssignee(assignee);
            notificationService.notify(
                    assignee.getId(),
                    NotificationType.TICKET_ASSIGNED,
                    "You have been assigned to ticket: '" + ticket.getTitle() + "'.",
                    ticket.getId(), "TICKET");
        }

        Ticket saved = ticketRepository.save(ticket);
        Long reporterId = saved.getReporter().getId();

        switch (dto.getStatus()) {
            case IN_PROGRESS -> notificationService.notify(
                    reporterId, NotificationType.TICKET_IN_PROGRESS,
                    "Your ticket '" + saved.getTitle() + "' is now being worked on.",
                    saved.getId(), "TICKET");
            case RESOLVED -> notificationService.notify(
                    reporterId, NotificationType.TICKET_RESOLVED,
                    "Your ticket '" + saved.getTitle() + "' has been resolved.",
                    saved.getId(), "TICKET");
            case REJECTED -> notificationService.notify(
                    reporterId, NotificationType.TICKET_REJECTED,
                    "Your ticket '" + saved.getTitle() + "' has been rejected.",
                    saved.getId(), "TICKET");
            case CLOSED -> notificationService.notify(
                    reporterId, NotificationType.TICKET_CLOSED,
                    "Your ticket '" + saved.getTitle() + "' has been closed.",
                    saved.getId(), "TICKET");
            default -> { }
        }

        return mapToResponse(saved);
    }

    // ─── DELETE TICKET ───────────────────────────────────────────────
    @Override
    @Transactional
    public void deleteTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));
        ticketRepository.delete(ticket);
    }

    // ─── UPLOAD IMAGES (max 3) ───────────────────────────────────────
    @Override
    @Transactional
    public TicketResponseDTO uploadImages(Long ticketId, List<MultipartFile> files) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));

        long existing = ticketImageRepository.countByTicketId(ticketId);
        if (existing + files.size() > MAX_IMAGES) {
            throw new BadRequestException("Maximum " + MAX_IMAGES + " images allowed per ticket");
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            Files.createDirectories(uploadPath);

            for (MultipartFile file : files) {
                String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(filename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                TicketImage image = TicketImage.builder()
                        .ticket(ticket)
                        .imageUrl(UPLOAD_DIR + filename)
                        .build();
                ticketImageRepository.save(image);
            }
        } catch (IOException e) {
            throw new FileUploadException("Failed to store image: " + e.getMessage());
        }

        return mapToResponse(ticketRepository.findById(ticketId).get());
    }

    // ─── ADD COMMENT ─────────────────────────────────────────────────
    @Override
    @Transactional
    public CommentResponseDTO addComment(Long ticketId, CommentRequestDTO dto, Long authorId) {
        var ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId));
        var author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", authorId));

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .author(author)
                .commentText(dto.getCommentText())
                .build();

        return mapToComment(ticketCommentRepository.save(comment));
    }

    // ─── GET COMMENTS ────────────────────────────────────────────────
    @Override
    public List<CommentResponseDTO> getComments(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket", ticketId);
        }
        return ticketCommentRepository
                .findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::mapToComment)
                .collect(Collectors.toList());
    }

    // ─── DELETE COMMENT ──────────────────────────────────────────────
    @Override
    @Transactional
    public void deleteComment(Long commentId, Long currentUserId) {
        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        if (!comment.getAuthor().getId().equals(currentUserId)) {
            throw new ForbiddenException("You can only delete your own comments");
        }
        ticketCommentRepository.delete(comment);
    }

    // ─── LIST RESOURCES ──────────────────────────────────────────────
    @Override
    public List<ResourceDTO> getResources() {
        return resourceRepository.findAll().stream()
                .map(r -> ResourceDTO.builder()
                        .id(r.getId())
                        .name(r.getName())
                        .location(r.getLocation())
                        .build())
                .collect(Collectors.toList());
    }

    // ─── MAPPERS ─────────────────────────────────────────────────────
    private TicketResponseDTO mapToResponse(Ticket ticket) {
        return TicketResponseDTO.builder()
                .id(ticket.getId())
                .reporterName(ticket.getReporter().getFullName())
                .resourceName(ticket.getResource().getName())
                .assigneeName(ticket.getAssignee() != null
                        ? ticket.getAssignee().getFullName() : null)
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .category(ticket.getCategory())
                .preferredContact(ticket.getPreferredContact())
                .rejectionReason(ticket.getRejectionReason())
                .resolutionNotes(ticket.getResolutionNotes())
                .imageUrls(ticket.getImages().stream()
                        .map(TicketImage::getImageUrl)
                        .collect(Collectors.toList()))
                .createdAt(ticket.getCreatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .build();
    }

    private CommentResponseDTO mapToComment(TicketComment c) {
        return CommentResponseDTO.builder()
                .id(c.getId())
                .authorName(c.getAuthor().getFullName())
                .commentText(c.getCommentText())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
