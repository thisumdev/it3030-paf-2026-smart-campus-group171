package com.smart_campus.smart_campus.ticket.repository;

import com.smart_campus.smart_campus.ticket.entity.Ticket;
import com.smart_campus.smart_campus.ticket.entity.Ticket.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReporterId(Long reporterId);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByAssigneeId(Long assigneeId);
}