import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import {
  Ticket,
  Clock3,
  Activity,
  CheckCircle2
} from 'lucide-react';
import api from '../api/axios';
import './ReportsPage.css';

const STATUS_COLORS = {
  OPEN: '#3B82F6',
  ASSIGNED: '#8B5CF6',
  ACCEPTED: '#06B6D4',
  'IN PROGRESS': '#F59E0B',
  RESOLVED: '#10B981',
  CLOSED: '#94A3B8',
  REOPENED: '#EF4444'
};

const ReportsPage = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await api.get('/tickets');
      setTickets(response.data || []);
    } catch (error) {
      console.error(error);
      setTickets([]);
    }
  };

  const report = useMemo(() => {

    const statusCount = {
      OPEN: 0,
      ASSIGNED: 0,
      ACCEPTED: 0,
      'IN PROGRESS': 0,
      RESOLVED: 0,
      CLOSED: 0,
      REOPENED: 0
    };

    const priorityCount = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0
    };

    const departmentCount = {};

    tickets.forEach(ticket => {

      const status = (ticket.status || '')
        .toUpperCase()
        .replace(/_/g, ' ')
        .trim();

      if (statusCount[status] !== undefined) {
        statusCount[status]++;
      }

      const priority = ticket.priority || 'Low';

      if (priorityCount[priority] !== undefined) {
        priorityCount[priority]++;
      }

      const department =
        ticket.employeeDepartment ||
        ticket.category ||
        'General';

      departmentCount[department] =
        (departmentCount[department] || 0) + 1;

    });

    return {

      statCards: [
        {
          title: 'Ticket Raised',
          value: tickets.length,
          icon: Ticket,
          bg: '#F4EBFF',
          color: '#7C3AED'
        },
        {
          title: 'In Progress',
          value: statusCount['IN PROGRESS'],
          icon: Clock3,
          bg: '#EEF4FF',
          color: '#2563EB'
        },
        {
          title: 'Open Tickets',
          value: statusCount.OPEN,
          icon: Activity,
          bg: '#FFF7E6',
          color: '#F59E0B'
        },
        {
          title: 'Resolved',
          value: statusCount.RESOLVED,
          icon: CheckCircle2,
          bg: '#ECFDF3',
          color: '#10B981'
        }
      ],

      statusData: Object.keys(statusCount).map(key => ({
        name: key,
        value: statusCount[key],
        color: STATUS_COLORS[key]
      })),

      priorityData: Object.keys(priorityCount).map(key => ({
        name: key,
        value: priorityCount[key]
      })),

      departmentData: Object.keys(departmentCount).map(key => ({
        name: key,
        value: departmentCount[key]
      }))

    };

  }, [tickets]);

  const totalTickets = report.statusData.reduce(
    (sum, item) => sum + item.value,
    0
  );
  return (
  <div className="reports-page">

    <div className="page-header">
      <h1>Reports</h1>
      <p>Live analytics across your service desk.</p>
    </div>

    <div className="stats-row">
      {report.statCards.map((card, index) => {

        const Icon = card.icon;

        return (
          <div className="stat-card" key={index}>

            <div className="stat-info">
              <h3>{card.title}</h3>
              <div className="stat-value">{card.value}</div>
            </div>

            <div
              className="stat-icon-wrapper"
              style={{ background: card.bg }}
            >
              <Icon
                size={22}
                strokeWidth={2.2}
                color={card.color}
              />
            </div>

          </div>
        );

      })}
    </div>

    <div className="charts-row">

      <div className="chart-card">

        <h2>Ticket Status Breakdown</h2>

        <div className="pie-chart-container">

          <ResponsiveContainer width="100%" height="100%">

            <PieChart>

              <Pie
                data={report.statusData}
                dataKey="value"
                cx="36%"
                cy="50%"
                innerRadius={78}
                outerRadius={108}
                stroke="#ffffff"
                strokeWidth={4}
              >

                {report.statusData.map((item, index) => (
                  <Cell
                    key={index}
                    fill={item.color}
                  />
                ))}

              </Pie>

              <text
                x="36%"
                y="47%"
                textAnchor="middle"
                fontSize="42"
                fontWeight="700"
                fill="#111827"
              >
                {totalTickets}
              </text>

              <text
                x="36%"
                y="56%"
                textAnchor="middle"
                fontSize="14"
                fill="#64748B"
              >
                Tickets
              </text>

              <Legend
                align="right"
                verticalAlign="middle"
                layout="vertical"
                iconType="circle"
              />

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      <div className="chart-card">

        <h2>Priority Distribution</h2>

        <div className="bar-chart-container">

          <ResponsiveContainer width="100%" height="100%">

            <BarChart
              data={report.priorityData}
              margin={{
                top: 15,
                right: 10,
                left: -20,
                bottom: 0
              }}
            >

              <CartesianGrid
                vertical={false}
                stroke="#EEF2F7"
              />

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

              <Tooltip />

              <Bar
                dataKey="value"
                fill="#7C3AED"
                radius={[5, 5, 0, 0]}
                maxBarSize={42}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>

    <div className="department-breakdown-section">

      <div className="chart-card">

        <h2>Ticket Department Breakdown</h2>

        <div className="horizontal-bar-container">

          <ResponsiveContainer width="100%" height="100%">

            <BarChart
              layout="vertical"
              data={report.departmentData}
              margin={{
                top: 5,
                right: 15,
                left: -10,
                bottom: 0
              }}
            >

              <XAxis
                type="number"
                hide
              />

              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: '#64748B',
                  fontSize: 13
                }}
              />

              <Tooltip />

              <Bar
                dataKey="value"
                fill="#8B5CF6"
                radius={[10, 10, 10, 10]}
                barSize={36}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>

  </div>
);

};

export default ReportsPage;