package com.smart_campus.smart_campus.facility.repository;

import com.smart_campus.smart_campus.facility.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository
        extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {

    boolean existsByNameIgnoreCase(String name);

    long countByStatus(Resource.ResourceStatus status);

    // Deletes all bookings linked to this resource before the resource is deleted
    @Modifying
    @Query("DELETE FROM Booking b WHERE b.resource.id = :resourceId")
    void deleteBookingsByResourceId(@Param("resourceId") Long resourceId);

    @Query("""
        SELECT r, COUNT(b.id) AS bookingCount
        FROM Resource r
        LEFT JOIN Booking b ON b.resource.id = r.id
        GROUP BY r.id
        ORDER BY bookingCount DESC
        LIMIT :limit
    """)
    List<Object[]> findTopBookedResources(@Param("limit") int limit);

    @Query(value = "SELECT strftime('%H', datetime(start_time/1000, 'unixepoch')) as hour, COUNT(*) as cnt FROM bookings b GROUP BY hour ORDER BY hour", nativeQuery = true)
    List<Object[]> findBookingCountByHour();

    @Query("SELECT r.type, COUNT(r) FROM Resource r GROUP BY r.type")
    List<Object[]> countByType();
}