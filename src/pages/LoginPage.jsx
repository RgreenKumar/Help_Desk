import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminModal from '../components/AdminModal';
import './LoginPage.css';

const LoginPage = () => {
  const { login, setupRequired, checkSetup } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    checkSetup().catch((error) => {
      console.error('Failed to check admin setup:', error);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setLoggingIn(true);

    try {
      await login(email, password, role);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        '';

      if (
        backendMessage
          .toLowerCase()
          .includes('selected role does not match')
      ) {
        setErrorMessage(
          'Selected role does not match this account.'
        );
      } else if (
        backendMessage
          .toLowerCase()
          .includes('role is required')
      ) {
        setErrorMessage('Please select a role.');
      } else {
        setErrorMessage('Invalid email or password.');
      }
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-branding">
          <h2>RGreen ServiceHub</h2>
        </div>

        <div className="login-illustration">
          <img
            src="/login-illustration.jpg"
            alt="Illustration"
            style={{
              maxWidth: '380px',
              display: 'none'
            }}
          />
        </div>

        <div className="login-footer">
          <p>
            &copy; {new Date().getFullYear()} RGreen. All rights reserved.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <a href="#" className="back-link">
            ← Back to home
          </a>

          <h1 className="login-title">
            Welcome back
          </h1>

          <p className="login-subtitle">
            Sign in to access your dashboard.
          </p>

          {setupRequired && (
            <div className="warning-banner">
              <AlertTriangle size={20} />

              <div>
                <strong>No account found.</strong>
                <p>
                  System requires an initial admin setup.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="warning-banner">
              <AlertTriangle size={20} />

              <div>
                <strong>Sign in failed</strong>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="login-form"
          >
            <div className="form-group">
              <label>Email *</label>

              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage('');
                }}
                required
              />
            </div>

            <div className="form-group">
              <label>Password *</label>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                required
              />
            </div>

            <div className="form-group">
              <label>Role *</label>

              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setErrorMessage('');
                }}
                required
              >
                <option value="Admin">
                  Admin
                </option>

                <option value="Support Engineer">
                  Support Engineer
                </option>

                <option value="Employee">
                  Employee
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-signin"
              disabled={loggingIn}
            >
              {loggingIn ? 'Signing In...' : 'Sign In'}

              {!loggingIn && (
                <ArrowRight size={18} />
              )}
            </button>
          </form>

          {setupRequired && (
            <button
              className="btn-create-admin"
              onClick={() =>
                setShowAdminModal(true)
              }
            >
              + Create first Admin account
            </button>
          )}
        </div>
      </div>

      {showAdminModal && (
        <AdminModal
          onClose={() =>
            setShowAdminModal(false)
          }
        />
      )}
    </div>
  );
};

export default LoginPage;