package com.smart_campus.smart_campus.notifications.repository;

import com.smart_campus.smart_campus.facility.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository
        extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {

    // Used for conflict detection by type/location in admin add flow
    boolean existsByNameIgnoreCase(String name);

    // Analytics: count by status
    long countByStatus(Resource.ResourceStatus status);

    // Analytics: top booked resources — joins bookings table
    @Query("""
        SELECT r, COUNT(b.id) AS bookingCount
        FROM Resource r
        LEFT JOIN Booking b ON b.resource.id = r.id
        GROUP BY r.id
        ORDER BY bookingCount DESC
        LIMIT :limit
    """)
    List<Object[]> findTopBookedResources(@Param("limit") int limit);

    // Analytics: bookings per hour (0-23) across all resources
    @Query("""
        SELECT FUNCTION('strftime', '%H', b.startTime) AS hour, COUNT(b.id)
        FROM Booking b
        GROUP BY hour
        ORDER BY hour
    """)
    List<Object[]> findBookingCountByHour();

    // Count by type — for dashboard stat breakdown
    @Query("SELECT r.type, COUNT(r) FROM Resource r GROUP BY r.type")
    List<Object[]> countByType();
}