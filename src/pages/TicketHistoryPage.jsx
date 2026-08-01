import React, { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import api from '../api/axios';
import './TicketHistoryPage.css';

export default function TicketHistoryPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [viewTimeline, setViewTimeline] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState('');

  const loadTickets = async () => {
    try {
      setLoading(true);

      const response = await api.get('/tickets');

      setTickets(response.data || []);
    } catch (error) {
      console.error('Failed to load ticket history:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const openTimeline = async (ticket) => {
    setViewTimeline(ticket);
    setTimelineEvents([]);
    setTimelineError('');
    setTimelineLoading(true);

    try {
      const response = await api.get(
        `/tickets/${ticket.id}/history`
      );

      setTimelineEvents(response.data || []);
    } catch (error) {
      console.error('Failed to load ticket timeline:', error);
      setTimelineError('Unable to load ticket timeline.');
    } finally {
      setTimelineLoading(false);
    }
  };

  const closeTimeline = () => {
    setViewTimeline(null);
    setTimelineEvents([]);
    setTimelineError('');
    setTimelineLoading(false);
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'priority-critical';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-low';
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'status-open';
      case 'assigned':
        return 'status-assigned';
      case 'accepted':
        return 'status-assigned';
      case 'in progress':
      case 'in_progress':
        return 'status-inprogress';
      case 'resolved':
      case 'closed':
        return 'status-resolved';
      case 'reopened':
        return 'status-open';
      default:
        return 'status-open';
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return '-';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTimelineDate = (date) => {
    if (!date) {
      return '-';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const categories = useMemo(() => {
    return [
      ...new Set(
        tickets
          .map((ticket) => ticket.category)
          .filter(Boolean)
      )
    ];
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !search ||
        ticket.ticketId?.toLowerCase().includes(search) ||
        ticket.subject?.toLowerCase().includes(search) ||
        ticket.description?.toLowerCase().includes(search) ||
        ticket.employeeName?.toLowerCase().includes(search) ||
        ticket.employeeEmail?.toLowerCase().includes(search) ||
        ticket.employeeDepartment?.toLowerCase().includes(search) ||
        ticket.category?.toLowerCase().includes(search) ||
        ticket.subcategory?.toLowerCase().includes(search) ||
        ticket.priority?.toLowerCase().includes(search) ||
        ticket.status?.toLowerCase().includes(search) ||
        ticket.assignedEngineer?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === 'All' ||
        ticket.status?.toLowerCase() ===
          statusFilter.toLowerCase();

      const matchesPriority =
        priorityFilter === 'All' ||
        ticket.priority?.toLowerCase() ===
          priorityFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === 'All' ||
        ticket.category?.toLowerCase() ===
          categoryFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory
      );
    });
  }, [
    tickets,
    searchTerm,
    statusFilter,
    priorityFilter,
    categoryFilter
  ]);

  const getClosedDate = (ticket) => {
    const status = ticket.status?.toLowerCase();

    if (status !== 'resolved' && status !== 'closed') {
      return 'Not closed';
    }

    return formatDate(
      ticket.closedDate ||
        ticket.resolvedDate ||
        ticket.updatedDate
    );
  };

  return (
    <div className="tickets-page history-page">
      <div className="tickets-header history-header">
        <div>
          <h1>Ticket History</h1>
          <p>
            View the history of tickets created in RGreen ServiceHub.
          </p>
        </div>

        <button className="export-btn" type="button">
          Export
        </button>
      </div>

      <div className="tickets-controls">
        <div className="search-bar">
          <Search size={18} className="search-icon" />

          <input
            type="text"
            placeholder="Search ticket history..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="filters">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">Status: All</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="Accepted">Accepted</option>
            <option value="In Progress">
              In Progress
            </option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Reopened">Reopened</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value)
            }
          >
            <option value="All">Priority: All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
          >
            <option value="All">Category: All</option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-card">
        <table className="tickets-table">
          <thead>
            <tr>
              <th>TICKET</th>
              <th>EMPLOYEE</th>
              <th>CATEGORY</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
              <th>ENGINEER</th>
              <th>CREATED</th>
              <th>UPDATED</th>
              <th>CLOSED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="10"
                  style={{
                    textAlign: 'center',
                    padding: '50px'
                  }}
                >
                  Loading ticket history...
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  style={{
                    textAlign: 'center',
                    padding: '50px',
                    color: '#6b7280'
                  }}
                >
                  No ticket history found.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <span className="ticket-link">
                      {ticket.ticketId || '-'}
                    </span>
                  </td>

                  <td>
                    <div className="emp-name">
                      {ticket.employeeName || '-'}
                    </div>

                    <div className="emp-dept">
                      {ticket.employeeDepartment || '—'}
                    </div>
                  </td>

                  <td>
                    <div className="cat-name">
                      {ticket.category || '-'}
                    </div>

                    <div className="cat-sub">
                      {ticket.subcategory || '-'}
                    </div>
                  </td>

                  <td>
                    <span
                      className={`badge ${getPriorityClass(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority || '-'}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`badge ${getStatusClass(
                        ticket.status
                      )}`}
                    >
                      {ticket.status || '-'}
                    </span>
                  </td>

                  <td>
                    {ticket.assignedEngineer || '—'}
                  </td>

                  <td>
                    {formatDate(ticket.createdDate)}
                  </td>

                  <td>
                    {formatDate(
                      ticket.updatedDate ||
                        ticket.createdDate
                    )}
                  </td>

                  <td
                    style={{
                      color:
                        getClosedDate(ticket) ===
                        'Not closed'
                          ? '#9ca3af'
                          : 'inherit'
                    }}
                  >
                    {getClosedDate(ticket)}
                  </td>

                  <td>
                    <button
                      className="view-btn"
                      type="button"
                      onClick={() =>
                        openTimeline(ticket)
                      }
                    >
                      Timeline
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewTimeline && (
        <div
          className="modal-overlay"
          onClick={closeTimeline}
        >
          <div
            className="modal-card timeline-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>
                  {viewTimeline.ticketId} — Ticket Timeline
                </h2>

                <p
                  style={{
                    margin: '6px 0 0',
                    color: '#6b7280',
                    fontSize: '14px'
                  }}
                >
                  {viewTimeline.subject}
                </p>
              </div>

              <button
                className="close-btn"
                type="button"
                onClick={closeTimeline}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body timeline-body">
              {timelineLoading ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '35px',
                    color: '#6b7280'
                  }}
                >
                  Loading timeline...
                </div>
              ) : timelineError ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '35px',
                    color: '#dc2626'
                  }}
                >
                  {timelineError}
                </div>
              ) : timelineEvents.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '35px',
                    color: '#6b7280'
                  }}
                >
                  No timeline events recorded for this ticket.
                </div>
              ) : (
                <div className="timeline-container">
                  {timelineEvents.map(
                    (event, index) => (
                      <div
                        key={
                          event.id ||
                          `${event.status}-${index}`
                        }
                        className="timeline-item"
                      >
                        <div className="timeline-icon">
                          <div className="icon-circle" />

                          {index !==
                            timelineEvents.length - 1 && (
                            <div className="timeline-line" />
                          )}
                        </div>

                        <div className="timeline-content">
                          <div className="timeline-meta">
                            {formatTimelineDate(
                              event.eventDate
                            )}{' '}
                            ·{' '}
                            <strong>
                              {event.performedBy ||
                                'System'}
                            </strong>
                          </div>

                          <div className="timeline-status">
                            {event.status}
                          </div>

                          <div className="timeline-desc">
                            {event.action ||
                              'Ticket updated'}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}