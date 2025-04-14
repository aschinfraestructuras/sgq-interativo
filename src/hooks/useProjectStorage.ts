import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useProjectStorage() {
  const { activeProject, setActiveProject } = useAuth();

  // Load active project from localStorage on mount
  useEffect(() => {
    const storedProject = localStorage.getItem('activeProject');
    if (storedProject) {
      try {
        const project = JSON.parse(storedProject);
        setActiveProject(project);
      } catch (error) {
        console.error('Error loading stored project:', error);
        localStorage.removeItem('activeProject');
      }
    }
  }, []);

  // Save active project to localStorage whenever it changes
  useEffect(() => {
    if (activeProject) {
      localStorage.setItem('activeProject', JSON.stringify(activeProject));
    } else {
      localStorage.removeItem('activeProject');
    }
  }, [activeProject]);

  return { activeProject };
}