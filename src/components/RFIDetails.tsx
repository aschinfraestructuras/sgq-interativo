import React, { useState } from 'react';
import { FileDown, MessageSquare, Link as LinkIcon, Plus, X } from 'lucide-react';
import { RFI, RFIResponse } from '../contexts/RFIContext';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from './FileUpload';
import RelatedItemsSection from './RelatedItemsSection';
import HistoryTimeline from './HistoryTimeline';

interface RFIDetailsProps {
  rfi: RFI;
  onAddResponse: (response: Omit<RFIResponse, 'id'>) => void;
  onAddAttachment: (file: File, comment?: string) => void;
}

export default function RFIDetails({ rfi, onAddResponse, onAddAttachment }: RFIDetailsProps) {
  const { user } = useAuth();
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [showAttachmentForm, setShowAttachmentForm] = useState(false);
  const [response, setResponse] = useState('');
  const [attachmentComment, setAttachmentComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (response.trim()) {
      onAddResponse({
        content: response,
        respondedBy: user?.name || '',
        respondedAt: new Date().toISOString(),
        attachments: []
      });
      setResponse('');
      setShowResponseForm(false);
    }
  };

  const handleSubmitAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    selectedFiles.forEach(file => {
      onAddAttachment(file, attachmentComment);
    });
    setSelectedFiles([]);
    setAttachmentComment('');
    setShowAttachmentForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submetido':
        return 'bg-blue-100 text-blue-800';
      case 'Em Análise':
        return 'bg-yellow-100 text-yellow-800';
      case 'Em Revisão':
        return 'bg-purple-100 text-purple-800';
      case 'Respondido':
        return 'bg-green-100 text-green-800';
      case 'Em Atraso':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{rfi.assunto}</h2>
            <p className="mt-1 text-sm text-gray-500">{rfi.codigo}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(rfi.estado)}`}>
            {rfi.estado}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Responsável:</span>
            <span className="ml-2 text-gray-900">{rfi.responsavel}</span>
          </div>
          <div>
            <span className="text-gray-500">Prazo:</span>
            <span className="ml-2 text-gray-900">
              {new Date(rfi.prazoResposta).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Descrição</h3>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{rfi.descricao}</p>
      </div>

      {/* Attachments */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-900">Anexos</h3>
          <button
            onClick={() => setShowAttachmentForm(true)}
            className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Adicionar Anexo
          </button>
        </div>

        {showAttachmentForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <form onSubmit={handleSubmitAttachment} className="space-y-4">
              <FileUpload
                files={[]}
                onFilesChange={(files) => setSelectedFiles(Array.from(files))}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                multiple={true}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comentário
                </label>
                <input
                  type="text"
                  value={attachmentComment}
                  onChange={(e) => setAttachmentComment(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Adicione um comentário ao anexo..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAttachmentForm(false)}
                  className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-2">
          {rfi.anexos.map((anexo) => (
            <div
              key={anexo.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileDown className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{anexo.nome}</p>
                  {anexo.comentario && (
                    <p className="text-xs text-gray-500">{anexo.comentario}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => window.open(anexo.url, '_blank')}
                className="text-indigo-600 hover:text-indigo-900"
              >
                <FileDown className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Response Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-900">Resposta</h3>
          {!rfi.resposta && (
            <button
              onClick={() => setShowResponseForm(true)}
              className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
            >
              <MessageSquare className="h-4 w-4" />
              Responder
            </button>
          )}
        </div>

        {showResponseForm && (
          <form onSubmit={handleSubmitResponse} className="space-y-4">
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              rows={4}
              placeholder="Digite sua resposta..."
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResponseForm(false)}
                className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Enviar Resposta
              </button>
            </div>
          </form>
        )}

        {rfi.resposta && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-900">
                {rfi.resposta.respondedBy}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(rfi.resposta.respondedAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {rfi.resposta.content}
            </p>
            {rfi.resposta.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {rfi.resposta.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-2 bg-white rounded"
                  >
                    <span className="text-sm text-gray-900">{attachment.name}</span>
                    <button
                      onClick={() => window.open(attachment.url, '_blank')}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <FileDown className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related Items */}
      <RelatedItemsSection
        documentIds={rfi.references.filter(ref => ref.type === 'document').map(ref => ref.id)}
        materialIds={rfi.references.filter(ref => ref.type === 'material').map(ref => ref.id)}
        ncIds={rfi.references.filter(ref => ref.type === 'nc').map(ref => ref.id)}
      />

      {/* History Timeline */}
      <div className="p-6">
        <HistoryTimeline itemId={rfi.id} itemType="rfi" />
      </div>
    </div>
  );
}