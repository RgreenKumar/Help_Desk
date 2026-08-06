import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/axios';

export const AuthContext = createContext();

const normalizeRole = (role) => {
  if (!role) return '';

  return String(role)
    .replace(/^ROLE_/i, '')
    .trim()
    .toUpperCase();
};

const getSavedUser = () => {
  try {
    const saved = localStorage.getItem('user');

    if (!saved) {
      return null;
    }

    const parsedUser = JSON.parse(saved);

    return {
      ...parsedUser,
      role: normalizeRole(parsedUser.role)
    };
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser);

  const [token, setToken] = useState(
    () => localStorage.getItem('token') || null
  );

  const [setupRequired, setSetupRequired] = useState(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }

    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [user, token]);

  const login = async (email, password, role) => {
    const response = await api.post('/auth/login', {
      email,
      password,
      role
    });

    const data = response.data;

    const loggedInUser = {
      email: data.email,
      role: normalizeRole(data.role || role),
      name: data.name
    };

    setUser(loggedInUser);
    setToken(data.token);

    localStorage.setItem(
      'user',
      JSON.stringify(loggedInUser)
    );

    localStorage.setItem('token', data.token);

    return {
      ...data,
      role: loggedInUser.role
    };
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('user');
    localStorage.removeItem('token');

    window.location.href = '/login';
  };

  const checkSetup = async () => {
    const response = await api.get('/auth/check-setup');

    setSetupRequired(response.data.setupRequired);

    return response.data;
  };

  const setupAdmin = async (data) => {
    await api.post('/auth/setup-admin', data);

    setSetupRequired(false);

    return { success: true };
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        logout,
        checkSetup,
        setupAdmin,
        setupRequired
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (normalizeRole(user?.role) !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};