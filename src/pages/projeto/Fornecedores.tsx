import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Plus, FileDown, Star, X, Phone, Mail } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Fornecedor {
  id: string;
  nome: string;
  categoria: string;
  dataRegisto: string;
  avaliacao: number;
  contactoTelefone?: string;
  contactoEmail?: string;
  documentos: {
    id: string;
    nome: string;
    tipo: 'Certificado' | 'Licença' | 'Contrato';
    url: string;
  }[];
}

const categoriasFornecedor = [
  'Betão',
  'Aço',
  'Subempreiteiro',
  'Laboratório',
  'Outros'
];

const fornecedoresIniciais: Fornecedor[] = [
  {
    id: '1',
    nome: 'Betão Plus, Lda',
    categoria: 'Betão',
    dataRegisto: '2024-03-15',
    avaliacao: 4,
    contactoTelefone: '912345678',
    contactoEmail: 'geral@betaoplus.pt',
    documentos: [
      {
        id: '1',
        nome: 'Certificação ISO 9001',
        tipo: 'Certificado',
        url: '/docs/cert-iso-9001.pdf'
      },
      {
        id: '2',
        nome: 'Contrato Fornecimento',
        tipo: 'Contrato',
        url: '/docs/contrato-2024.pdf'
      }
    ]
  },
  {
    id: '2',
    nome: 'Aços Silva & Filhos',
    categoria: 'Aço',
    dataRegisto: '2024-03-14',
    avaliacao: 5,
    contactoTelefone: '923456789',
    contactoEmail: 'comercial@acossilva.pt',
    documentos: [
      {
        id: '3',
        nome: 'Licença Industrial',
        tipo: 'Licença',
        url: '/docs/licenca-ind.pdf'
      }
    ]
  }
];

export default function Fornecedores() {
  const { id } = useParams<{ id: string }>();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(fornecedoresIniciais);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroAvaliacao, setFiltroAvaliacao] = useState<number | ''>('');
  
  const [novoFornecedor, setNovoFornecedor] = useState<Partial<Fornecedor>>({
    nome: '',
    categoria: '',
    avaliacao: 0,
    contactoTelefone: '',
    contactoEmail: '',
    documentos: []
  });

  // Preparar dados para o gráfico de barras
  const fornecedoresPorCategoria = categoriasFornecedor.map(categoria => ({
    categoria,
    count: fornecedores.filter(f => f.categoria === categoria).length
  }));

  const chartData = {
    labels: fornecedoresPorCategoria.map(f => f.categoria),
    datasets: [
      {
        label: 'Número de Fornecedores',
        data: fornecedoresPorCategoria.map(f => f.count),
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
        display: false
      },
      title: {
        display: true,
        text: 'Fornecedores por Categoria',
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

  // Filtrar fornecedores
  const fornecedoresFiltrados = fornecedores.filter(fornecedor => {
    const matchCategoria = !filtroCategoria || fornecedor.categoria === filtroCategoria;
    const matchAvaliacao = !filtroAvaliacao || fornecedor.avaliacao >= filtroAvaliacao;
    return matchCategoria && matchAvaliacao;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoFornecedor.nome && novoFornecedor.categoria) {
      const novoForn: Fornecedor = {
        id: Date.now().toString(),
        nome: novoFornecedor.nome,
        categoria: novoFornecedor.categoria,
        dataRegisto: new Date().toISOString().split('T')[0],
        avaliacao: novoFornecedor.avaliacao || 0,
        contactoTelefone: novoFornecedor.contactoTelefone,
        contactoEmail: novoFornecedor.contactoEmail,
        documentos: novoFornecedor.documentos || []
      };
      setFornecedores([...fornecedores, novoForn]);
      setMostrarFormulario(false);
      setNovoFornecedor({
        nome: '',
        categoria: '',
        avaliacao: 0,
        contactoTelefone: '',
        contactoEmail: '',
        documentos: []
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const newDocs = Array.from(files).map(file => ({
      id: Date.now().toString(),
      nome: file.name,
      tipo: 'Certificado' as const,
      url: URL.createObjectURL(file)
    }));

    setNovoFornecedor(prev => ({
      ...prev,
      documentos: [...(prev.documentos || []), ...newDocs]
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Users className="h-6 w-6" />
            Fornecedores
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
              {categoriasFornecedor.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filtroAvaliacao" className="block text-sm font-medium text-gray-700 mb-1">
              Avaliação Mínima
            </label>
            <select
              id="filtroAvaliacao"
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={filtroAvaliacao}
              onChange={(e) => setFiltroAvaliacao(Number(e.target.value) || '')}
            >
              <option value="">Todas</option>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>{rating}+ estrelas</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Novo Fornecedor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data de Registo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avaliação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documentos
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fornecedoresFiltrados.map((fornecedor) => (
              <tr key={fornecedor.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {fornecedor.nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fornecedor.categoria}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(fornecedor.dataRegisto).toLocaleDateString('pt-PT')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {renderStars(fornecedor.avaliacao)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col gap-1">
                    {fornecedor.contactoTelefone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {fornecedor.contactoTelefone}
                      </div>
                    )}
                    {fornecedor.contactoEmail && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {fornecedor.contactoEmail}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-2">
                    {fornecedor.documentos.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => window.open(doc.url, '_blank')}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                        title={doc.nome}
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
              <h3 className="text-lg font-medium">Novo Fornecedor</h3>
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
                  Nome
                </label>
                <input
                  type="text"
                  id="nome"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoFornecedor.nome}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, nome: e.target.value })}
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
                  value={novoFornecedor.categoria}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, categoria: e.target.value })}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categoriasFornecedor.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoFornecedor.contactoTelefone}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, contactoTelefone: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoFornecedor.contactoEmail}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, contactoEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Avaliação Inicial
                </label>
                <div className="mt-1 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setNovoFornecedor({ ...novoFornecedor, avaliacao: rating })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          rating <= (novoFornecedor.avaliacao || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Documentos (PDF)
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                {novoFornecedor.documentos && novoFornecedor.documentos.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {novoFornecedor.documentos.map((doc) => (
                      <div key={doc.id} className="text-sm text-gray-600 flex items-center gap-2">
                        <FileDown className="h-4 w-4" />
                        {doc.nome}
                      </div>
                    ))}
                  </div>
                )}
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