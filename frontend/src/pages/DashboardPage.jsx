import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  UserCheck,
  Ticket,
  AlertCircle,
  CheckCircle,
  XCircle,
  LayoutGrid,
  Building
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import './DashboardPage.css';

const STATUS_CONFIG = [
  {
    name: 'NEW',
    statuses: ['new', 'open'],
    color: '#3B82F6'
  },
  {
    name: 'ASSIGNED',
    statuses: ['assigned'],
    color: '#8B5CF6'
  },
  {
    name: 'ACCEPTED',
    statuses: ['accepted'],
    color: '#10B981'
  },
  {
    name: 'IN_PROGRESS',
    statuses: ['in progress', 'in_progress'],
    color: '#F59E0B'
  },
  {
    name: 'RESOLVED',
    statuses: ['resolved'],
    color: '#14B8A6'
  },
  {
    name: 'CLOSED',
    statuses: ['closed'],
    color: '#6B7280'
  },
  {
    name: 'REOPENED',
    statuses: ['reopened'],
    color: '#EF4444'
  }
];

const PRIORITY_CONFIG = [
  {
    name: 'Low',
    key: 'low',
    fill: '#3B82F6'
  },
  {
    name: 'Medium',
    key: 'medium',
    fill: '#8B5CF6'
  },
  {
    name: 'High',
    key: 'high',
    fill: '#6C3FC5'
  },
  {
    name: 'Critical',
    key: 'critical',
    fill: '#EF4444'
  }
];

const normalizeStatus = (status) => {
  return status
    ?.toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') || '';
};

const normalizePriority = (priority) => {
  return priority
    ?.toString()
    .toLowerCase()
    .trim() || '';
};

