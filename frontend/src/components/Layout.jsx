import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-container">
      <Sidebar />
      <TopBar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
