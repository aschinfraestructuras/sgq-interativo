import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { History, Filter, Download, Search, User, Building2, Calendar } from 'lucide-react';
import { useLog } from '../contexts/LogContext';
import { useAuth } from '../contexts/AuthContext';
import { saveAs } from 'file-saver';

const logTypeLabels: Record<string, string> = {
  login: 'Login',
  logout: 'Logout',
  project_create: 'Criação de Projeto',
  project_update: 'Atualização de Projeto',
  document_upload: 'Upload de Documento',
  document_view: 'Visualização de Documento',
  test_create: 'Criação de Ensaio',
  test_update: 'Atualização de Ensaio',
  material_create: 'Criação de Material',
  material_update: 'Atualização de Material',
  nc_create: 'Criação de NC',
  nc_update: 'Atualização de NC',
  checklist_create: 'Criação de Checklist',
  checklist_update: 'Atualização de Checklist',
  rfi_create: 'Criação de RFI',
  rfi_update: 'Atualização de RFI',
  profile_update: 'Alteração de Perfil',
  access_granted: 'Acesso Concedido',
  access_revoked: 'Acesso Revogado'
};

export default function LogHistory() {
  const { id: projectId } = useParams<{ id?: string }>();
  const { getLogs } = useLog();
  const { user } = useAuth();
  
  const [filters, setFilters] = useState({
    userId: '',
    type: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  const logs = getLogs({
    ...(filters.userId && { userId: filters.userId }),
    ...(filters.type && { type: filters.type }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(projectId && { projectId }),
    ...(filters.search && { search: filters.search })
  });

  const handleExport = () => {
    const csv = [
      ['Data/Hora', 'Tipo', 'Utilizador', 'Perfil', 'Projeto', 'Descrição', 'Detalhes'].join(','),
      ...logs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        logTypeLabels[log.type],
        log.userName,
        log.userRole,
        log.projectName || '-',
        log.description,
        log.details ? JSON.stringify(log.details) : '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `historico-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const getLogTypeColor = (type: string) => {
    if (type.includes('create')) return 'bg-green-100 text-green-800';
    if (type.includes('update')) return 'bg-blue-100 text-blue-800';
    if (type.includes('delete')) return 'bg-red-100 text-red-800';
    if (type.includes('login')) return 'bg-purple-100 text-purple-800';
    if (type.includes('logout')) return 'bg-gray-100 text-gray-800';
    return 'bg-brand-100 text-brand-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <History className="h-6 w-6 text-brand-500" />
            Histórico de Ações
          </h1>
          {projectId && (
            <p className="mt-1 text-sm text-gray-600">
              Histórico da obra: {projectId}
            </p>
          )}
        </div>
        <button
          onClick={handleExport}
          className="btn-primary"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="h-4 w-4 inline mr-1" />
              Utilizador
            </label>
            <select
              className="form-select"
              value={filters.userId}
              onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value={user?.id}>{user?.name}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Filter className="h-4 w-4 inline mr-1" />
              Tipo de Ação
            </label>
            <select
              className="form-select"
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">Todas</option>
              {Object.entries(logTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="h-4 w-4 inline mr-1" />
              Data Início
            </label>
            <input
              type="date"
              className="form-input"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="h-4 w-4 inline mr-1" />
              Data Fim
            </label>
            <input
              type="date"
              className="form-input"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search className="h-4 w-4 inline mr-1" />
              Pesquisar
            </label>
            <input
              type="text"
              placeholder="Pesquisar..."
              className="form-input"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilizador
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Perfil
              </th>
              {!projectId && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projeto
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detalhes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogTypeColor(log.type)}`}>
                    {logTypeLabels[log.type]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.userName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.userRole}
                </td>
                {!projectId && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.projectName || '-'}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-gray-500">
                  {log.description}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {log.details && (
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}