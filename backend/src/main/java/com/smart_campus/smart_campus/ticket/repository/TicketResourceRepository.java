package com.smart_campus.smart_campus.ticket.repository;

import com.smart_campus.smart_campus.facility.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketResourceRepository extends JpaRepository<Resource, Long> {
}
