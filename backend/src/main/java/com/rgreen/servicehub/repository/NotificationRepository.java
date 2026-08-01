package com.rgreen.servicehub.repository;

import com.rgreen.servicehub.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findAllByOrderByTimestampDesc();

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.isRead = false")
    long countUnreadNotifications();

    @Query("SELECT n FROM Notification n WHERE n.isRead = false ORDER BY n.timestamp DESC")
    List<Notification> findUnreadNotifications();
}