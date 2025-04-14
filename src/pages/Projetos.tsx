import React, { useState } from 'react';
import { Building2, List, Grid, MapPin, User, Clock, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Obra {
  id: string;
  nome: string;
  localizacao: string;
  cliente: string;
  estado: 'Em Curso' | 'Concluída' | 'Suspensa' | 'Planeada';
  dataInicio: string;
}

const obrasIniciais: Obra[] = [
  {
    id: '1',
    nome: 'Edifício Residencial Aurora',
    localizacao: 'Porto',
    cliente: 'Investimentos Urbanos, Lda.',
    estado: 'Em Curso',
    dataInicio: '2024-01-15',
  },
  {
    id: '2',
    nome: 'Centro Comercial Estrela',
    localizacao: 'Lisboa',
    cliente: 'Grupo Comercial Silva',
    estado: 'Planeada',
    dataInicio: '2024-04-01',
  },
];

const estados: Obra['estado'][] = ['Planeada', 'Em Curso', 'Concluída', 'Suspensa'];

export default function Projetos() {
  const { t } = useTranslation(['projects', 'common']);
  const [obras, setObras] = useState<Obra[]>(obrasIniciais);
  const [visualizacao, setVisualizacao] = useState<'cards' | 'tabela'>('cards');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const navigate = useNavigate();

  const [novaObra, setNovaObra] = useState<Partial<Obra>>({
    nome: '',
    localizacao: '',
    cliente: '',
    estado: 'Planeada',
    dataInicio: new Date().toISOString().split('T')[0],
  });

  const getEstadoClasses = (estado: Obra['estado']) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (estado) {
      case 'Em Curso':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Concluída':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Suspensa':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Planeada':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return baseClasses;
    }
  };

  const handleObraClick = (obraId: string) => {
    navigate(`/projeto/${obraId}/documentos`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (novaObra.nome && novaObra.localizacao && novaObra.cliente && novaObra.estado && novaObra.dataInicio) {
      const novoId = (obras.length + 1).toString();
      const obraCriada: Obra = {
        id: novoId,
        nome: novaObra.nome,
        localizacao: novaObra.localizacao,
        cliente: novaObra.cliente,
        estado: novaObra.estado as Obra['estado'],
        dataInicio: novaObra.dataInicio,
      };
      setObras([...obras, obraCriada]);
      setMostrarFormulario(false);
      setNovaObra({
        nome: '',
        localizacao: '',
        cliente: '',
        estado: 'Planeada',
        dataInicio: new Date().toISOString().split('T')[0],
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          {t('projects:title')}
        </h1>
        <div className="flex gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setVisualizacao('cards')}
              className={`p-2 rounded ${
                visualizacao === 'cards' ? 'bg-white shadow' : ''
              }`}
              title={t('projects:views.cards')}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setVisualizacao('tabela')}
              className={`p-2 rounded ${
                visualizacao === 'tabela' ? 'bg-white shadow' : ''
              }`}
              title={t('projects:views.table')}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            {t('projects:newProject')}
          </button>
        </div>
      </div>

      {visualizacao === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {obras.map((obra) => (
            <div
              key={obra.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleObraClick(obra.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {obra.nome}
                </h3>
                <span className={getEstadoClasses(obra.estado)}>
                  {t(`common:status.${obra.estado.toLowerCase()}`)}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {obra.localizacao}
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  {obra.cliente}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {t('projects:projectDetails.startDate')}: {new Date(obra.dataInicio).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('projects:projectDetails.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('projects:projectDetails.location')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('projects:projectDetails.client')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('projects:projectDetails.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('projects:projectDetails.startDate')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {obras.map((obra) => (
                <tr
                  key={obra.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleObraClick(obra.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {obra.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {obra.localizacao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {obra.cliente}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getEstadoClasses(obra.estado)}>
                      {t(`common:status.${obra.estado.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(obra.dataInicio).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mostrarFormulario && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{t('projects:newProject')}</h3>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                  {t('projects:projectDetails.name')}
                </label>
                <input
                  type="text"
                  id="nome"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novaObra.nome}
                  onChange={(e) => setNovaObra({ ...novaObra, nome: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="localizacao" className="block text-sm font-medium text-gray-700">
                  {t('projects:projectDetails.location')}
                </label>
                <input
                  type="text"
                  id="localizacao"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novaObra.localizacao}
                  onChange={(e) => setNovaObra({ ...novaObra, localizacao: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="cliente" className="block text-sm font-medium text-gray-700">
                  {t('projects:projectDetails.client')}
                </label>
                <input
                  type="text"
                  id="cliente"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novaObra.cliente}
                  onChange={(e) => setNovaObra({ ...novaObra, cliente: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700">
                  {t('projects:projectDetails.startDate')}
                </label>
                <input
                  type="date"
                  id="dataInicio"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novaObra.dataInicio}
                  onChange={(e) => setNovaObra({ ...novaObra, dataInicio: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                  {t('projects:projectDetails.status')}
                </label>
                <select
                  id="estado"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novaObra.estado}
                  onChange={(e) => setNovaObra({ ...novaObra, estado: e.target.value as Obra['estado'] })}
                  required
                >
                  {estados.map((estado) => (
                    <option key={estado} value={estado}>
                      {t(`common:status.${estado.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  {t('common:actions.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  {t('common:actions.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}