import React, { createContext, useContext, useState } from 'react';
import { create } from 'zustand';
import { useAuth } from './AuthContext';
import { format } from 'date-fns';

export type LogType = 
  | 'login'
  | 'logout'
  | 'project_create'
  | 'project_update'
  | 'document_upload'
  | 'document_view'
  | 'test_create'
  | 'test_update'
  | 'material_create'
  | 'material_update'
  | 'nc_create'
  | 'nc_update'
  | 'checklist_create'
  | 'checklist_update'
  | 'rfi_create'
  | 'rfi_update'
  | 'profile_update'
  | 'access_granted'
  | 'access_revoked';

export interface LogEntry {
  id: string;
  timestamp: string;
  type: LogType;
  userId: string;
  userName: string;
  userRole: string;
  projectId?: string;
  projectName?: string;
  description: string;
  details?: Record<string, any>;
}

interface LogState {
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  getLogs: (filters?: {
    userId?: string;
    projectId?: string;
    type?: LogType;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => LogEntry[];
}

const useLogStore = create<LogState>((set, get) => ({
  logs: [],
  addLog: (logData) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...logData,
    };
    set((state) => ({ logs: [newLog, ...state.logs] }));
  },
  getLogs: (filters) => {
    const { logs } = get();
    if (!filters) return logs;

    return logs.filter((log) => {
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.projectId && log.projectId !== filters.projectId) return false;
      if (filters.type && log.type !== filters.type) return false;
      if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          log.description.toLowerCase().includes(searchLower) ||
          log.userName.toLowerCase().includes(searchLower) ||
          (log.projectName && log.projectName.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  },
}));

interface LogContextType {
  addLog: (type: LogType, description: string, details?: Record<string, any>) => void;
  getLogs: LogState['getLogs'];
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: React.ReactNode }) {
  const { user, activeProject } = useAuth();
  const logStore = useLogStore();

  const addLog = (type: LogType, description: string, details?: Record<string, any>) => {
    if (!user) return;

    logStore.addLog({
      type,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      projectId: activeProject?.id,
      projectName: activeProject?.nome,
      description,
      details,
    });
  };

  const value = {
    addLog,
    getLogs: logStore.getLogs,
  };

  return (
    <LogContext.Provider value={value}>
      {children}
    </LogContext.Provider>
  );
}

export function useLog() {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error('useLog must be used within a LogProvider');
  }
  return context;
}