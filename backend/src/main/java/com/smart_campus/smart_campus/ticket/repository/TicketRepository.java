package com.smart_campus.smart_campus.ticket.repository;

import com.smart_campus.smart_campus.ticket.entity.Ticket;
import com.smart_campus.smart_campus.ticket.entity.Ticket.TicketStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @EntityGraph(attributePaths = {"reporter", "resource", "assignee", "images"})
    List<Ticket> findByReporterId(Long reporterId);

    @EntityGraph(attributePaths = {"reporter", "resource", "assignee", "images"})
    List<Ticket> findByStatus(TicketStatus status);

    @EntityGraph(attributePaths = {"reporter", "resource", "assignee", "images"})
    List<Ticket> findByAssigneeId(Long assigneeId);

    @EntityGraph(attributePaths = {"reporter", "resource", "assignee", "images"})
    Optional<Ticket> findById(Long id);

    @EntityGraph(attributePaths = {"reporter", "resource", "assignee", "images"})
    List<Ticket> findAll();
}