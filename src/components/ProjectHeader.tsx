import React from 'react';
import { Building2, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ProjectHeader() {
  const { activeProject, getProjectRole } = useAuth();

  if (!activeProject) return null;

  const role = getProjectRole(activeProject.id);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Building2 className="h-6 w-6 text-brand-500" />
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">
              {activeProject.nome}
            </h1>
            <p className="text-sm text-gray-500">
              Perfil de Acesso: <span className="font-medium">{role}</span>
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          <Clock className="h-4 w-4 inline mr-1" />
          {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}