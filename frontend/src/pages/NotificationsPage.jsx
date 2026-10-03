import React, { useEffect, useState } from 'react';
import {
  Ticket,
  User,
  Bell,
  UserCheck,
  CheckCircle,
  Clock
} from 'lucide-react';
import api from '../api/axios';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/notifications');
        setNotifications(response.data || []);
      } catch (err) {
        console.error('Failed to load notifications:', err);
        setNotifications([]);
        setError('Unable to load notifications.');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) {
      return '';
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return '';
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const today = new Date();

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return '';
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getNotificationIcon = (type) => {
    const normalizedType = type?.toLowerCase() || '';

    if (
      normalizedType.includes('ticket') ||
      normalizedType.includes('created')
    ) {
      return <Ticket size={20} color="#6B7280" />;
    }

    if (
      normalizedType.includes('employee') ||
      normalizedType.includes('user')
    ) {
      return <User size={20} color="#6B7280" />;
    }

    if (
      normalizedType.includes('assign') ||
      normalizedType.includes('engineer')
    ) {
      return <UserCheck size={20} color="#6B7280" />;
    }

    if (
      normalizedType.includes('resolve') ||
      normalizedType.includes('closed')
    ) {
      return <CheckCircle size={20} color="#6B7280" />;
    }

    if (
      normalizedType.includes('progress') ||
      normalizedType.includes('accepted')
    ) {
      return <Clock size={20} color="#6B7280" />;
    }

    return <Bell size={20} color="#6B7280" />;
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-list">
          {loading ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#6B7280'
              }}
            >
              Loading notifications...
            </div>
          ) : error ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#DC2626'
              }}
            >
              {error}
            </div>
          ) : notifications.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#6B7280'
              }}
            >
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="notification-item"
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="notification-content">
                  <p className="notification-text">
                    {notification.message}
                  </p>

                  <span className="notification-time">
                    {formatDate(notification.timestamp)}
                    {formatDate(notification.timestamp) && ' · '}
                    {formatTime(notification.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;