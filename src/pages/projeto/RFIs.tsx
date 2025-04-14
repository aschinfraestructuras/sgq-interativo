import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { HelpCircle, Plus, FileDown, Mail, X, Clock, AlertTriangle } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';
import { useLog } from '../../contexts/LogContext';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RFIPdfDocument from '../../components/RFIPdfDocument';
import FileUpload from '../../components/FileUpload';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

interface RFI {
  id: string;
  codigo: string;
  dataSubmissao: string;
  projetoId: string;
  projetoNome: string;
  assunto: string;
  descricao: string;
  responsavel: string;
  prazoResposta: string;
  estado: 'Submetido' | 'Respondido' | 'Em Atraso';
  anexos: {
    id: string;
    nome: string;
    url: string;
  }[];
}

const responsaveis = [
  'João Silva',
  'Maria Santos',
  'Pedro Costa',
  'Ana Oliveira'
];

const rfisIniciais: RFI[] = [
  {
    id: '1',
    codigo: 'RFI-2024-001',
    dataSubmissao: '2024-03-15',
    projetoId: '1',
    projetoNome: 'Edifício Residencial Aurora',
    assunto: 'Clarificação de Detalhes Estruturais',
    descricao: 'Necessidade de esclarecimento sobre os detalhes de armação da viga V12.',
    responsavel: 'João Silva',
    prazoResposta: '2024-03-22',
    estado: 'Submetido',
    anexos: [
      {
        id: '1',
        nome: 'Detalhe-V12.pdf',
        url: '/rfis/detalhe-v12.pdf'
      }
    ]
  },
  {
    id: '2',
    codigo: 'RFI-2024-002',
    dataSubmissao: '2024-03-14',
    projetoId: '1',
    projetoNome: 'Edifício Residencial Aurora',
    assunto: 'Especificação de Material',
    descricao: 'Confirmação da especificação do material de impermeabilização para a cobertura.',
    responsavel: 'Maria Santos',
    prazoResposta: '2024-03-21',
    estado: 'Em Atraso',
    anexos: []
  }
];

