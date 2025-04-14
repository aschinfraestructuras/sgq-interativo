import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useLog } from './LogContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export interface ShareLink {
  id: string;
  documentId: string;
  documentName: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  createdBy: string;
  projectId: string;
  isExpired: boolean;
}

interface ShareContextType {
  createShareLink: (documentId: string, documentName: string, expiresAt: string) => Promise<ShareLink>;
  getShareLink: (token: string) => Promise<ShareLink | null>;
  revokeShareLink: (id: string) => Promise<void>;
  getDocumentShareLinks: (documentId: string) => Promise<ShareLink[]>;
  isLoading: boolean;
}

const ShareContext = createContext<ShareContextType | undefined>(undefined);

// Mock data for development
const mockShareLinks: ShareLink[] = [
  {
    id: '1',
    documentId: 'doc1',
    documentName: 'Project Specs.pdf',
    token: 'abc123',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'John Doe',
    projectId: '1',
    isExpired: false
  }
];

export function ShareProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { addLog } = useLog();
  const [isLoading, setIsLoading] = useState(false);

  const createShareLink = async (
    documentId: string,
    documentName: string,
    expiresAt: string
  ): Promise<ShareLink> => {
    setIsLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');

      const token = generateToken();
      const shareLink: ShareLink = {
        id: Date.now().toString(),
        documentId,
        documentName,
        token,
        createdAt: new Date().toISOString(),
        expiresAt,
        createdBy: user.name,
        projectId: '1', // Replace with actual project ID
        isExpired: false
      };

      // In production, save to Supabase
      // const { data, error } = await supabase
      //   .from('share_links')
      //   .insert([shareLink])
      //   .select()
      //   .single();
      // if (error) throw error;

      addLog('document_share', `Share link created for document: ${documentName}`);
      toast.success('Link de partilha criado com sucesso');

      return shareLink;
    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error('Erro ao criar link de partilha');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getShareLink = async (token: string): Promise<ShareLink | null> => {
    setIsLoading(true);
    try {
      // In production, fetch from Supabase
      // const { data, error } = await supabase
      //   .from('share_links')
      //   .select('*')
      //   .eq('token', token)
      //   .single();
      // if (error) throw error;

      const shareLink = mockShareLinks.find(link => link.token === token);
      if (!shareLink) return null;

      const isExpired = new Date(shareLink.expiresAt) < new Date();
      return {
        ...shareLink,
        isExpired
      };
    } catch (error) {
      console.error('Error getting share link:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const revokeShareLink = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      // In production, delete from Supabase
      // const { error } = await supabase
      //   .from('share_links')
      //   .delete()
      //   .eq('id', id);
      // if (error) throw error;

      addLog('document_share_revoke', `Share link revoked: ${id}`);
      toast.success('Link de partilha revogado');
    } catch (error) {
      console.error('Error revoking share link:', error);
      toast.error('Erro ao revogar link de partilha');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentShareLinks = async (documentId: string): Promise<ShareLink[]> => {
    setIsLoading(true);
    try {
      // In production, fetch from Supabase
      // const { data, error } = await supabase
      //   .from('share_links')
      //   .select('*')
      //   .eq('documentId', documentId);
      // if (error) throw error;

      return mockShareLinks
        .filter(link => link.documentId === documentId)
        .map(link => ({
          ...link,
          isExpired: new Date(link.expiresAt) < new Date()
        }));
    } catch (error) {
      console.error('Error getting document share links:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    createShareLink,
    getShareLink,
    revokeShareLink,
    getDocumentShareLinks,
    isLoading
  };

  return <ShareContext.Provider value={value}>{children}</ShareContext.Provider>;
}

export function useShare() {
  const context = useContext(ShareContext);
  if (context === undefined) {
    throw new Error('useShare must be used within a ShareProvider');
  }
  return context;
}

// Helper function to generate a random token
function generateToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}