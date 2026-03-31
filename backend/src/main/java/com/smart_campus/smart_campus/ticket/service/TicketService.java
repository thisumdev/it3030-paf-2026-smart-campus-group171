package com.smart_campus.smart_campus.ticket.service;

import com.smart_campus.smart_campus.ticket.dto.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface TicketService {
    TicketResponseDTO createTicket(TicketRequestDTO request, Long reporterId);
    TicketResponseDTO getTicketById(Long id);
    List<TicketResponseDTO> getAllTickets();
    List<TicketResponseDTO> getMyTickets(Long userId);
    TicketResponseDTO updateStatus(Long ticketId, StatusUpdateDTO dto);
    void deleteTicket(Long ticketId);
    TicketResponseDTO uploadImages(Long ticketId, List<MultipartFile> files);
    CommentResponseDTO addComment(Long ticketId, CommentRequestDTO dto, Long authorId);
    List<CommentResponseDTO> getComments(Long ticketId);
    void deleteComment(Long commentId, Long currentUserId);
}