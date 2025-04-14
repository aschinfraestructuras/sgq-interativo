import React, { createContext, useContext, useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface Project {
  id: string;
  nome: string;
  localizacao: string;
  cliente: string;
  estado: 'Em Curso' | 'Planeada' | 'Concluída' | 'Suspensa';
  dataInicio: string;
}

interface ProjectState {
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  clearActiveProject: () => void;
}

const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      activeProject: null,
      setActiveProject: (project) => set({ activeProject: project }),
      clearActiveProject: () => set({ activeProject: null }),
    }),
    {
      name: 'project-storage',
    }
  )
);

interface ProjectContextType {
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  clearActiveProject: () => void;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user, accessCode } = useAuth();
  const { activeProject, setActiveProject, clearActiveProject } = useProjectStore();
  const [isLoading, setIsLoading] = useState(true);

  // Clear active project when user logs out
  useEffect(() => {
    if (!user && !accessCode) {
      clearActiveProject();
    }
  }, [user, accessCode]);

  // Load and validate active project
  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      try {
        if (activeProject) {
          // Add validation logic here if needed
          toast.success(`Projeto ativo: ${activeProject.nome}`);
        }
      } catch (error) {
        console.error('Error loading project:', error);
        clearActiveProject();
        toast.error('Erro ao carregar projeto');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [activeProject]);

  const value = {
    activeProject,
    setActiveProject,
    clearActiveProject,
    isLoading,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}