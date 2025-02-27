import React, { createContext, useContext } from 'react';
import { SystemRoles } from 'librechat-data-provider';

// 定义认证上下文类型
const AuthContext = createContext({
  user: {
    id: 'mock-user-id',
    name: 'Mock User',
    username: 'mock_user',
    display_name: 'Mock User',
    email: 'mock@example.com',
    emailVerified: true,
    image: '',
    role: SystemRoles.USER
  },
  token: 'mock-token',
  isAuthenticated: true,
  error: null,
  loading: false,
  login: () => Promise.resolve({ success: true }),
  logout: () => Promise.resolve({ success: true }),
  register: () => Promise.resolve({ success: true }),
  clearError: () => {},
  setUser: () => {},
  setToken: () => {},
  setIsAuthenticated: () => {}
});

// 认证上下文提供者
const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContext.Provider 
      value={{
        user: {
          id: 'mock-user-id',
          name: 'Mock User',
          username: 'mock_user',
          display_name: 'Mock User',
          email: 'mock@example.com',
          emailVerified: true,
          image: '',
          role: SystemRoles.USER
        },
        token: 'mock-token',
        isAuthenticated: true,
        error: null,
        loading: false,
        login: () => Promise.resolve({ success: true }),
        logout: () => Promise.resolve({ success: true }),
        register: () => Promise.resolve({ success: true }),
        clearError: () => {},
        setUser: () => {},
        setToken: () => {},
        setIsAuthenticated: () => {}
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 认证上下文钩子
const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext should be used inside AuthProvider');
  }
  return context;
};

export { AuthContextProvider, useAuthContext, AuthContext };
