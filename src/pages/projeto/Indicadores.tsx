import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, FileText, FlaskRound as Flask, Package, Users, AlertTriangle, CheckSquare, Calendar, MapPin } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import DataWarning from '../../components/DataWarning';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Mock data - In a real app, this would come from the respective modules
const mockData = {
  documentos: {
    total: 45,
    porCategoria: {
      Projeto: 15,
      Ensaios: 8,
      Segurança: 12,
      Ambiente: 6,
      Outros: 4
    }
  },
  ensaios: {
    total: 28,
    aprovados: 22,
    reprovados: 6,
    historico: [
      { mes: 'Jan', total: 4, aprovados: 3 },
      { mes: 'Fev', total: 6, aprovados: 5 },
      { mes: 'Mar', total: 8, aprovados: 7 }
    ]
  },
  materiais: {
    total: 35,
    aprovados: 28,
    pendentes: 5,
    rejeitados: 2
  },
  naoConformidades: {
    total: 15,
    abertas: 4,
    resolvidas: 8,
    encerradas: 3,
    historico: [
      { mes: 'Jan', total: 3 },
      { mes: 'Fev', total: 5 },
      { mes: 'Mar', total: 7 }
    ]
  },
  checklists: {
    total: 42,
    validados: 35,
    pendentes: 7
  },
  fornecedores: {
    total: 12,
    ativos: 10,
    inativos: 2,
    porCategoria: {
      Betão: 3,
      Aço: 2,
      Subempreiteiro: 4,
      Laboratório: 2,
      Outros: 1
    }
  }
};

const zonas = [
  'Todas',
  'Bloco A',
  'Bloco B',
  'Área Externa',
  'Fundações'
];

export default function Indicadores() {
  const { id } = useParams<{ id: string }>();
  const [filtroData, setFiltroData] = useState('');
  const [filtroZona, setFiltroZona] = useState('Todas');

  // Configuração dos gráficos
  const documentosChartData = {
    labels: Object.keys(mockData.documentos.porCategoria),
    datasets: [
      {
        label: 'Documentos por Categoria',
        data: Object.values(mockData.documentos.porCategoria),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1
      }
    ]
  };

  const ensaiosChartData = {
    labels: mockData.ensaios.historico.map(item => item.mes),
    datasets: [
      {
        label: 'Total de Ensaios',
        data: mockData.ensaios.historico.map(item => item.total),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.4
      },
      {
        label: 'Ensaios Aprovados',
        data: mockData.ensaios.historico.map(item => item.aprovados),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.4
      }
    ]
  };

  const materiaisChartData = {
    labels: ['Aprovados', 'Pendentes', 'Rejeitados'],
    datasets: [
      {
        data: [
          mockData.materiais.aprovados,
          mockData.materiais.pendentes,
          mockData.materiais.rejeitados
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(234, 179, 8, 0.5)',
          'rgba(239, 68, 68, 0.5)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)'
        ]
      }
    ]
  };

  const ncChartData = {
    labels: mockData.naoConformidades.historico.map(item => item.mes),
    datasets: [
      {
        label: 'Não Conformidades',
        data: mockData.naoConformidades.historico.map(item => item.total),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.4
      }
    ]
  };

  const fornecedoresChartData = {
    labels: Object.keys(mockData.fornecedores.porCategoria),
    datasets: [
      {
        label: 'Fornecedores por Categoria',
        data: Object.values(mockData.fornecedores.porCategoria),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <LineChart className="h-6 w-6" />
            Indicadores
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Obra:</span>
            <span>Edifício Residencial Aurora</span>
            <span className="text-gray-400">|</span>
            <span className="font-medium">ID:</span>
            <span>{id}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div>
            <label htmlFor="filtroData" className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="h-4 w-4 inline mr-1" />
              Data
            </label>
            <input
              type="month"
              id="filtroData"
              className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="filtroZona" className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="h-4 w-4 inline mr-1" />
              Zona
            </label>
            <select
              id="filtroZona"
              className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={filtroZona}
              onChange={(e) => setFiltroZona(e.target.value)}
            >
              {zonas.map((zona) => (
                <option key={zona} value={zona}>{zona}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <DataWarning />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Documentos</h3>
              <p className="text-3xl font-bold text-indigo-600">{mockData.documentos.total}</p>
            </div>
          </div>
          <div className="mt-4">
            <Bar data={documentosChartData} options={chartOptions} height={200} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Flask className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Ensaios</h3>
              <p className="text-3xl font-bold text-green-600">
                {((mockData.ensaios.aprovados / mockData.ensaios.total) * 100).toFixed(0)}% Aprovados
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Line data={ensaiosChartData} options={chartOptions} height={200} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Materiais</h3>
              <p className="text-3xl font-bold text-blue-600">{mockData.materiais.total}</p>
            </div>
          </div>
          <div className="mt-4">
            <Doughnut data={materiaisChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Não Conformidades</h3>
              <div className="flex gap-4 mt-1">
                <span className="text-sm">
                  <span className="font-medium text-red-600">{mockData.naoConformidades.abertas}</span> Abertas
                </span>
                <span className="text-sm">
                  <span className="font-medium text-green-600">{mockData.naoConformidades.encerradas}</span> Encerradas
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Line data={ncChartData} options={chartOptions} height={200} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Checklists</h3>
              <p className="text-3xl font-bold text-purple-600">
                {((mockData.checklists.validados / mockData.checklists.total) * 100).toFixed(0)}% Validados
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Doughnut
              data={{
                labels: ['Validados', 'Pendentes'],
                datasets: [{
                  data: [mockData.checklists.validados, mockData.checklists.pendentes],
                  backgroundColor: ['rgba(147, 51, 234, 0.5)', 'rgba(229, 231, 235, 0.5)'],
                  borderColor: ['rgb(147, 51, 234)', 'rgb(229, 231, 235)']
                }]
              }}
              options={chartOptions}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Fornecedores</h3>
              <p className="text-3xl font-bold text-yellow-600">{mockData.fornecedores.ativos} Ativos</p>
            </div>
          </div>
          <div className="mt-4">
            <Bar data={fornecedoresChartData} options={chartOptions} height={200} />
          </div>
        </div>
      </div>
    </div>
  );
}