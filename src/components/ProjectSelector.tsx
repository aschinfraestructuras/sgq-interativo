import React from 'react';
import { Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ProjectSelector() {
  const { activeProject, userProjects, setActiveProject } = useAuth();

  if (!userProjects.length) return null;

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
        <Building2 className="h-5 w-5" />
        <span className="hidden md:inline">
          {activeProject?.nome || 'Selecionar Projeto'}
        </span>
      </button>
      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 hidden group-hover:block">
        {userProjects.map((project) => (
          <button
            key={project.projectId}
            onClick={() => setActiveProject({
              id: project.projectId,
              nome: project.projectName,
            })}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
              activeProject?.id === project.projectId ? 'text-brand-600 font-medium' : 'text-gray-700'
            }`}
          >
            <span>{project.projectName}</span>
            <span className="text-xs text-gray-500">{project.role}</span>
          </button>
        ))}
      </div>
    </div>
  );
}