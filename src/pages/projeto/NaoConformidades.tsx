import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, Plus, FileDown, X, Filter } from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface NaoConformidade {
  id: string;
  codigo: string;
  tipo: string;
  dataRegisto: string;
  estado: string;
  responsavel: string;
  descricao: string;
  anexoUrl?: string;
}

const tiposNC = [
  'Execução',
  'Materiais',
  'Projeto',
  'Segurança'
];

const estadosNC = [
  'Aberta',
  'Em Análise',
  'Resolvida',
  'Encerrada'
];

const responsaveis = [
  'João Silva',
  'Maria Santos',
  'Pedro Costa',
  'Ana Oliveira'
];

const ncsIniciais: NaoConformidade[] = [
  {
    id: '1',
    codigo: 'NC-2024-001',
    tipo: 'Execução',
    dataRegisto: '2024-03-15',
    estado: 'Em Análise',
    responsavel: 'João Silva',
    descricao: 'Desvio na execução da parede P12',
    anexoUrl: '/ncs/nc-001.pdf'
  },
  {
    id: '2',
    codigo: 'NC-2024-002',
    tipo: 'Materiais',
    dataRegisto: '2024-03-14',
    estado: 'Aberta',
    responsavel: 'Maria Santos',
    descricao: 'Material fora das especificações',
    anexoUrl: '/ncs/nc-002.pdf'
  }
];

export default function NaoConformidades() {
  const { id } = useParams<{ id: string }>();
  const [ncs, setNcs] = useState<NaoConformidade[]>(ncsIniciais);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  
  const [novaNC, setNovaNC] = useState<Partial<NaoConformidade>>({
    tipo: '',
    descricao: '',
    responsavel: '',
    estado: 'Aberta'
  });

  // Preparar dados para o gráfico de barras
  const ncsPorTipo = tiposNC.map(tipo => ({
    tipo,
    count: ncs.filter(nc => nc.tipo === tipo).length
  }));

  const barChartData = {
    labels: ncsPorTipo.map(nc => nc.tipo),
    datasets: [
      {
        label: 'Número de NCs',
        data: ncsPorTipo.map(nc => nc.count),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'NCs por Tipo',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // Preparar dados para o gráfico de progresso
  const totalNCs = ncs.length;
  const ncsEncerradas = ncs.filter(nc => nc.estado === 'Encerrada').length;
  const percentagemEncerradas = totalNCs > 0 ? (ncsEncerradas / totalNCs) * 100 : 0;

  const progressChartData = {
    labels: ['Encerradas', 'Em Aberto'],
    datasets: [
      {
        data: [percentagemEncerradas, 100 - percentagemEncerradas],
        backgroundColor: ['#22c55e', '#e5e7eb'],
        borderWidth: 0
      }
    ]
  };

  const progressChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Progresso das NCs',
        font: {
          size: 16
        }
      }
    },
    cutout: '70%'
  };

  // Filtrar NCs
  const ncsFiltradas = ncs.filter(nc => {
    const matchTipo = !filtroTipo || nc.tipo === filtroTipo;
    const matchEstado = !filtroEstado || nc.estado === filtroEstado;
    return matchTipo && matchEstado;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (novaNC.tipo && novaNC.descricao && novaNC.responsavel) {
      const novaNc: NaoConformidade = {
        id: Date.now().toString(),
        codigo: `NC-2024-${(ncs.length + 1).toString().padStart(3, '0')}`,
        tipo: novaNC.tipo,
        dataRegisto: new Date().toISOString().split('T')[0],
        estado: 'Aberta',
        responsavel: novaNC.responsavel,
        descricao: novaNC.descricao,
        anexoUrl: novaNC.anexoUrl
      };
      setNcs([...ncs, novaNc]);
      setMostrarFormulario(false);
      setNovaNC({
        tipo: '',
        descricao: '',
        responsavel: '',
        estado: 'Aberta'
      });
    }
  };

  const getEstadoClasses = (estado: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (estado) {
      case 'Aberta':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Em Análise':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Resolvida':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Encerrada':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <AlertTriangle className="h-6 w-6" />
            Não Conformidades
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Obra:</span>
            <span>Edifício Residencial Aurora</span>
            <span className="text-gray-400">|</span>
            <span className="font-medium">ID:</span>
            <span>{id}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          <div className="bg-white p-4 rounded-lg shadow">
            <Bar data={barChartData} options={barChartOptions} height={200} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="relative">
              <Doughnut data={progressChartData} options={progressChartOptions} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl font-bold text-gray-900">
                    {percentagemEncerradas.toFixed(0)}%
                  </span>
                </div>
              </div>
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
              {tiposNC.map((tipo) => (
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
              {estadosNC.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nova NC
        </button>
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
                Data de Registo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responsável
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Anexo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ncsFiltradas.map((nc) => (
              <tr key={nc.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {nc.codigo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {nc.tipo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(nc.dataRegisto).toLocaleDateString('pt-PT')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getEstadoClasses(nc.estado)}>
                    {nc.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {nc.responsavel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {nc.anexoUrl && (
                    <button
                      onClick={() => window.open(nc.anexoUrl, '_blank')}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <FileDown className="h-5 w-5" />
                    </button>
                  )}
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
              <h3 className="text-lg font-medium">Nova Não Conformidade</h3>
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
                  Tipo
                </label>
                <select
                  id="tipo"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novaNC.tipo}
                  onChange={(e) => setNovaNC({ ...novaNC, tipo: e.target.value })}
                  required
                >
                  <option value="">Selecione um tipo</option>
                  {tiposNC.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novaNC.descricao}
                  onChange={(e) => setNovaNC({ ...novaNC, descricao: e.target.value })}
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
                  value={novaNC.responsavel}
                  onChange={(e) => setNovaNC({ ...novaNC, responsavel: e.target.value })}
                  required
                >
                  <option value="">Selecione um responsável</option>
                  {responsaveis.map((resp) => (
                    <option key={resp} value={resp}>{resp}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Anexo (PDF ou Imagem)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Em um ambiente real, aqui faríamos o upload do arquivo
                      setNovaNC({ ...novaNC, anexoUrl: URL.createObjectURL(file) });
                    }
                  }}
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
    </div>
  );
}