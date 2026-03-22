package com.smart_campus.smart_campus.notifications.repository;

import com.smart_campus.smart_campus.notifications.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // User-facing
    List<Notification> findByUserIdOrderByCreationTimeDesc(Long userId);
    List<Notification> findByUserIdAndReadFalseOrderByCreationTimeDesc(Long userId);
    long countByUserIdAndReadFalse(Long userId);
    List<Notification> findTop5ByUserIdOrderByCreationTimeDesc(Long userId);

    // Admin filtered query — any param can be null (no filter applied)
    @Query("SELECT n FROM Notification n WHERE " +
           "(:userId IS NULL OR n.userId = :userId) AND " +
           "(:type   IS NULL OR n.type   = :type)   AND " +
           "(:isRead IS NULL OR n.read   = :isRead)  " +
           "ORDER BY n.creationTime DESC")
    List<Notification> findWithFilters(
            @Param("userId") Long userId,
            @Param("type")   Notification.NotificationType type,
            @Param("isRead") Boolean isRead
    );

    // Bulk mark-as-read for one user
    @Modifying
    @Query("UPDATE Notification n SET n.read = true " +
           "WHERE n.userId = :userId AND n.read = false")
    void markAllAsReadByUserId(@Param("userId") Long userId);
}