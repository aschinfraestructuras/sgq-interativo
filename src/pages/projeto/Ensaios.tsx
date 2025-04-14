import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FlaskRound as Flask, Plus, FileDown, X, Check, Search, Filter } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Ensaio {
  id: string;
  tipo: string;
  data: string;
  zona: string;
  resultado: string;
  aprovado: boolean;
  anexoUrl: string;
}

const tiposEnsaio = [
  'Compressão',
  'Tração',
  'Densidade',
  'Granulometria',
  'Consistência',
];

const ensaiosIniciais: Ensaio[] = [
  {
    id: '1',
    tipo: 'Compressão',
    data: '2024-03-15',
    zona: 'Bloco A - Piso 1',
    resultado: '32 MPa',
    aprovado: true,
    anexoUrl: '/ensaios/relatorio-1.pdf',
  },
  {
    id: '2',
    tipo: 'Densidade',
    data: '2024-03-14',
    zona: 'Bloco B - Fundações',
    resultado: '2400 kg/m³',
    aprovado: false,
    anexoUrl: '/ensaios/relatorio-2.pdf',
  },
];

export default function Ensaios() {
  const { id } = useParams<{ id: string }>();
  const [ensaios, setEnsaios] = useState<Ensaio[]>(ensaiosIniciais);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroAprovacao, setFiltroAprovacao] = useState<string>('');
  
  // Novo ensaio
  const [novoEnsaio, setNovoEnsaio] = useState<Partial<Ensaio>>({
    tipo: '',
    data: '',
    zona: '',
    resultado: '',
    aprovado: false,
    anexoUrl: '',
  });

  const ensaiosFiltrados = ensaios.filter(ensaio => {
    const matchTipo = !filtroTipo || ensaio.tipo === filtroTipo;
    const matchAprovacao = !filtroAprovacao || 
      (filtroAprovacao === 'aprovado' ? ensaio.aprovado : !ensaio.aprovado);
    return matchTipo && matchAprovacao;
  });

  const totalEnsaios = ensaios.length;
  const ensaiosAprovados = ensaios.filter(e => e.aprovado).length;
  const ensaiosReprovados = totalEnsaios - ensaiosAprovados;
  const percentagemAprovados = (ensaiosAprovados / totalEnsaios) * 100;
  const percentagemReprovados = (ensaiosReprovados / totalEnsaios) * 100;

  const chartData = {
    labels: ['Aprovados', 'Reprovados'],
    datasets: [
      {
        data: [percentagemAprovados, percentagemReprovados],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderColor: ['#16a34a', '#dc2626'],
        borderWidth: 1,
      },
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoEnsaio.tipo && novoEnsaio.data && novoEnsaio.zona && novoEnsaio.resultado) {
      setEnsaios([...ensaios, { ...novoEnsaio, id: Date.now().toString() } as Ensaio]);
      setNovoEnsaio({
        tipo: '',
        data: '',
        zona: '',
        resultado: '',
        aprovado: false,
        anexoUrl: '',
      });
      setMostrarFormulario(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Flask className="h-6 w-6" />
            Ensaios
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Obra:</span>
            <span>Edifício Residencial Aurora</span>
            <span className="text-gray-400">|</span>
            <span className="font-medium">ID:</span>
            <span>{id}</span>
          </div>
        </div>
        <div className="w-full md:w-64 bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Estado dos Ensaios</h3>
          <div className="w-48 mx-auto">
            <Doughnut 
              data={chartData}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.label}: ${context.raw.toFixed(1)}%`,
                    },
                  },
                },
                cutout: '60%',
              }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm">
            <div className="bg-green-50 p-2 rounded">
              <div className="font-medium text-green-700">{ensaiosAprovados}</div>
              <div className="text-green-600">Aprovados</div>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <div className="font-medium text-red-700">{ensaiosReprovados}</div>
              <div className="text-red-600">Reprovados</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex gap-4">
          <div>
            <label htmlFor="filtroTipo" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Ensaio
            </label>
            <select
              id="filtroTipo"
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos</option>
              {tiposEnsaio.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filtroAprovacao" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="filtroAprovacao"
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={filtroAprovacao}
              onChange={(e) => setFiltroAprovacao(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="aprovado">Aprovados</option>
              <option value="reprovado">Reprovados</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Novo Ensaio
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo de Ensaio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zona
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resultado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aprovado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Anexo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ensaiosFiltrados.map((ensaio) => (
              <tr key={ensaio.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ensaio.tipo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(ensaio.data).toLocaleDateString('pt-PT')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ensaio.zona}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ensaio.resultado}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {ensaio.aprovado ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => window.open(ensaio.anexoUrl, '_blank')}
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
              <h3 className="text-lg font-medium">Novo Ensaio</h3>
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
                  Tipo de Ensaio
                </label>
                <select
                  id="tipo"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoEnsaio.tipo}
                  onChange={(e) => setNovoEnsaio({ ...novoEnsaio, tipo: e.target.value })}
                  required
                >
                  <option value="">Selecione um tipo</option>
                  {tiposEnsaio.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="data" className="block text-sm font-medium text-gray-700">
                  Data
                </label>
                <input
                  type="date"
                  id="data"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoEnsaio.data}
                  onChange={(e) => setNovoEnsaio({ ...novoEnsaio, data: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="zona" className="block text-sm font-medium text-gray-700">
                  Zona
                </label>
                <input
                  type="text"
                  id="zona"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoEnsaio.zona}
                  onChange={(e) => setNovoEnsaio({ ...novoEnsaio, zona: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="resultado" className="block text-sm font-medium text-gray-700">
                  Resultado
                </label>
                <input
                  type="text"
                  id="resultado"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoEnsaio.resultado}
                  onChange={(e) => setNovoEnsaio({ ...novoEnsaio, resultado: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="aprovado"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={novoEnsaio.aprovado}
                  onChange={(e) => setNovoEnsaio({ ...novoEnsaio, aprovado: e.target.checked })}
                />
                <label htmlFor="aprovado" className="ml-2 block text-sm text-gray-900">
                  Aprovado
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Anexo (PDF)
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
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Em um ambiente real, aqui faríamos o upload do arquivo
                      setNovoEnsaio({ ...novoEnsaio, anexoUrl: URL.createObjectURL(file) });
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