import React, { useState } from 'react';
import { X, FileDown } from 'lucide-react';
import { generateTestReport, generateNCReport, generateChecklistReport } from '../utils/downloadUtils';

interface ReportModalProps {
  type: 'test' | 'nc' | 'checklist';
  data: any[];
  onClose: () => void;
}

export default function ReportModal({ type, data, onClose }: ReportModalProps) {
  const [observation, setObservation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      switch (type) {
        case 'test':
          await generateTestReport(data, observation);
          break;
        case 'nc':
          await generateNCReport(data, observation);
          break;
        case 'checklist':
          await generateChecklistReport(data, observation);
          break;
      }
      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'test':
        return 'Relatório de Ensaios';
      case 'nc':
        return 'Relatório de Não Conformidades';
      case 'checklist':
        return 'Relatório de Checklists';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{getTitle()}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Adicione observações ao relatório..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
            >
              <FileDown className="h-4 w-4" />
              {isGenerating ? 'Gerando...' : 'Gerar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}