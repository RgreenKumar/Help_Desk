import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    adminId: '',
    employeeId: '',
    engineerId: '',
    role: ''
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/profile');

      setProfile(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);

      // Use login information if profile API fails
      if (user) {
        const nameParts = (user.name || '').trim().split(' ');

        setProfile((prev) => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: user.email || '',
          role: user.role || ''
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await api.put('/profile', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone
      });

      setProfile((prev) => ({
        ...prev,
        ...response.data
      }));

      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  const handlePasswordUpdate = async () => {
    if (!password || !confirmPassword) {
      alert('Please enter password and confirm password');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await api.put('/profile/password', {
        password,
        confirmPassword
      });

      alert('Password updated successfully');

      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to update password:', error);
      alert('Failed to update password');
    }
  };

  const getFullName = () => {
    const fullName = `${profile.firstName || ''} ${
      profile.lastName || ''
    }`.trim();

    return fullName || user?.name || 'User';
  };

  const getInitial = () => {
    return getFullName().charAt(0).toUpperCase();
  };

  const getRoleName = () => {
    const role = (profile.role || user?.role || '')
      .replace('ROLE_', '')
      .toUpperCase();

    switch (role) {
      case 'ADMIN':
        return 'Help Desk Admin';

      case 'SUPPORT_ENGINEER':
        return 'Support Engineer';

      case 'EMPLOYEE':
        return 'Employee';

      default:
        return 'User';
    }
  };

  const getUserId = () => {
    const role = (profile.role || user?.role || '')
      .replace('ROLE_', '')
      .toUpperCase();

    if (role === 'ADMIN') {
      return profile.adminId || '-';
    }

    if (role === 'SUPPORT_ENGINEER') {
      return profile.engineerId || '-';
    }

    if (role === 'EMPLOYEE') {
      return profile.employeeId || '-';
    }

    return '-';
  };

  const getIdLabel = () => {
    const role = (profile.role || user?.role || '')
      .replace('ROLE_', '')
      .toUpperCase();

    if (role === 'ADMIN') {
      return 'Admin ID';
    }

    if (role === 'SUPPORT_ENGINEER') {
      return 'Engineer ID';
    }

    if (role === 'EMPLOYEE') {
      return 'Employee ID';
    }

    return 'User ID';
  };

  if (loading) {
    return (
      <div className="profile-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>View and manage your account information.</p>
      </div>

      <div className="profile-content">
        <div className="profile-card profile-details">
          <div className="profile-avatar-section">
            <div className="avatar-circle">
              {getInitial()}
            </div>

            <div className="avatar-info">
              <h2>{getFullName()}</h2>
              <p>{getRoleName()}</p>
            </div>
          </div>

          <form
            className="profile-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="form-grid">
              <div className="form-group">
                <label>First Name</label>

                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>

                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>{getIdLabel()}</label>

                <input
                  type="text"
                  value={getUserId()}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={profile.email || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Phone no</label>

                <input
                  type="tel"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Role</label>

                <input
                  type="text"
                  value={getRoleName()}
                  disabled
                />
              </div>
            </div>

            <button
              type="button"
              className="btn-save"
              onClick={handleSave}
            >
              Save
            </button>
          </form>
        </div>

        <div className="profile-card profile-password">
          <form
            className="password-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="form-group">
              <label>New Password</label>

              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Confirm password</label>

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
              />
            </div>

            <button
              type="button"
              className="btn-update"
              onClick={handlePasswordUpdate}
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;