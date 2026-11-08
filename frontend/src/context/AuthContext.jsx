import { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agroconecta_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiService.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('agroconecta_user', JSON.stringify(res.user));
        localStorage.setItem('agroconecta_token', res.token);
        return { success: true };
      }
      return { success: false, message: res.message || 'Error de credenciales.' };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (demoUser) => {
    setUser(demoUser);
    localStorage.setItem('agroconecta_user', JSON.stringify(demoUser));
    localStorage.setItem('agroconecta_token', `demo-token-${demoUser.id}`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agroconecta_user');
    localStorage.removeItem('agroconecta_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
