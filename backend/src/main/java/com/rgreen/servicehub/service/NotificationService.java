package com.rgreen.servicehub.service;

import com.rgreen.servicehub.model.Notification;
import com.rgreen.servicehub.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByTimestampDesc();
    }

    public Notification createNotification(String message, String type) {
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    public long getUnreadCount() {
        return notificationRepository.countUnreadNotifications();
    }

    public void markAllAsRead() {
        List<Notification> unreadNotifications =
                notificationRepository.findUnreadNotifications();

        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }

        notificationRepository.saveAll(unreadNotifications);
    }
}