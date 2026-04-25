package com.smart_campus.smart_campus.booking.repository;

import com.smart_campus.smart_campus.booking.entity.Booking;
import com.smart_campus.smart_campus.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByResourceId(Long resourceId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByUserIdAndStatus(Long userId, BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.status = 'APPROVED' AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlappingBookings(
            @Param("resourceId") Long resourceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.status = 'APPROVED' AND b.startTime < :endTime AND b.endTime > :startTime AND b.id != :excludeId")
    List<Booking> findOverlappingBookingsExcluding(
            @Param("resourceId") Long resourceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeId") Long excludeId);

    @Query("SELECT b FROM Booking b WHERE b.status = 'APPROVED' AND b.reminderSent = false AND b.startTime BETWEEN :from AND :to")
    List<Booking> findBookingsForReminder(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT b FROM Booking b WHERE b.status = 'APPROVED' AND b.checkedInAt IS NULL AND b.startTime < :cutoff")
    List<Booking> findNoShowBookings(@Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.endTime < :now ORDER BY b.endTime DESC")
    List<Booking> findPastBookingsByUserId(
            @Param("userId") Long userId,
            @Param("now") LocalDateTime now);

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.startTime >= :from AND b.endTime <= :to")
    List<Booking> findByResourceIdAndDateRange(
            @Param("resourceId") Long resourceId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    Optional<Booking> findByCheckInToken(String checkInToken);

    List<Booking> findByResourceIdAndStatus(Long resourceId, BookingStatus status);

    List<Booking> findByStatusOrderByStartTimeDesc(BookingStatus status);

    @Query("SELECT b.status, COUNT(b) FROM Booking b GROUP BY b.status")
    List<Object[]> countByStatus();

    @Query("""
    SELECT b.user.id, b.user.fullName, b.user.email,
           COUNT(b) as totalBookings,
           SUM(CASE WHEN b.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
           SUM(CASE WHEN b.status = 'AUTO_CANCELLED' THEN 1 ELSE 0 END) as autoCancelled
    FROM Booking b
    JOIN b.user u
    GROUP BY b.user.id, b.user.fullName, b.user.email
    ORDER BY totalBookings DESC
""")
    List<Object[]> getUserBookingStats();

    @Query(value = """
    SELECT
        COUNT(*) as total,
        SUM(CASE WHEN checked_in_at IS NOT NULL AND checked_in_at != '' THEN 1 ELSE 0 END) as checked_in,
        SUM(CASE WHEN status = 'AUTO_CANCELLED' THEN 1 ELSE 0 END) as auto_cancelled
    FROM bookings
    WHERE status = 'APPROVED' OR status = 'AUTO_CANCELLED'
    """, nativeQuery = true)
    Object[] getCheckInSummary();

    @Query(value = "SELECT strftime('%w', datetime(start_time/1000, 'unixepoch')) as day_of_week, COUNT(*) as cnt FROM bookings GROUP BY day_of_week ORDER BY day_of_week", nativeQuery = true)
    List<Object[]> countByDayOfWeek();
}
