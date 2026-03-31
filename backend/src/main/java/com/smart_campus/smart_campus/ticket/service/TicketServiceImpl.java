package com.smart_campus.smart_campus.ticket.service;

import com.smart_campus.smart_campus.facility.repository.ResourceRepository;
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

    private static final String UPLOAD_DIR = "uploads/tickets/";
    private static final int MAX_IMAGES = 3;

    // ─── CREATE TICKET ───────────────────────────────────────────────
    @Override
    @Transactional
    public TicketResponseDTO createTicket(TicketRequestDTO request, Long reporterId) {
        var reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        var resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

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
                .orElseThrow(() -> new RuntimeException("Ticket not found")));
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

    // ─── UPDATE STATUS ───────────────────────────────────────────────
    @Override
    @Transactional
    public TicketResponseDTO updateStatus(Long ticketId, StatusUpdateDTO dto) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(dto.getStatus());

        if (dto.getStatus() == TicketStatus.REJECTED) {
            ticket.setRejectionReason(dto.getReason());
        }
        if (dto.getStatus() == TicketStatus.RESOLVED) {
            ticket.setResolutionNotes(dto.getResolutionNotes());
            ticket.setResolvedAt(LocalDateTime.now());
        }
        if (dto.getAssigneeId() != null) {
            var assignee = userRepository.findById(dto.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            ticket.setAssignee(assignee);
        }

        return mapToResponse(ticketRepository.save(ticket));
    }

    // ─── DELETE TICKET ───────────────────────────────────────────────
    @Override
    @Transactional
    public void deleteTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticketRepository.delete(ticket);
    }

    // ─── UPLOAD IMAGES (max 3) ───────────────────────────────────────
    @Override
    @Transactional
    public TicketResponseDTO uploadImages(Long ticketId, List<MultipartFile> files) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        long existing = ticketImageRepository.countByTicketId(ticketId);
        if (existing + files.size() > MAX_IMAGES) {
            throw new RuntimeException("Maximum " + MAX_IMAGES + " images allowed per ticket");
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            Files.createDirectories(uploadPath);

            for (MultipartFile file : files) {
                String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(filename);
                Files.copy(file.getInputStream(), filePath,
                        StandardCopyOption.REPLACE_EXISTING);

                TicketImage image = TicketImage.builder()
                        .ticket(ticket)
                        .imageUrl(UPLOAD_DIR + filename)
                        .build();
                ticketImageRepository.save(image);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to store image: " + e.getMessage());
        }

        return mapToResponse(ticketRepository.findById(ticketId).get());
    }

    // ─── ADD COMMENT ─────────────────────────────────────────────────
    @Override
    @Transactional
    public CommentResponseDTO addComment(Long ticketId, CommentRequestDTO dto, Long authorId) {
        var ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        var author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

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
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getAuthor().getId().equals(currentUserId)) {
            throw new RuntimeException("Not authorized to delete this comment");
        }
        ticketCommentRepository.delete(comment);
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
