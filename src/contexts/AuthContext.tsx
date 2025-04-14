import React, { createContext, useContext, useState } from 'react';
import { create } from 'zustand';

export type UserRole = 'admin' | 'fiscal' | 'viewer';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface Project {
  id: string;
  nome: string;
}

interface UserProject {
  projectId: string;
  projectName: string;
  role: UserRole;
}

interface AccessCode {
  code: string;
  projectId: string;
  expiresAt: string;
}

interface AuthState {
  user: User | null;
  accessCode: AccessCode | null;
  activeProject: Project | null;
  userProjects: UserProject[];
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAccessCode: (code: AccessCode | null) => void;
  setActiveProject: (project: Project | null) => void;
  setUserProjects: (projects: UserProject[]) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessCode: null,
  activeProject: null,
  userProjects: [],
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAccessCode: (code) => set({ accessCode: code, isAuthenticated: !!code }),
  setActiveProject: (project) => set({ activeProject: project }),
  setUserProjects: (projects) => set({ userProjects: projects }),
  logout: () => set({ 
    user: null, 
    accessCode: null, 
    activeProject: null,
    userProjects: [],
    isAuthenticated: false 
  }),
}));

// Mock data for demonstration
const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@asch.pt', role: 'admin' },
  { id: '2', name: 'Fiscal User', email: 'fiscal@asch.pt', role: 'fiscal' },
  { id: '3', name: 'Viewer User', email: 'viewer@asch.pt', role: 'viewer' },
];

const mockUserProjects: Record<string, UserProject[]> = {
  '1': [
    { projectId: '1', projectName: 'Edifício Residencial Aurora', role: 'admin' },
    { projectId: '2', projectName: 'Centro Comercial Estrela', role: 'admin' },
  ],
  '2': [
    { projectId: '1', projectName: 'Edifício Residencial Aurora', role: 'fiscal' },
  ],
  '3': [
    { projectId: '2', projectName: 'Centro Comercial Estrela', role: 'viewer' },
  ],
};

const mockAccessCodes: AccessCode[] = [
  {
    code: 'PROJ001',
    projectId: '1',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

interface AuthContextType {
  login: (email: string, password: string) => Promise<User>;
  loginWithAccessCode: (code: string) => Promise<AccessCode>;
  logout: () => void;
  user: User | null;
  accessCode: AccessCode | null;
  activeProject: Project | null;
  userProjects: UserProject[];
  isAuthenticated: boolean;
  setActiveProject: (project: Project | null) => void;
  hasProjectAccess: (projectId: string) => boolean;
  getProjectRole: (projectId: string) => UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { 
    user, 
    accessCode, 
    activeProject,
    userProjects,
    isAuthenticated, 
    setUser, 
    setAccessCode,
    setActiveProject,
    setUserProjects,
    logout: storeLogout 
  } = useAuthStore();

  const login = async (email: string, password: string): Promise<User> => {
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const userProjects = mockUserProjects[user.id] || [];
    setUser(user);
    setUserProjects(userProjects);
    
    if (userProjects.length > 0) {
      setActiveProject({
        id: userProjects[0].projectId,
        nome: userProjects[0].projectName,
      });
    }
    
    return user;
  };

  const loginWithAccessCode = async (code: string): Promise<AccessCode> => {
    const accessCode = mockAccessCodes.find(ac => ac.code === code);
    if (!accessCode) {
      throw new Error('Invalid access code');
    }
    if (new Date(accessCode.expiresAt) < new Date()) {
      throw new Error('Access code expired');
    }
    setAccessCode(accessCode);
    return accessCode;
  };

  const logout = () => {
    storeLogout();
  };

  const hasProjectAccess = (projectId: string): boolean => {
    if (accessCode) {
      return accessCode.projectId === projectId;
    }
    return userProjects.some(p => p.projectId === projectId);
  };

  const getProjectRole = (projectId: string): UserRole | null => {
    if (accessCode && accessCode.projectId === projectId) {
      return 'viewer';
    }
    const project = userProjects.find(p => p.projectId === projectId);
    return project?.role || null;
  };

  const value = {
    login,
    loginWithAccessCode,
    logout,
    user,
    accessCode,
    activeProject,
    userProjects,
    isAuthenticated,
    setActiveProject,
    hasProjectAccess,
    getProjectRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth() {
  const { isAuthenticated, user, accessCode } = useAuth();
  
  if (!isAuthenticated) {
    throw new Error('User is not authenticated');
  }

  return { user, accessCode };
}

export function useAuthorization(requiredRole?: UserRole) {
  const { user, activeProject, getProjectRole } = useAuth();

  const checkPermission = (role: UserRole): boolean => {
    if (!user || !activeProject) return false;
    
    const projectRole = getProjectRole(activeProject.id);
    if (!projectRole) return false;

    switch (projectRole) {
      case 'admin':
        return true;
      case 'fiscal':
        return role !== 'admin';
      case 'viewer':
        return role === 'viewer';
      default:
        return false;
    }
  };

  return {
    canAccess: requiredRole ? checkPermission(requiredRole) : true,
    role: user?.role,
  };
}