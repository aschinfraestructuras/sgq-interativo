import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useLog } from './LogContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  projectId: string;
  moduleType: 'document' | 'test' | 'material' | 'nc' | 'checklist' | 'rfi';
  moduleId: string;
}

interface FileContextType {
  uploadFile: (file: File, moduleType: string, moduleId: string) => Promise<FileInfo>;
  deleteFile: (fileId: string) => Promise<void>;
  getFiles: (moduleType: string, moduleId: string) => Promise<FileInfo[]>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { addLog } = useLog();

  const uploadFile = async (
    file: File,
    moduleType: string,
    moduleId: string
  ): Promise<FileInfo> => {
    if (!user) throw new Error('User not authenticated');
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const fileId = `${Date.now()}-${file.name}`;
      const filePath = `${moduleType}/${moduleId}/${fileId}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl }, error: urlError } = await supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      if (urlError) throw urlError;

      // Create file record
      const fileInfo: FileInfo = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        url: publicUrl,
        uploadedBy: user.id,
        uploadedAt: new Date().toISOString(),
        projectId: user.activeProjectId,
        moduleType,
        moduleId
      };

      const { error: dbError } = await supabase
        .from('files')
        .insert([fileInfo]);

      if (dbError) throw dbError;

      addLog('document_upload', `Arquivo carregado: ${file.name}`);
      toast.success('Arquivo carregado com sucesso');

      return fileInfo;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao carregar arquivo');
      throw error;
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { error: deleteError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (deleteError) throw deleteError;

      addLog('document_delete', `Arquivo removido: ${fileId}`);
      toast.success('Arquivo removido com sucesso');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Erro ao remover arquivo');
      throw error;
    }
  };

  const getFiles = async (moduleType: string, moduleId: string): Promise<FileInfo[]> => {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('moduleType', moduleType)
        .eq('moduleId', moduleId);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting files:', error);
      return [];
    }
  };

  const value = {
    uploadFile,
    deleteFile,
    getFiles
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  );
}

export function useFile() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFile must be used within a FileProvider');
  }
  return context;
}