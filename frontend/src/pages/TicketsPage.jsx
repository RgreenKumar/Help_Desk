import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './TicketsPage.css';

const TicketsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const role = user?.role;

  const loadTickets = async () => {
    try {
      setLoading(true);

      const response = await api.get('/tickets');

      setTickets(response.data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const updateTicketStatus = async (ticket, newStatus) => {
    try {
      setUpdatingStatusId(ticket.id);

      await api.put(`/tickets/${ticket.id}/status`, {
        status: newStatus
      });

      await loadTickets();

      setSelectedTicket((previous) => {
        if (!previous || previous.id !== ticket.id) {
          return previous;
        }

        return {
          ...previous,
          status: newStatus
        };
      });
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      alert('Failed to update ticket status.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getEngineerAction = (ticket) => {
    if (role !== 'SUPPORT_ENGINEER') {
      return null;
    }

    const status = ticket.status
      ?.toLowerCase()
      .replace(/_/g, ' ')
      .trim();

    if (status === 'assigned') {
      return {
        label: 'Accept',
        nextStatus: 'Accepted'
      };
    }

    if (status === 'accepted') {
      return {
        label: 'Start Progress',
        nextStatus: 'In Progress'
      };
    }

    if (status === 'in progress') {
      return {
        label: 'Resolve',
        nextStatus: 'Resolved'
      };
    }

    return null;
  };

  const handleEngineerAction = async (ticket) => {
    const action = getEngineerAction(ticket);

    if (!action) {
      return;
    }

    await updateTicketStatus(ticket, action.nextStatus);
  };

  const categories = [
    ...new Set(
      tickets
        .map((ticket) => ticket.category)
        .filter(Boolean)
    )
  ];

  const filteredTickets = tickets.filter((ticket) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      ticket.ticketId?.toLowerCase().includes(searchText) ||
      ticket.subject?.toLowerCase().includes(searchText) ||
      ticket.description?.toLowerCase().includes(searchText) ||
      ticket.employeeName?.toLowerCase().includes(searchText) ||
      ticket.employeeEmail?.toLowerCase().includes(searchText) ||
      ticket.category?.toLowerCase().includes(searchText) ||
      ticket.subcategory?.toLowerCase().includes(searchText) ||
      ticket.priority?.toLowerCase().includes(searchText) ||
      ticket.status?.toLowerCase().includes(searchText) ||
      ticket.assignedEngineer?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === 'All' ||
      ticket.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesPriority =
      priorityFilter === 'All' ||
      ticket.priority?.toLowerCase() === priorityFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === 'All' ||
      ticket.category?.toLowerCase() === categoryFilter.toLowerCase();

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory
    );
  });

  const formatDate = (date) => {
    if (!date) {
      return '-';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '-';
    }

    return parsedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPriorityClass = (priority) => {
    const normalized = priority?.toLowerCase();

    if (normalized === 'critical') {
      return 'priority-critical';
    }

    if (normalized === 'high') {
      return 'priority-high';
    }

    if (normalized === 'medium') {
      return 'priority-medium';
    }

    if (normalized === 'low') {
      return 'priority-low';
    }

    return 'priority-default';
  };

  const getStatusClass = (status) => {
    const normalized = status
      ?.toLowerCase()
      .replace(/_/g, ' ')
      .trim();

    if (normalized === 'open') {
      return 'status-open';
    }

    if (normalized === 'assigned') {
      return 'status-assigned';
    }

    if (normalized === 'accepted') {
      return 'status-accepted';
    }

    if (normalized === 'in progress') {
      return 'status-inprogress';
    }

    if (normalized === 'resolved') {
      return 'status-resolved';
    }

    if (normalized === 'closed') {
      return 'status-closed';
    }

    if (normalized === 'reopened') {
      return 'status-reopened';
    }

    return 'status-default';
  };

  const closeViewModal = () => {
    setSelectedTicket(null);
  };

  const isTicketAssigned = (ticket) => {
    if (!ticket) {
      return false;
    }

    const engineer = ticket.assignedEngineer
      ?.toString()
      .trim()
      .toLowerCase();

    if (
      engineer &&
      engineer !== '-' &&
      engineer !== '—' &&
      engineer !== 'unassigned' &&
      engineer !== 'not assigned' &&
      engineer !== 'null'
    ) {
      return true;
    }

    const status = ticket.status
      ?.toString()
      .trim()
      .toLowerCase()
      .replace(/_/g, ' ');

    return (
      status === 'assigned' ||
      status === 'accepted' ||
      status === 'in progress' ||
      status === 'resolved'
    );
  };

  return (
    <div className="tickets-page">
      <div className="tickets-header">
        <div>
          <h1>
            {role === 'EMPLOYEE' ? 'My Tickets' : 'All Tickets'}
          </h1>

          <p>
            {role === 'EMPLOYEE'
              ? 'View and track your support tickets.'
              : role === 'SUPPORT_ENGINEER'
                ? 'View and manage tickets assigned to you.'
                : 'Master view of every ticket across the organization.'}
          </p>
        </div>

        {role === 'EMPLOYEE' && (
          <button
            type="button"
            className="create-ticket-btn"
            onClick={() => navigate('/raise-ticket')}
          >
            + Raise Ticket
          </button>
        )}
      </div>

      <div className="tickets-controls">
        <div className="tickets-search">
          <Search
            size={18}
            className="tickets-search-icon"
          />

          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="tickets-filters">
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
            <option value="In Progress">In Progress</option>
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

      <div className="tickets-table-card">
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
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="8"
                  className="tickets-empty-cell"
                >
                  Loading tickets...
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="tickets-empty-cell"
                >
                  No tickets found.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => {
                const engineerAction =
                  getEngineerAction(ticket);

                const assigned = isTicketAssigned(ticket);

                return (
                  <tr key={ticket.id}>
                    <td>
                      <span className="ticket-link">
                        {ticket.ticketId}
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

                    <td className="engineer-cell">
                      {ticket.assignedEngineer || '—'}
                    </td>

                    <td className="created-cell">
                      {formatDate(ticket.createdDate)}
                    </td>

                    <td>
                      <div className="actions-cell">

                        {role === 'ADMIN' && !assigned && (
                          <button
                            type="button"
                            className="assign-btn"
                            onClick={() =>
                              navigate(`/tickets/${ticket.id}`)
                            }
                          >
                            Assign
                          </button>
                        )}

                        {role === 'SUPPORT_ENGINEER' &&
                          engineerAction && (
                            <button
                              type="button"
                              className="assign-btn"
                              disabled={
                                updatingStatusId === ticket.id
                              }
                              onClick={() =>
                                handleEngineerAction(ticket)
                              }
                            >
                              {updatingStatusId === ticket.id
                                ? 'Updating...'
                                : engineerAction.label}
                            </button>
                          )}

                        <button
                          type="button"
                          className="view-btn"
                          onClick={() =>
                            setSelectedTicket(ticket)
                          }
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedTicket && (
        <div
          className="tickets-modal-overlay view-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeViewModal();
            }
          }}
        >
          <div className="ticket-view-modal">
            <div className="ticket-view-header">
              <h2>
                {selectedTicket.ticketId}

                {selectedTicket.subject
                  ? ` — ${selectedTicket.subject}`
                  : ''}
              </h2>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeViewModal}
              >
                <X size={21} />
              </button>
            </div>

            <div className="ticket-view-content">
              <div className="ticket-view-description">
                <h3>Description</h3>

                <p>
                  {selectedTicket.description ||
                    'No description provided.'}
                </p>
              </div>

              <div className="ticket-view-info">
                <h3>Info</h3>

                <div className="view-info-row">
                  <span>Employee</span>

                  <strong>
                    {selectedTicket.employeeName || '-'}
                  </strong>
                </div>

                <div className="view-info-row">
                  <span>Department</span>

                  <strong>
                    {selectedTicket.employeeDepartment || '-'}
                  </strong>
                </div>

                <div className="view-info-row">
                  <span>Category</span>

                  <strong>
                    {selectedTicket.category || '-'}
                  </strong>
                </div>

                <div className="view-info-row">
                  <span>Subcategory</span>

                  <strong>
                    {selectedTicket.subcategory || '-'}
                  </strong>
                </div>

                <div className="view-info-row">
                  <span>Priority</span>

                  <strong>
                    {selectedTicket.priority || '-'}
                  </strong>
                </div>

                <div className="view-info-row">
                  <span>Status</span>

                  <strong>
                    {selectedTicket.status || '-'}
                  </strong>
                </div>

                <div className="view-info-row">
                  <span>Engineer</span>

                  <strong>
                    {selectedTicket.assignedEngineer ||
                      'Not assigned'}
                  </strong>
                </div>

                <div className="view-info-row">
                  <span>Created</span>

                  <strong>
                    {formatDate(
                      selectedTicket.createdDate
                    )}
                  </strong>
                </div>
              </div>
            </div>

            {role === 'SUPPORT_ENGINEER' &&
              getEngineerAction(selectedTicket) && (
                <div className="ticket-view-footer">
                  <button
                    type="button"
                    className="assign-btn"
                    disabled={
                      updatingStatusId ===
                      selectedTicket.id
                    }
                    onClick={() =>
                      handleEngineerAction(
                        selectedTicket
                      )
                    }
                  >
                    {updatingStatusId ===
                    selectedTicket.id
                      ? 'Updating...'
                      : getEngineerAction(
                          selectedTicket
                        ).label}
                  </button>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;