export default function RFIs() {
  const { id: projetoId } = useParams<{ id: string }>();
  const { activeProject } = useAuth();
  const { addLog } = useLog();
  const [rfis, setRfis] = useState<RFI[]>(rfisIniciais);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  
  const [novoRFI, setNovoRFI] = useState<Partial<RFI>>({
    assunto: '',
    descricao: '',
    responsavel: '',
    prazoResposta: '',
    anexos: []
  });

  // Calcular estatísticas para o gráfico
  const totalRFIs = rfis.length;
  const rfisRespondidos = rfis.filter(rfi => rfi.estado === 'Respondido').length;
  const rfisEmAtraso = rfis.filter(rfi => rfi.estado === 'Em Atraso').length;
  const rfisSubmetidos = rfis.filter(rfi => rfi.estado === 'Submetido').length;

  const chartData = {
    labels: ['Respondidos', 'Em Atraso', 'Submetidos'],
    datasets: [
      {
        data: [rfisRespondidos, rfisEmAtraso, rfisSubmetidos],
        backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
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
        text: 'Estado dos RFIs',
        font: {
          size: 16
        }
      }
    },
    cutout: '60%'
  };

  // Filtrar RFIs
  const rfisFiltrados = rfis.filter(rfi => {
    if (!filtroEstado) return true;
    return rfi.estado === filtroEstado;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoRFI.assunto && novoRFI.descricao && novoRFI.responsavel && novoRFI.prazoResposta) {
      const novoRfi: RFI = {
        id: Date.now().toString(),
        codigo: `RFI-2024-${(rfis.length + 1).toString().padStart(3, '0')}`,
        dataSubmissao: new Date().toISOString().split('T')[0],
        projetoId: projetoId!,
        projetoNome: activeProject?.nome || '',
        assunto: novoRFI.assunto,
        descricao: novoRFI.descricao,
        responsavel: novoRFI.responsavel,
        prazoResposta: novoRFI.prazoResposta,
        estado: 'Submetido',
        anexos: novoRFI.anexos || []
      };

      setRfis([...rfis, novoRfi]);
      addLog('rfi_create', `Novo RFI criado: ${novoRfi.codigo} - ${novoRfi.assunto}`);
      setMostrarFormulario(false);
      setNovoRFI({
        assunto: '',
        descricao: '',
        responsavel: '',
        prazoResposta: '',
        anexos: []
      });
    }
  };

  const handleShare = async (rfi: RFI) => {
    const subject = encodeURIComponent(`RFI ${rfi.codigo} - ${rfi.assunto}`);
    const body = encodeURIComponent(`
      RFI: ${rfi.codigo}
      Assunto: ${rfi.assunto}
      Descrição: ${rfi.descricao}
      Responsável: ${rfi.responsavel}
      Prazo de Resposta: ${new Date(rfi.prazoResposta).toLocaleDateString()}
      Estado: ${rfi.estado}
    `);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const getEstadoClasses = (estado: RFI['estado']) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (estado) {
      case 'Submetido':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Respondido':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Em Atraso':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <HelpCircle className="h-6 w-6" />
            Pedidos de Informação (RFI)
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Obra:</span>
            <span>{activeProject?.nome}</span>
          </div>
        </div>
        <div className="w-full md:w-64 bg-white p-4 rounded-lg shadow">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="bg-green-50 p-2 rounded">
              <div className="font-medium text-green-700">{rfisRespondidos}</div>
              <div className="text-green-600">Respondidos</div>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <div className="font-medium text-red-700">{rfisEmAtraso}</div>
              <div className="text-red-600">Em Atraso</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <div className="font-medium text-yellow-700">{rfisSubmetidos}</div>
              <div className="text-yellow-600">Submetidos</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-lg shadow">
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
            <option value="Submetido">Submetidos</option>
            <option value="Respondido">Respondidos</option>
            <option value="Em Atraso">Em Atraso</option>
          </select>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Novo RFI
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
                Assunto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data de Submissão
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responsável
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prazo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rfisFiltrados.map((rfi) => (
              <tr key={rfi.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {rfi.codigo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {rfi.assunto}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(rfi.dataSubmissao).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {rfi.responsavel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(rfi.prazoResposta).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getEstadoClasses(rfi.estado)}>
                    {rfi.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-2">
                    <PDFDownloadLink
                      document={<RFIPdfDocument rfi={rfi} />}
                      fileName={`${rfi.codigo}.pdf`}
                    >
                      {({ loading }) => (
                        <button
                          disabled={loading}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Baixar PDF"
                        >
                          <FileDown className="h-5 w-5" />
                        </button>
                      )}
                    </PDFDownloadLink>
                    <button
                      onClick={() => handleShare(rfi)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Compartilhar por Email"
                    >
                      <Mail className="h-5 w-5" />
                    </button>
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
              <h3 className="text-lg font-medium">Novo RFI</h3>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="assunto" className="block text-sm font-medium text-gray-700">
                  Assunto
                </label>
                <input
                  type="text"
                  id="assunto"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoRFI.assunto}
                  onChange={(e) => setNovoRFI({ ...novoRFI, assunto: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
                  Descrição da Dúvida
                </label>
                <textarea
                  id="descricao"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoRFI.descricao}
                  onChange={(e) => setNovoRFI({ ...novoRFI, descricao: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700">
                  Responsável pela Resposta
                </label>
                <select
                  id="responsavel"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoRFI.responsavel}
                  onChange={(e) => setNovoRFI({ ...novoRFI, responsavel: e.target.value })}
                  required
                >
                  <option value="">Selecione um responsável</option>
                  {responsaveis.map((resp) => (
                    <option key={resp} value={resp}>{resp}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="prazoResposta" className="block text-sm font-medium text-gray-700">
                  Prazo de Resposta
                </label>
                <input
                  type="date"
                  id="prazoResposta"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={novoRFI.prazoResposta}
                  onChange={(e) => setNovoRFI({ ...novoRFI, prazoResposta: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anexos
                </label>
                <FileUpload
                  files={novoRFI.anexos || []}
                  onFilesChange={(files) => setNovoRFI({ ...novoRFI, anexos: files })}
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
    </div>
  );
}