import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Plus, FileDown, X } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Documento {
  id: string;
  nome: string;
  categoria: string;
  dataUpload: string;
  versao: string;
  ficheiro: string;
}

const categorias = [
  'Projeto',
  'Ensaios',
  'Segurança',
  'Ambiente',
  'Outros'
];

const documentosIniciais: Documento[] = [
  {
    id: '1',
    nome: 'Projeto de Estruturas',
    categoria: 'Projeto',
    dataUpload: '2024-03-15',
    versao: 'v1.0',
    ficheiro: '/documentos/projeto-estruturas.pdf'
  },
  {
    id: '2',
    nome: 'Plano de Segurança',
    categoria: 'Segurança',
    dataUpload: '2024-03-14',
    versao: 'v2.1',
    ficheiro: '/documentos/plano-seguranca.pdf'
  }
];

export default function Documentos() {
  const { id } = useParams<{ id: string }>();
  const [documentos, setDocumentos] = useState<Documento[]>(documentosIniciais);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [mostrarApenasRecente, setMostrarApenasRecente] = useState(false);
  
  const [novoDocumento, setNovoDocumento] = useState<Partial<Documento>>({
    nome: '',
    categoria: '',
    versao: '',
  });

  // Preparar dados para o gráfico
  const documentosPorCategoria = categorias.map(categoria => ({
    categoria,
    count: documentos.filter(doc => doc.categoria === categoria).length
  }));

  const chartData = {
    labels: documentosPorCategoria.map(d => d.categoria),
    datasets: [
      {
        label: 'Número de Documentos',
        data: documentosPorCategoria.map(d => d.count),
        backgroundColor: 'rgba(79, 70, 229, 0.6)',
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Documentos por Categoria',
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

  // Filtrar documentos
  const documentosFiltrados = documentos.filter(doc => {
    const matchCategoria = !filtroCategoria || doc.categoria === filtroCategoria;
    
    if (!mostrarApenasRecente) return matchCategoria;
    
    // Encontrar a versão mais recente para cada documento
    const versoesSimilares = documentos
      .filter(d => d.nome === doc.nome)
      .sort((a, b) => b.versao.localeCompare(a.versao));
    
    return matchCategoria && doc.id === versoesSimilares[0].id;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoDocumento.nome && novoDocumento.categoria && novoDocumento.versao) {
      const novoDoc: Documento = {
        id: Date.now().toString(),
        nome: novoDocumento.nome,
        categoria: novoDocumento.categoria,
        dataUpload: new Date().toISOString().split('T')[0],
        versao: novoDocumento.versao,
        ficheiro: '/documentos/temp.pdf' // Em produção, seria o URL real do arquivo
      };
      setDocumentos([...documentos, novoDoc]);
      setMostrarFormulario(false);
      setNovoDocumento({ nome: '', categoria: '', versao: '' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <FileText className="h-6 w-6" />
            Documentos
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Obra:</span>
            <span>Edifício Residencial Aurora</span>
            <span className="text-gray-400">|</span>
            <span className="font-medium">ID:</span>
            <span>{id}</span>
          </div>
        </div>
        <div className="w-full md:w-96 bg-white p-4 rounded-lg shadow">
          <Bar data={chartData} options={chartOptions} height={200} />
        </div>
      </div>

      <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex gap-4">
          <div>
            <label htmlFor="filtroCategoria" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              id="filtroCategoria"
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="">Todas</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={mostrarApenasRecente}
                onChange={(e) => setMostrarApenasRecente(e.target.checked)}
              />
              <span className="text-sm text-gray-700">Apenas versões mais recentes</span>
            </label>
          </div>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Novo Documento
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome do Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data de Upload
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Versão
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ficheiro
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documentosFiltrados.map((documento) => (
              <tr key={documento.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {documento.nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {documento.categoria}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(documento.dataUpload).toLocaleDateString('pt-PT')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {documento.versao}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => window.open(documento.ficheiro, '_blank')}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <FileDown className="h-5 w-5" />
                  </button>
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
              <h3 className="text-lg font-medium">Novo Documento</h3>
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
                  Nome do Documento
                </label>
                <input
                  type="text"
                  id="nome"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoDocumento.nome}
                  onChange={(e) => setNovoDocumento({ ...novoDocumento, nome: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
                  Categoria
                </label>
                <select
                  id="categoria"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoDocumento.categoria}
                  onChange={(e) => setNovoDocumento({ ...novoDocumento, categoria: e.target.value })}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="versao" className="block text-sm font-medium text-gray-700">
                  Versão
                </label>
                <input
                  type="text"
                  id="versao"
                  placeholder="ex: v1.0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoDocumento.versao}
                  onChange={(e) => setNovoDocumento({ ...novoDocumento, versao: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ficheiro (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                  required
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