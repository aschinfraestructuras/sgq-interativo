import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckSquare, Plus, FileDown, X } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';
import { useLog } from '../../contexts/LogContext';
import ReportModal from '../../components/ReportModal';
import FileUpload, { FileInfo } from '../../components/FileUpload';
import { toast } from 'react-hot-toast';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

interface Checklist {
  id: string;
  codigo: string;
  tipo: string;
  dataInspecao: string;
  responsavel: string;
  estado: 'Pendente' | 'Concluído';
  anexos: FileInfo[];
}

const tiposChecklist = [
  'Estrutura',
  'Instalações',
  'Acabamentos',
  'Segurança',
  'Qualidade',
  'Ambiente'
];

const responsaveis = [
  'João Silva',
  'Maria Santos',
  'Pedro Costa',
  'Ana Oliveira'
];

const checklistsIniciais: Checklist[] = [
  {
    id: '1',
    codigo: 'CKL-2024-001',
    tipo: 'Estrutura',
    dataInspecao: '2024-03-15',
    responsavel: 'João Silva',
    estado: 'Concluído',
    anexos: [
      {
        id: '1',
        name: 'checklist-estrutura.pdf',
        type: 'application/pdf',
        size: 1024000,
        url: '/checklists/checklist-001.pdf'
      }
    ]
  },
  {
    id: '2',
    codigo: 'CKL-2024-002',
    tipo: 'Segurança',
    dataInspecao: '2024-03-14',
    responsavel: 'Maria Santos',
    estado: 'Pendente',
    anexos: []
  }
];

export default function Checklists() {
  const { id: projetoId } = useParams<{ id: string }>();
  const { activeProject } = useAuth();
  const { addLog } = useLog();
  const [checklists, setChecklists] = useState<Checklist[]>(checklistsIniciais);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarRelatorio, setMostrarRelatorio] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  
  const [novoChecklist, setNovoChecklist] = useState<Partial<Checklist>>({
    tipo: '',
    dataInspecao: '',
    responsavel: '',
    estado: 'Pendente',
    anexos: []
  });

  // Calcular estatísticas para o gráfico
  const totalChecklists = checklists.length;
  const checklistsConcluidos = checklists.filter(c => c.estado === 'Concluído').length;
  const percentagemConcluidos = (checklistsConcluidos / totalChecklists) * 100;

  const chartData = {
    labels: ['Concluídos', 'Pendentes'],
    datasets: [
      {
        data: [percentagemConcluidos, 100 - percentagemConcluidos],
        backgroundColor: ['#22c55e', '#e5e7eb'],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Estado dos Checklists',
        font: {
          size: 16
        }
      }
    },
    cutout: '70%'
  };

  // Filtrar checklists
  const checklistsFiltrados = checklists.filter(checklist => {
    const matchTipo = !filtroTipo || checklist.tipo === filtroTipo;
    const matchEstado = !filtroEstado || checklist.estado === filtroEstado;
    return matchTipo && matchEstado;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoChecklist.tipo && novoChecklist.dataInspecao && novoChecklist.responsavel) {
      const novoCheck: Checklist = {
        id: Date.now().toString(),
        codigo: `CKL-2024-${(checklists.length + 1).toString().padStart(3, '0')}`,
        tipo: novoChecklist.tipo,
        dataInspecao: novoChecklist.dataInspecao,
        responsavel: novoChecklist.responsavel,
        estado: 'Pendente',
        anexos: novoChecklist.anexos || []
      };

      setChecklists([...checklists, novoCheck]);
      addLog('checklist_create', `Novo checklist criado: ${novoCheck.codigo} - ${novoCheck.tipo}`);
      toast.success('Checklist criado com sucesso');
      setMostrarFormulario(false);
      setNovoChecklist({
        tipo: '',
        dataInspecao: '',
        responsavel: '',
        estado: 'Pendente',
        anexos: []
      });
    }
  };

  const getEstadoClasses = (estado: Checklist['estado']) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (estado) {
      case 'Concluído':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Pendente':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <CheckSquare className="h-6 w-6" />
            Checklists
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Obra:</span>
            <span>{activeProject?.nome}</span>
          </div>
        </div>
        <div className="w-full md:w-64 bg-white p-4 rounded-lg shadow">
          <div className="relative">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-3xl font-bold text-gray-900">
                  {percentagemConcluidos.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm">
            <div className="bg-green-50 p-2 rounded">
              <div className="font-medium text-green-700">{checklistsConcluidos}</div>
              <div className="text-green-600">Concluídos</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <div className="font-medium text-yellow-700">
                {totalChecklists - checklistsConcluidos}
              </div>
              <div className="text-yellow-600">Pendentes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex gap-4">
          <div>
            <label htmlFor="filtroTipo" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              id="filtroTipo"
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos</option>
              {tiposChecklist.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filtroEstado" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="filtroEstado"
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Pendente">Pendentes</option>
              <option value="Concluído">Concluídos</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarRelatorio(true)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <FileDown className="h-5 w-5" />
            Relatório
          </button>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Novo Checklist
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data de Inspeção
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responsável
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Anexos
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {checklistsFiltrados.map((checklist) => (
              <tr key={checklist.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {checklist.codigo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {checklist.tipo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(checklist.dataInspecao).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {checklist.responsavel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getEstadoClasses(checklist.estado)}>
                    {checklist.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-2">
                    {checklist.anexos.map((anexo) => (
                      <button
                        key={anexo.id}
                        onClick={() => window.open(anexo.url, '_blank')}
                        className="text-indigo-600 hover:text-indigo-900"
                        title={anexo.name}
                      >
                        <FileDown className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mostrarFormulario && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Novo Checklist</h3>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                  Tipo de Checklist
                </label>
                <select
                  id="tipo"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoChecklist.tipo}
                  onChange={(e) => setNovoChecklist({ ...novoChecklist, tipo: e.target.value })}
                  required
                >
                  <option value="">Selecione um tipo</option>
                  {tiposChecklist.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="dataInspecao" className="block text-sm font-medium text-gray-700">
                  Data de Inspeção
                </label>
                <input
                  type="date"
                  id="dataInspecao"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoChecklist.dataInspecao}
                  onChange={(e) => setNovoChecklist({ ...novoChecklist, dataInspecao: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700">
                  Responsável
                </label>
                <select
                  id="responsavel"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoChecklist.responsavel}
                  onChange={(e) => setNovoChecklist({ ...novoChecklist, responsavel: e.target.value })}
                  required
                >
                  <option value="">Selecione um responsável</option>
                  {responsaveis.map((resp) => (
                    <option key={resp} value={resp}>{resp}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anexos
                </label>
                <FileUpload
                  files={novoChecklist.anexos || []}
                  onFilesChange={(files) => setNovoChecklist({ ...novoChecklist, anexos: files })}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple={true}
                  maxSize={10}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
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
      )}

      {mostrarRelatorio && (
        <ReportModal
          type="checklist"
          data={checklists}
          onClose={() => setMostrarRelatorio(false)}
        />
      )}
    </div>
  );
}