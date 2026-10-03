import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>404</h1>
      <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Page not found</p>
      <Link to="/dashboard" style={{ backgroundColor: 'var(--primary)', color: 'var(--white)', padding: '10px 24px', borderRadius: '8px', fontWeight: '500', textDecoration: 'none' }}>
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
