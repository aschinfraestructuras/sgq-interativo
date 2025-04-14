import React from 'react';
import { FileDown, X, FileText, Image as ImageIcon } from 'lucide-react';
import { FileInfo } from '../contexts/FileContext';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';

interface FilePreviewProps {
  file: FileInfo;
  onRemove?: () => void;
  showProgress?: boolean;
  progress?: number;
}

export default function FilePreview({
  file,
  onRemove,
  showProgress = false,
  progress = 0
}: FilePreviewProps) {
  const getIcon = () => {
    switch (getFileIcon(file.type)) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'image':
        return <ImageIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        {getIcon()}
        <div>
          <p className="text-sm font-medium text-gray-900">{file.name}</p>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {showProgress && progress < 100 && (
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <button
          onClick={() => window.open(file.url, '_blank')}
          className="text-indigo-600 hover:text-indigo-900"
        >
          <FileDown className="h-5 w-5" />
        </button>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}