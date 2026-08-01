import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './context/AuthContext';
import './App.css';

import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import CreateTicketPage from './pages/CreateTicketPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import SupportEngineersPage from './pages/SupportEngineersPage';
import DepartmentsPage from './pages/DepartmentsPage';
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import TicketHistoryPage from './pages/TicketHistoryPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route
          path="/employees"
          element={
            <AdminRoute>
              <EmployeesPage />
            </AdminRoute>
          }
        />

        <Route
          path="/support-engineers"
          element={
            <AdminRoute>
              <SupportEngineersPage />
            </AdminRoute>
          }
        />

        <Route
          path="/departments"
          element={
            <AdminRoute>
              <DepartmentsPage />
            </AdminRoute>
          }
        />

        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/raise-ticket" element={<CreateTicketPage />} />
        <Route path="/tickets/create" element={<CreateTicketPage />} />
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/ticket-history" element={<TicketHistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;