import React from 'react';
import { Routes, Route, useParams, Link, useLocation, Navigate } from 'react-router-dom';
import { FileText, FlaskRound as Flask, Package, Users, AlertTriangle, CheckSquare, LineChart, HelpCircle, History } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';
import ProjectHeader from '../../components/ProjectHeader';
import NoProjectWarning from '../../components/NoProjectWarning';
import LoadingSpinner from '../../components/LoadingSpinner';
import Documentos from './Documentos';
import Ensaios from './Ensaios';
import Materiais from './Materiais';
import Fornecedores from './Fornecedores';
import NaoConformidades from './NaoConformidades';
import Checklists from './Checklists';
import Indicadores from './Indicadores';
import RFIs from './RFIs';
import LogHistory from '../LogHistory';

const projetoNavigation = [
  { name: 'Documentos', path: 'documentos', icon: FileText },
  { name: 'Ensaios', path: 'ensaios', icon: Flask },
  { name: 'Materiais', path: 'materiais', icon: Package },
  { name: 'Fornecedores', path: 'fornecedores', icon: Users },
  { name: 'Não Conformidades', path: 'nao-conformidades', icon: AlertTriangle },
  { name: 'Checklists', path: 'checklists', icon: CheckSquare },
  { name: 'RFIs', path: 'rfis', icon: HelpCircle },
  { name: 'Indicadores', path: 'indicadores', icon: LineChart, requiredRole: 'fiscal' },
  { name: 'Histórico', path: 'historico', icon: History, requiredRole: 'admin' }
];

export default function ProjetoLayout() {
  const { id } = useParams();
  const location = useLocation();
  const { activeProject, getProjectRole } = useAuth();
  const { isLoading } = useProject();
  const currentPath = location.pathname;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!activeProject) {
    return <NoProjectWarning />;
  }

  const projectRole = getProjectRole(activeProject.id);

  const filteredNavigation = projetoNavigation.filter(item => {
    if (!item.requiredRole) return true;
    if (!projectRole) return false;
    
    switch (projectRole) {
      case 'admin':
        return true;
      case 'fiscal':
        return item.requiredRole !== 'admin';
      case 'viewer':
        return item.requiredRole === 'viewer';
      default:
        return false;
    }
  });

  if (currentPath === `/projeto/${id}`) {
    return <Navigate to={`/projeto/${id}/documentos`} replace />;
  }

  return (
    <div className="flex h-full">
      <div className="w-64 bg-white border-r border-gray-200">
        <ProjectHeader />
        <nav className="p-4 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = currentPath.includes(`/projeto/${id}/${item.path}`);
            return (
              <Link
                key={item.path}
                to={`/projeto/${id}/${item.path}`}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="documentos" element={<Documentos />} />
          <Route path="ensaios" element={<Ensaios />} />
          <Route path="materiais" element={<Materiais />} />
          <Route path="fornecedores" element={<Fornecedores />} />
          <Route path="nao-conformidades" element={<NaoConformidades />} />
          <Route path="checklists" element={<Checklists />} />
          <Route path="rfis" element={<RFIs />} />
          <Route path="indicadores" element={<Indicadores />} />
          <Route path="historico" element={<LogHistory />} />
        </Routes>
      </div>
    </div>
  );
}