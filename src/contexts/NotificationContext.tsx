import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useProject } from './ProjectContext';
import { useLog } from './LogContext';
import { toast } from 'react-hot-toast';

export type NotificationType = 'rfi' | 'nc' | 'document' | 'test' | 'material' | 'checklist';

export interface EmailConfig {
  projectId: string;
  types: NotificationType[];
  recipients: string[];
}

interface NotificationContextType {
  sendNotification: (type: NotificationType, subject: string, content: string, attachments?: File[]) => Promise<void>;
  getEmailConfig: (projectId: string) => EmailConfig | null;
  updateEmailConfig: (config: EmailConfig) => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { activeProject } = useProject();
  const { addLog } = useLog();
  const [isLoading, setIsLoading] = useState(false);

  // Mock email configurations
  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([
    {
      projectId: '1',
      types: ['rfi', 'nc', 'document'],
      recipients: ['fiscal@asch.pt', 'admin@asch.pt']
    }
  ]);

  const sendNotification = async (
    type: NotificationType,
    subject: string,
    content: string,
    attachments?: File[]
  ) => {
    setIsLoading(true);
    try {
      if (!activeProject) {
        throw new Error('No active project');
      }

      const config = emailConfigs.find(c => c.projectId === activeProject.id);
      if (!config || !config.types.includes(type)) {
        console.log('No email configuration for this notification type');
        return;
      }

      // In a real implementation, this would call an edge function to send the email
      console.log('Sending email notification:', {
        to: config.recipients,
        subject,
        content,
        attachments
      });

      addLog('notification_sent', `Email notification sent: ${subject}`);
      toast.success('Notificação enviada com sucesso');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Erro ao enviar notificação');
    } finally {
      setIsLoading(false);
    }
  };

  const getEmailConfig = (projectId: string) => {
    return emailConfigs.find(c => c.projectId === projectId) || null;
  };

  const updateEmailConfig = async (config: EmailConfig) => {
    setIsLoading(true);
    try {
      setEmailConfigs(prev => {
        const index = prev.findIndex(c => c.projectId === config.projectId);
        if (index >= 0) {
          const newConfigs = [...prev];
          newConfigs[index] = config;
          return newConfigs;
        }
        return [...prev, config];
      });

      addLog('notification_config_update', `Email configuration updated for project ${config.projectId}`);
      toast.success('Configurações de email atualizadas');
    } catch (error) {
      console.error('Error updating email config:', error);
      toast.error('Erro ao atualizar configurações de email');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    sendNotification,
    getEmailConfig,
    updateEmailConfig,
    isLoading
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}