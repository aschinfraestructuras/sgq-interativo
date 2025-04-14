import React from 'react';
import { FileDown, History, Link as LinkIcon } from 'lucide-react';
import { Document } from '../contexts/DocumentContext';
import RelatedItemsSection from './RelatedItemsSection';
import HistoryTimeline from './HistoryTimeline';

interface DocumentViewerProps {
  document: Document;
  onDownload?: () => void;
  onVersionChange?: (version: string) => void;
}

export default function DocumentViewer({
  document,
  onDownload,
  onVersionChange
}: DocumentViewerProps) {
  const [showHistory, setShowHistory] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState(document.currentVersion);

  const handleVersionChange = (version: string) => {
    setSelectedVersion(version);
    onVersionChange?.(version);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho':
        return 'bg-gray-100 text-gray-800';
      case 'validado':
        return 'bg-blue-100 text-blue-800';
      case 'aprovado':
        return 'bg-green-100 text-green-800';
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
            <h2 className="text-xl font-semibold text-gray-900">{document.nome}</h2>
            <p className="mt-1 text-sm text-gray-500">{document.codigo}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
            {document.status}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-gray-400" />
            <select
              value={selectedVersion}
              onChange={(e) => handleVersionChange(e.target.value)}
              className="text-sm border-0 bg-transparent focus:ring-0"
            >
              {document.versions.map((version) => (
                <option key={version.id} value={version.version}>
                  {version.version} ({new Date(version.uploadDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onDownload}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-900"
          >
            <FileDown className="h-4 w-4" />
            Download
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <History className="h-4 w-4" />
            {showHistory ? 'Ocultar Histórico' : 'Ver Histórico'}
          </button>
        </div>
      </div>

      {/* Document Preview */}
      <div className="p-6">
        <iframe
          src={document.versions.find(v => v.version === selectedVersion)?.fileUrl}
          className="w-full h-[600px] border border-gray-200 rounded-lg"
          title={document.nome}
        />
      </div>

      {/* Related Items */}
      <RelatedItemsSection
        documentIds={[document.id]}
        materialIds={document.references.filter(ref => ref.type === 'material').map(ref => ref.id)}
        testIds={document.references.filter(ref => ref.type === 'test').map(ref => ref.id)}
        ncIds={document.references.filter(ref => ref.type === 'nc').map(ref => ref.id)}
        checklistIds={document.references.filter(ref => ref.type === 'checklist').map(ref => ref.id)}
        rfiIds={document.references.filter(ref => ref.type === 'rfi').map(ref => ref.id)}
      />

      {/* History Timeline */}
      {showHistory && (
        <div className="border-t border-gray-200 p-6">
          <HistoryTimeline itemId={document.id} itemType="document" />
        </div>
      )}
    </div>
  );
}