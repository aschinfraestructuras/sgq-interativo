import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

export type HistoryItemType = 'document' | 'test' | 'material' | 'nc' | 'checklist' | 'rfi';

export interface HistoryItem {
  id: string;
  itemId: string;
  itemType: HistoryItemType;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete';
  changes: {
    field: string;
    oldValue?: string;
    newValue: string;
  }[];
  timestamp: string;
}

export interface Comment {
  id: string;
  itemId: string;
  itemType: HistoryItemType;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

interface HistoryContextType {
  addHistoryItem: (
    itemId: string,
    itemType: HistoryItemType,
    action: HistoryItem['action'],
    changes: HistoryItem['changes']
  ) => void;
  addComment: (
    itemId: string,
    itemType: HistoryItemType,
    content: string
  ) => void;
  getHistory: (itemId: string, itemType: HistoryItemType) => HistoryItem[];
  getComments: (itemId: string, itemType: HistoryItemType) => Comment[];
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

// Mock data
const mockHistory: HistoryItem[] = [
  {
    id: '1',
    itemId: '1',
    itemType: 'material',
    userId: '1',
    userName: 'João Silva',
    action: 'create',
    changes: [
      { field: 'estado', newValue: 'Pendente' }
    ],
    timestamp: '2024-03-15T10:30:00Z'
  },
  {
    id: '2',
    itemId: '1',
    itemType: 'material',
    userId: '2',
    userName: 'Maria Santos',
    action: 'update',
    changes: [
      { field: 'estado', oldValue: 'Pendente', newValue: 'Aprovado' }
    ],
    timestamp: '2024-03-16T14:20:00Z'
  }
];

const mockComments: Comment[] = [
  {
    id: '1',
    itemId: '1',
    itemType: 'material',
    userId: '1',
    userName: 'João Silva',
    content: 'Material recebido conforme especificações.',
    timestamp: '2024-03-15T10:35:00Z'
  },
  {
    id: '2',
    itemId: '1',
    itemType: 'material',
    userId: '2',
    userName: 'Maria Santos',
    content: 'Certificado verificado e aprovado.',
    timestamp: '2024-03-16T14:25:00Z'
  }
];

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>(mockHistory);
  const [comments, setComments] = useState<Comment[]>(mockComments);

  const addHistoryItem = (
    itemId: string,
    itemType: HistoryItemType,
    action: HistoryItem['action'],
    changes: HistoryItem['changes']
  ) => {
    if (!user) return;

    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      itemId,
      itemType,
      userId: user.id,
      userName: user.name,
      action,
      changes,
      timestamp: new Date().toISOString()
    };

    setHistory(prev => [...prev, newHistoryItem]);
  };

  const addComment = (
    itemId: string,
    itemType: HistoryItemType,
    content: string
  ) => {
    if (!user) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      itemId,
      itemType,
      userId: user.id,
      userName: user.name,
      content,
      timestamp: new Date().toISOString()
    };

    setComments(prev => [...prev, newComment]);
  };

  const getHistory = (itemId: string, itemType: HistoryItemType) => {
    return history
      .filter(item => item.itemId === itemId && item.itemType === itemType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getComments = (itemId: string, itemType: HistoryItemType) => {
    return comments
      .filter(comment => comment.itemId === itemId && comment.itemType === itemType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const value = {
    addHistoryItem,
    addComment,
    getHistory,
    getComments
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}