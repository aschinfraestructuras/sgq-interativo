import React, { useState } from 'react';
import { Upload, X, Plus, Link as LinkIcon } from 'lucide-react';
import { DocumentType, DocumentStatus } from '../contexts/DocumentContext';
import { toast } from 'react-hot-toast';

interface DocumentUploaderProps {
  onUpload: (data: {
    nome: string;
    tipo: DocumentType;
    status: DocumentStatus;
    file: File;
    references: { type: string; id: string }[];
  }) => void;
  onCancel: () => void;
}

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: 'projeto', label: 'Projeto' },
  { value: 'ensaio', label: 'Ensaio' },
  { value: 'seguranca', label: 'Segurança' },
  { value: 'ambiente', label: 'Ambiente' },
  { value: 'outros', label: 'Outros' }
];

export default function DocumentUploader({ onUpload, onCancel }: DocumentUploaderProps) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<DocumentType>('projeto');
  const [file, setFile] = useState<File | null>(null);
  const [references, setReferences] = useState<{ type: string; id: string }[]>([]);
  const [showReferenceForm, setShowReferenceForm] = useState(false);
  const [newReference, setNewReference] = useState({ type: 'material', id: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Por favor, selecione um arquivo PDF');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
        toast.error('O arquivo não pode ser maior que 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Por favor, selecione um arquivo');
      return;
    }
    onUpload({
      nome,
      tipo,
      status: 'rascunho',
      file,
      references
    });
  };

  const addReference = () => {
    if (newReference.id) {
      setReferences(prev => [...prev, newReference]);
      setNewReference({ type: 'material', id: '' });
      setShowReferenceForm(false);
    }
  };

  const removeReference = (index: number) => {
    setReferences(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome do Documento
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Documento
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as DocumentType)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Arquivo (PDF)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PDF até 10MB
              </p>
            </div>
          </div>
        </div>

        {/* References Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Referências
            </label>
            <button
              type="button"
              onClick={() => setShowReferenceForm(true)}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-900"
            >
              <Plus className="h-4 w-4" />
              Adicionar Referência
            </button>
          </div>

          {showReferenceForm && (
            <div className="flex items-center gap-2 mb-4">
              <select
                value={newReference.type}
                onChange={(e) => setNewReference({ ...newReference, type: e.target.value })}
                className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="material">Material</option>
                <option value="test">Ensaio</option>
                <option value="nc">NC</option>
                <option value="checklist">Checklist</option>
                <option value="rfi">RFI</option>
              </select>
              <input
                type="text"
                value={newReference.id}
                onChange={(e) => setNewReference({ ...newReference, id: e.target.value })}
                placeholder="ID da referência"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={addReference}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}

          {references.length > 0 && (
            <div className="space-y-2">
              {references.map((ref, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {ref.type}: {ref.id}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeReference(index)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
          >
            Upload
          </button>
        </div>
      </form>
    </div>
  );
}