const getPriorityColor = (priority) => {
  switch (normalizePriority(priority)) {
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

const getStatusColor = (status) => {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case 'open':
    case 'new':
      return 'status-new';

    case 'assigned':
      return 'status-assigned';

    case 'accepted':
      return 'status-accepted';

    case 'in progress':
    case 'in_progress':
      return 'status-in-progress';

    case 'resolved':
      return 'status-resolved';

    case 'closed':
      return 'status-closed';

    case 'reopened':
      return 'status-reopened';

    default:
      return 'status-closed';
  }
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);

  const role = user?.role;

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const ticketsResponse = await api.get('/tickets');

        setTickets(ticketsResponse.data || []);

        if (role === 'ADMIN') {
          const results = await Promise.allSettled([
            api.get('/employees'),
            api.get('/engineers'),
            api.get('/departments')
          ]);

          if (results[0].status === 'fulfilled') {
            setEmployees(results[0].value.data || []);
          }

          if (results[1].status === 'fulfilled') {
            setEngineers(results[1].value.data || []);
          }

          if (results[2].status === 'fulfilled') {
            setDepartments(results[2].value.data || []);
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboard();
    }
  }, [role, user]);

  const countStatus = (...statuses) => {
    const normalizedStatuses = statuses.map((status) =>
      normalizeStatus(status)
    );

    return tickets.filter((ticketItem) =>
      normalizedStatuses.includes(
        normalizeStatus(ticketItem.status)
      )
    ).length;
  };

  const newTickets = countStatus('new', 'open');

  const assignedTickets = countStatus('assigned');

  const acceptedTickets = countStatus('accepted');

  const inProgressTickets = countStatus(
    'in progress',
    'in_progress'
  );

  const resolvedTickets = countStatus('resolved');

  const closedTickets = countStatus('closed');

  const reopenedTickets = countStatus('reopened');

  const activeTickets =
    newTickets +
    assignedTickets +
    acceptedTickets +
    inProgressTickets +
    reopenedTickets;

  const totalTickets = tickets.length;

  const ticketStatusData = STATUS_CONFIG.map((item) => {
    const value = tickets.filter((ticketItem) => {
      const status = normalizeStatus(ticketItem.status);

      return item.statuses.includes(status);
    }).length;

    return {
      name: item.name,
      value,
      color: item.color
    };
  });

  const priorityData = PRIORITY_CONFIG.map((item) => {
    const value = tickets.filter(
      (ticketItem) =>
        normalizePriority(ticketItem.priority) === item.key
    ).length;

    return {
      name: item.name,
      value,
      fill: item.fill
    };
  });

  const recentTickets = [...tickets]
    .sort((a, b) => {
      const firstDate = new Date(a.createdDate || 0).getTime();
      const secondDate = new Date(b.createdDate || 0).getTime();

      return secondDate - firstDate;
    })
    .slice(0, 5);

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

  const renderAdminCards = () => (
    <>
      <StatCard
        title="Employees"
        value={employees.length}
        icon={<Users />}
        color="#6C3FC5"
      />

      <StatCard
        title="Engineers"
        value={engineers.length}
        icon={<UserCheck />}
        color="#4A1D96"
      />

      <StatCard
        title="New Tickets"
        value={newTickets}
        icon={<Ticket />}
        color="#3B82F6"
      />

      <StatCard
        title="Open Tickets"
        value={activeTickets}
        icon={<AlertCircle />}
        color="#F59E0B"
      />

      <StatCard
        title="Resolved"
        value={resolvedTickets}
        icon={<CheckCircle />}
        color="#14B8A6"
      />

      <StatCard
        title="Closed"
        value={closedTickets}
        icon={<XCircle />}
        color="#6B7280"
      />

      <StatCard
        title="Total Tickets"
        value={totalTickets}
        icon={<LayoutGrid />}
        color="#6C3FC5"
      />

      <StatCard
        title="Departments"
        value={departments.length}
        icon={<Building />}
        color="#8B5CF6"
      />
    </>
  );

  const renderEmployeeCards = () => (
    <>
      <StatCard
        title="New Tickets"
        value={newTickets}
        icon={<Ticket />}
        color="#3B82F6"
      />

      <StatCard
        title="Active Tickets"
        value={activeTickets}
        icon={<AlertCircle />}
        color="#F59E0B"
      />

      <StatCard
        title="Resolved"
        value={resolvedTickets}
        icon={<CheckCircle />}
        color="#14B8A6"
      />

      <StatCard
        title="Closed"
        value={closedTickets}
        icon={<XCircle />}
        color="#6B7280"
      />

      <StatCard
        title="Total Tickets"
        value={totalTickets}
        icon={<LayoutGrid />}
        color="#6C3FC5"
      />
    </>
  );

  const renderEngineerCards = () => (
    <>
      <StatCard
        title="Assigned"
        value={assignedTickets}
        icon={<Ticket />}
        color="#8B5CF6"
      />

      <StatCard
        title="Accepted"
        value={acceptedTickets}
        icon={<UserCheck />}
        color="#10B981"
      />

      <StatCard
        title="In Progress"
        value={inProgressTickets}
        icon={<AlertCircle />}
        color="#F59E0B"
      />

      <StatCard
        title="Resolved"
        value={resolvedTickets}
        icon={<CheckCircle />}
        color="#14B8A6"
      />

      <StatCard
        title="Total Assigned"
        value={totalTickets}
        icon={<LayoutGrid />}
        color="#6C3FC5"
      />
    </>
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <div
          style={{
            padding: '60px 0',
            textAlign: 'center',
            color: '#6B7280'
          }}
        >
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Welcome back, {user?.name || 'User'}
          </h1>

          <p className="dashboard-subtitle">
            {role === 'ADMIN'
              ? "Here's what's happening across the service desk."
              : role === 'SUPPORT_ENGINEER'
                ? "Here's your current support workload."
                : "Here's the latest status of your support tickets."}
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate('/tickets')}
        >
          Go to Tickets
          <ArrowRight className="btn-icon-right" />
        </button>
      </header>

      <section className="stats-grid">
        {role === 'ADMIN' && renderAdminCards()}

        {role === 'EMPLOYEE' && renderEmployeeCards()}

        {role === 'SUPPORT_ENGINEER' &&
          renderEngineerCards()}
      </section>

      <section className="charts-section">
        <div className="chart-card">
          <h2 className="chart-title">
            Ticket Status
          </h2>

          <div className="donut-chart-container">
            <ResponsiveContainer
              width="50%"
              height={250}
            >
              <PieChart>
                <Pie
                  data={ticketStatusData}
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {ticketStatusData.map(
                    (entry, index) => (
                      <Cell
                        key={`status-${index}`}
                        fill={entry.color}
                      />
                    )
                  )}
                </Pie>

                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="chart-legend">
              {ticketStatusData.map((item) => (
                <div
                  key={item.name}
                  className="legend-item"
                >
                  <span
                    className="legend-dot"
                    style={{
                      backgroundColor: item.color
                    }}
                  />

                  <span className="legend-label">
                    {item.name}
                  </span>

                  <span className="legend-value">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">
            Priority Distribution
          </h2>

          <div className="bar-chart-container">
            <ResponsiveContainer
              width="100%"
              height={250}
            >
              <BarChart data={priorityData}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />

                <RechartsTooltip
                  cursor={{ fill: 'transparent' }}
                />

                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                >
                  {priorityData.map(
                    (entry, index) => (
                      <Cell
                        key={`priority-${index}`}
                        fill={entry.fill}
                      />
                    )
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="recent-tickets-section">
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h2 className="card-title">
              Recent Tickets
            </h2>

            <button
              type="button"
              onClick={() => navigate('/tickets')}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#6C3FC5',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              View All
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>TICKET</th>
                  <th>SUBJECT</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th>CREATED</th>
                </tr>
              </thead>

              <tbody>
                {recentTickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: 'center',
                        padding: '35px',
                        color: '#6B7280'
                      }}
                    >
                      No tickets available.
                    </td>
                  </tr>
                ) : (
                  recentTickets.map((ticketItem) => (
                    <tr
                      key={ticketItem.id}
                      onClick={() =>
                        navigate(
                          `/tickets/${ticketItem.id}`
                        )
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <span className="badge badge-purple">
                          {ticketItem.ticketId || '-'}
                        </span>
                      </td>

                      <td>
                        {ticketItem.subject || '-'}
                      </td>

                      <td>
                        <span
                          className={`badge ${getPriorityColor(
                            ticketItem.priority
                          )}`}
                        >
                          {ticketItem.priority || '-'}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${getStatusColor(
                            ticketItem.status
                          )}`}
                        >
                          {ticketItem.status || '-'}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          ticketItem.createdDate
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;