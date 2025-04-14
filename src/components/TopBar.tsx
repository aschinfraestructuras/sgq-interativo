import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Bell, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import LanguageSwitcher from './LanguageSwitcher';
import ProjectSelector from './ProjectSelector';
import { toast } from 'react-hot-toast';

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, accessCode, logout } = useAuth();
  const { activeProject, clearActiveProject } = useProject();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && buttonRef.current && 
          !menuRef.current.contains(event.target as Node) && 
          !buttonRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      clearActiveProject();
      await logout();
      toast.success('Sessão terminada com sucesso');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao terminar sessão');
    }
  };

  return (
    <div className="h-16 bg-white border-b border-brand-100 px-6 flex items-center justify-between">
      {activeProject && (
        <div className="text-sm">
          <span className="text-gray-500">Projeto:</span>
          <span className="ml-2 font-medium text-gray-900">{activeProject.nome}</span>
        </div>
      )}
      
      <div className="flex items-center gap-6 ml-auto">
        {user && <ProjectSelector />}

        <div className="has-tooltip">
          <LanguageSwitcher />
          <span className="tooltip">Alterar Idioma</span>
        </div>

        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
          >
            <div className="p-2 bg-brand-50 rounded-full">
              <User className="h-5 w-5 text-brand-500" />
            </div>
            {user ? (
              <>
                <div className="text-left">
                  <span className="block font-medium text-gray-900">{user.name}</span>
                  <span className="block text-xs text-gray-500">{user.role}</span>
                </div>
              </>
            ) : accessCode ? (
              <span className="font-medium">Acesso Temporário</span>
            ) : null}
            <ChevronDown className={`h-4 w-4 transition-transform ${isMenuOpen ? 'transform rotate-180' : ''}`} />
          </button>

          {isMenuOpen && (
            <div
              ref={menuRef}
              className="dropdown-menu"
              role="menu"
            >
              {user && (
                <>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button
                    className="dropdown-item"
                    role="menuitem"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Definições
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="dropdown-item text-accent-600 hover:bg-accent-50"
                role="menuitem"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Terminar Sessão
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}