package com.smart_campus.smart_campus.ticket.repository;

import com.smart_campus.smart_campus.ticket.entity.TicketImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketImageRepository extends JpaRepository<TicketImage, Long> {
    List<TicketImage> findByTicketId(Long ticketId);
    long countByTicketId(Long ticketId);
}