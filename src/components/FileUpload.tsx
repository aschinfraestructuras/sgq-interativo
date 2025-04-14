import React, { useCallback, useState } from 'react';
import { FileDown, X, AlertTriangle, FileText, Image as ImageIcon } from 'lucide-react';

export interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  progress?: number;
}

interface FileUploadProps {
  files: FileInfo[];
  onFilesChange: (files: FileInfo[]) => void;
  onFileRemove?: (fileId: string) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  showPreview?: boolean;
}

export default function FileUpload({
  files,
  onFilesChange,
  onFileRemove,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  multiple = true,
  maxSize = 10,
  maxFiles = 5,
  showPreview = true
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    if (!accept.split(',').some(type => file.name.toLowerCase().endsWith(type.trim()))) {
      setError(`Tipo de arquivo não permitido: ${file.name}`);
      return false;
    }

    if (file.size > maxSize * 1024 * 1024) {
      setError(`Arquivo muito grande: ${file.name}. Máximo permitido: ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    setError(null);

    const newFiles = Array.from(fileList)
      .filter(validateFile)
      .slice(0, maxFiles - files.length)
      .map(file => ({
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        progress: 0
      }));

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);

      // Simulate upload progress
      newFiles.forEach(file => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress <= 100) {
            onFilesChange(prev =>
              prev.map(f =>
                f.id === file.id ? { ...f, progress } : f
              )
            );
          } else {
            clearInterval(interval);
          }
        }, 200);
      });
    }
  }, [files, maxFiles, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemove = (fileId: string) => {
    if (onFileRemove) {
      onFileRemove(fileId);
    } else {
      onFilesChange(files.filter(f => f.id !== fileId));
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes('image')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
        />
        <div className="flex flex-col items-center">
          <FileDown className="w-8 h-8 text-gray-400 mb-2" />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Clique para carregar</span> ou arraste e solte
          </p>
          <p className="text-xs text-gray-500">
            {accept.split(',').join(', ')} (max. {maxSize}MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {files.length > 0 && showPreview && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(file.type)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {file.progress !== undefined && file.progress < 100 && (
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
                {file.url && (
                  <button
                    onClick={() => window.open(file.url, '_blank')}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <FileDown className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleRemove(file.id)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <AlertTriangle className="h-4 w-4" />
          <span>Os ficheiros serão carregados quando guardar o formulário</span>
        </div>
      )}
    </div>
  );
}