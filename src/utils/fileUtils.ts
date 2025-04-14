import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export const validateFileType = (file: File, acceptedTypes: string[]): boolean => {
  return acceptedTypes.some(type => 
    file.name.toLowerCase().endsWith(type.trim().replace('.', ''))
  );
};

export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Erro ao baixar arquivo');
  }
};

export const downloadMultipleFiles = async (files: FileInfo[]) => {
  try {
    const zip = new JSZip();

    // Add each file to the ZIP
    for (const file of files) {
      const response = await fetch(file.url);
      const blob = await response.blob();
      zip.file(file.name, blob);
    }

    // Generate and download the ZIP file
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'documentos.zip');
  } catch (error) {
    console.error('Error creating zip:', error);
    throw new Error('Erro ao criar arquivo ZIP');
  }
};

export const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return 'pdf';
  if (fileType.includes('image')) return 'image';
  if (fileType.includes('word')) return 'word';
  if (fileType.includes('excel')) return 'excel';
  return 'file';
};

export const getFilePreview = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    } else {
      resolve('');
    }
  });
};