import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Package, Plus, FileDown, X } from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Material {
  id: string;
  codigo: string;
  designacao: string;
  tipo: string;
  dataRececao: string;
  zonaAplicacao: string;
  estado: string;
  certificadoUrl?: string;
}

const tiposMaterial = [
  'Aço',
  'Betão',
  'Balastro',
  'Eléctrico',
  'Outros'
];

const estadosMaterial = [
  'Pendente',
  'Aprovado',
  'Rejeitado'
];

const materiaisIniciais: Material[] = [
  {
    id: '1',
    codigo: 'MAT-2024-001',
    designacao: 'Aço A500 NR',
    tipo: 'Aço',
    dataRececao: '2024-03-15',
    zonaAplicacao: 'Bloco A - Pilares',
    estado: 'Aprovado',
    certificadoUrl: '/materiais/cert-001.pdf'
  },
  {
    id: '2',
    codigo: 'MAT-2024-002',
    designacao: 'Betão C30/37',
    tipo: 'Betão',
    dataRececao: '2024-03-14',
    zonaAplicacao: 'Bloco B - Lajes',
    estado: 'Pendente',
    certificadoUrl: '/materiais/cert-002.pdf'
  }
];

export default function Materiais() {
  const { id } = useParams<{ id: string }>();
  const [materiais, setMateriais] = useState<Material[]>(materiaisIniciais);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  
  const [novoMaterial, setNovoMaterial] = useState<Partial<Material>>({
    designacao: '',
    tipo: '',
    zonaAplicacao: '',
    estado: 'Pendente'
  });

  // Preparar dados para o gráfico de barras
  const materiaisPorTipo = tiposMaterial.map(tipo => ({
    tipo,
    count: materiais.filter(mat => mat.tipo === tipo).length
  }));

  const barChartData = {
    labels: materiaisPorTipo.map(mat => mat.tipo),
    datasets: [
      {
        label: 'Quantidade de Materiais',
        data: materiaisPorTipo.map(mat => mat.count),
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
        text: 'Materiais por Tipo',
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

  // Preparar dados para o gráfico circular
  const totalMateriais = materiais.length;
  const materiaisAprovados = materiais.filter(mat => mat.estado === 'Aprovado').length;
  const materiaisRejeitados = materiais.filter(mat => mat.estado === 'Rejeitado').length;
  const materiaisPendentes = totalMateriais - materiaisAprovados - materiaisRejeitados;

  const pieChartData = {
    labels: ['Aprovados', 'Rejeitados', 'Pendentes'],
    datasets: [
      {
        data: [materiaisAprovados, materiaisRejeitados, materiaisPendentes],
        backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
        borderWidth: 1
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      },
      title: {
        display: true,
        text: 'Estado dos Materiais',
        font: {
          size: 16
        }
      }
    }
  };

  // Filtrar materiais
  const materiaisFiltrados = materiais.filter(material => {
    const matchTipo = !filtroTipo || material.tipo === filtroTipo;
    const matchEstado = !filtroEstado || material.estado === filtroEstado;
    return matchTipo && matchEstado;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoMaterial.designacao && novoMaterial.tipo && novoMaterial.zonaAplicacao) {
      const novoMat: Material = {
        id: Date.now().toString(),
        codigo: `MAT-2024-${(materiais.length + 1).toString().padStart(3, '0')}`,
        designacao: novoMaterial.designacao,
        tipo: novoMaterial.tipo,
        dataRececao: new Date().toISOString().split('T')[0],
        zonaAplicacao: novoMaterial.zonaAplicacao,
        estado: 'Pendente',
        certificadoUrl: novoMaterial.certificadoUrl
      };
      setMateriais([...materiais, novoMat]);
      setMostrarFormulario(false);
      setNovoMaterial({
        designacao: '',
        tipo: '',
        zonaAplicacao: '',
        estado: 'Pendente'
      });
    }
  };

  const getEstadoClasses = (estado: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (estado) {
      case 'Aprovado':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Rejeitado':
        return `${baseClasses} bg-red-100 text-red-800`;
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
            <Package className="h-6 w-6" />
            Materiais
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
            <Pie data={pieChartData} options={pieChartOptions} />
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
              {tiposMaterial.map((tipo) => (
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
              {estadosMaterial.map((estado) => (
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
          Novo Material
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
                Designação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data de Receção
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zona de Aplicação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Certificado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {materiaisFiltrados.map((material) => (
              <tr key={material.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {material.codigo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {material.designacao}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {material.tipo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(material.dataRececao).toLocaleDateString('pt-PT')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {material.zonaAplicacao}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getEstadoClasses(material.estado)}>
                    {material.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {material.certificadoUrl && (
                    <button
                      onClick={() => window.open(material.certificadoUrl, '_blank')}
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
              <h3 className="text-lg font-medium">Novo Material</h3>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="designacao" className="block text-sm font-medium text-gray-700">
                  Designação
                </label>
                <input
                  type="text"
                  id="designacao"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoMaterial.designacao}
                  onChange={(e) => setNovoMaterial({ ...novoMaterial, designacao: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  id="tipo"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoMaterial.tipo}
                  onChange={(e) => setNovoMaterial({ ...novoMaterial, tipo: e.target.value })}
                  required
                >
                  <option value="">Selecione um tipo</option>
                  {tiposMaterial.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="zonaAplicacao" className="block text-sm font-medium text-gray-700">
                  Zona de Aplicação
                </label>
                <input
                  type="text"
                  id="zonaAplicacao"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoMaterial.zonaAplicacao}
                  onChange={(e) => setNovoMaterial({ ...novoMaterial, zonaAplicacao: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Certificado (PDF ou Imagem)
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
                      setNovoMaterial({ ...novoMaterial, certificadoUrl: URL.createObjectURL(file) });
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