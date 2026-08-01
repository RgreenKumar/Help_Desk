import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './TicketDetailPage.css';

const TicketDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const loadTicket = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data);

      setSelectedEngineer(
        response.data?.assignedEngineer || ''
      );
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEngineers = async () => {
    if (user?.role !== 'ADMIN') {
      return;
    }

    try {
      const response = await api.get('/engineers');
      setEngineers(response.data || []);
    } catch (error) {
      console.error('Failed to load engineers:', error);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  useEffect(() => {
    loadEngineers();
  }, [user?.role]);

  const handleAssign = async () => {
    if (!selectedEngineer) {
      alert('Please select a support engineer.');
      return;
    }

    try {
      setAssigning(true);

      await api.put(`/tickets/${ticket.id}/assign`, {
        engineerName: selectedEngineer
      });

      await loadTicket();

      alert('Engineer assigned successfully!');
    } catch (error) {
      console.error('Failed to assign engineer:', error);
      alert('Failed to assign engineer.');
    } finally {
      setAssigning(false);
    }
  };

  const handlePostComment = () => {
    if (!comment.trim()) {
      return;
    }

    setComment('');
  };

  const formatDateTime = (date) => {
    if (!date) {
      return '-';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return '-';
    }

    return parsed.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'ticket-priority-critical';

      case 'high':
        return 'ticket-priority-high';

      case 'medium':
        return 'ticket-priority-medium';

      case 'low':
        return 'ticket-priority-low';

      default:
        return '';
    }
  };

  const getStatusClass = (status) => {
    const value = status
      ?.toLowerCase()
      .replace(/_/g, ' ')
      .trim();

    if (value === 'open') {
      return 'ticket-status-open';
    }

    if (value === 'assigned') {
      return 'ticket-status-assigned';
    }

    if (value === 'accepted') {
      return 'ticket-status-accepted';
    }

    if (value === 'in progress') {
      return 'ticket-status-progress';
    }

    if (value === 'resolved') {
      return 'ticket-status-resolved';
    }

    return '';
  };

  if (loading) {
    return (
      <div className="ticket-detail-page">
        <div className="ticket-loading">
          Loading ticket...
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-detail-page">
        <div className="ticket-loading">
          Ticket not found.
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-detail-page">
      <div className="ticket-detail-inner">

        <div className="ticket-heading-row">

          <div className="ticket-heading-content">

            <div className="breadcrumb">
              <Link to="/tickets">Ticket</Link>

              <span className="breadcrumb-separator">
                ·
              </span>

              <span>{ticket.ticketId}</span>
            </div>

            <h1>
              {ticket.subject || 'Untitled Ticket'}
            </h1>

            <p className="ticket-meta">
              {ticket.ticketId}
              {' · '}
              Opened {formatDateTime(ticket.createdDate)}
              {ticket.employeeName && (
                <> by {ticket.employeeName}</>
              )}
            </p>

          </div>

          <div className="ticket-header-right">

            <span
              className={`ticket-badge ${getPriorityClass(
                ticket.priority
              )}`}
            >
              {ticket.priority || '-'} priority
            </span>

            <span
              className={`ticket-badge ${getStatusClass(
                ticket.status
              )}`}
            >
              {ticket.status || '-'}
            </span>

          </div>

        </div>

        <div className="ticket-content">

          <main className="ticket-main">

            <section className="detail-card description-card">

              <h3>Description</h3>

              <p className="description-text">
                {ticket.description ||
                  'No description provided.'}
              </p>

            </section>

            <section className="detail-card comments-card">

              <h3>Comments &amp; Activity</h3>

              <p className="comments-placeholder">
                No comments yet.
              </p>

              <div className="comment-box">

                <textarea
                  value={comment}
                  onChange={(event) =>
                    setComment(event.target.value)
                  }
                  placeholder="Write an update or question..."
                  rows={4}
                />

                <div className="comment-actions">

                  <button
                    type="button"
                    className="post-btn"
                    onClick={handlePostComment}
                  >
                    Post Comment
                  </button>

                </div>

              </div>

            </section>

          </main>

          <aside className="ticket-sidebar">

            <section className="detail-card ticket-info-card">

              <h3>Ticket Information</h3>

              <div className="info-rows">

                <div className="info-row">
                  <span>Category</span>
                  <strong>
                    {ticket.category || '-'}
                  </strong>
                </div>

                <div className="info-row">
                  <span>Subcategory</span>
                  <strong>
                    {ticket.subcategory || '-'}
                  </strong>
                </div>

                <div className="info-row">
                  <span>Department</span>
                  <strong>
                    {ticket.employeeDepartment ||
                      ticket.department ||
                      '-'}
                  </strong>
                </div>

                <div className="info-row">
                  <span>Reporter</span>
                  <strong>
                    {ticket.employeeName || '-'}
                  </strong>
                </div>

                <div className="info-row">
                  <span>Assigned to</span>
                  <strong>
                    {ticket.assignedEngineer ||
                      'Unassigned'}
                  </strong>
                </div>

                <div className="info-row">
                  <span>Last update</span>
                  <strong>
                    {formatDateTime(
                      ticket.updatedDate ||
                        ticket.createdDate
                    )}
                  </strong>
                </div>

              </div>

            </section>

            {user?.role === 'ADMIN' && (
              <section className="detail-card agent-actions-card">

                <h3>Agent Actions</h3>

                <div className="action-form">

                  <label htmlFor="ticket-assignee">
                    Assign to teammate
                  </label>

                  <select
                    id="ticket-assignee"
                    value={selectedEngineer}
                    onChange={(event) =>
                      setSelectedEngineer(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {engineers.map((engineer) => {
                      const name =
                        `${engineer.firstName || ''} ${
                          engineer.lastName || ''
                        }`.trim();

                      return (
                        <option
                          key={engineer.id}
                          value={name}
                        >
                          {name}
                        </option>
                      );
                    })}

                  </select>

                  <div className="assign-button-row">

                    <button
                      type="button"
                      className="assign-action-btn"
                      disabled={assigning}
                      onClick={handleAssign}
                    >
                      {assigning
                        ? 'Assigning...'
                        : ticket.assignedEngineer
                          ? 'Reassign'
                          : 'Assign'}
                    </button>

                  </div>

                </div>

              </section>
            )}

          </aside>

        </div>

      </div>
    </div>
  );
};

export default TicketDetailPage;