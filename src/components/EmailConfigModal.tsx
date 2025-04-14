import React, { useState } from 'react';
import { X, Mail, Plus, Trash } from 'lucide-react';
import { useNotification, NotificationType, EmailConfig } from '../contexts/NotificationContext';

interface EmailConfigModalProps {
  projectId: string;
  onClose: () => void;
}

const notificationTypes: { value: NotificationType; label: string }[] = [
  { value: 'rfi', label: 'RFIs' },
  { value: 'nc', label: 'Não Conformidades' },
  { value: 'document', label: 'Documentos' },
  { value: 'test', label: 'Ensaios' },
  { value: 'material', label: 'Materiais' },
  { value: 'checklist', label: 'Checklists' }
];

export default function EmailConfigModal({ projectId, onClose }: EmailConfigModalProps) {
  const { getEmailConfig, updateEmailConfig } = useNotification();
  const currentConfig = getEmailConfig(projectId);

  const [config, setConfig] = useState<EmailConfig>({
    projectId,
    types: currentConfig?.types || [],
    recipients: currentConfig?.recipients || []
  });

  const [newEmail, setNewEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateEmailConfig(config);
    onClose();
  };

  const addEmail = () => {
    if (newEmail && !config.recipients.includes(newEmail)) {
      setConfig(prev => ({
        ...prev,
        recipients: [...prev.recipients, newEmail]
      }));
      setNewEmail('');
    }
  };

  const removeEmail = (email: string) => {
    setConfig(prev => ({
      ...prev,
      recipients: prev.recipients.filter(e => e !== email)
    }));
  };

  const toggleNotificationType = (type: NotificationType) => {
    setConfig(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Configurar Notificações por Email</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipos de Notificação
            </label>
            <div className="space-y-2">
              {notificationTypes.map(type => (
                <label key={type.value} className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={config.types.includes(type.value)}
                    onChange={() => toggleNotificationType(type.value)}
                  />
                  <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destinatários
            </label>
            <div className="space-y-2">
              {config.recipients.map(email => (
                <div key={email} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEmail(email)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Adicionar email..."
                className="flex-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={addEmail}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}