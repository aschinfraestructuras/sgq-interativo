import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useHistory } from './HistoryContext';
import { useSubmission } from './SubmissionContext';
import { toast } from 'react-hot-toast';

export type DocumentType = 'projeto' | 'ensaio' | 'seguranca' | 'ambiente' | 'outros';
export type DocumentStatus = 'rascunho' | 'validado' | 'aprovado';

export interface DocumentVersion {
  id: string;
  version: string;
  uploadDate: string;
  uploadedBy: string;
  fileUrl: string;
}

export interface Document {
  id: string;
  codigo: string;
  nome: string;
  tipo: DocumentType;
  status: DocumentStatus;
  dataUpload: string;
  uploadedBy: string;
  currentVersion: string;
  versions: DocumentVersion[];
  references: {
    type: 'nc' | 'test' | 'material' | 'checklist' | 'rfi';
    id: string;
  }[];
  projectId: string;
}

interface DocumentContextType {
  documents: Document[];
  addDocument: (document: Omit<Document, 'id' | 'codigo'>) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  addVersion: (documentId: string, version: Omit<DocumentVersion, 'id'>) => Promise<void>;
  getDocumentVersions: (documentId: string) => DocumentVersion[];
  getRelatedDocuments: (type: string, id: string) => Document[];
  filterDocuments: (filters: {
    type?: DocumentType;
    status?: DocumentStatus;
    search?: string;
    projectId?: string;
  }) => Document[];
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

// Mock initial data
const mockDocuments: Document[] = [
  {
    id: '1',
    codigo: 'DOC-2024-001',
    nome: 'Projeto de Estruturas',
    tipo: 'projeto',
    status: 'aprovado',
    dataUpload: '2024-03-15',
    uploadedBy: 'João Silva',
    currentVersion: 'v1.0',
    versions: [
      {
        id: '1',
        version: 'v1.0',
        uploadDate: '2024-03-15',
        uploadedBy: 'João Silva',
        fileUrl: '/docs/projeto-estruturas-v1.0.pdf'
      }
    ],
    references: [
      { type: 'material', id: '1' },
      { type: 'test', id: '1' }
    ],
    projectId: '1'
  }
];

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { addHistoryItem } = useHistory();
  const { generateCode } = useSubmission();
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);

  const addDocument = async (documentData: Omit<Document, 'id' | 'codigo'>) => {
    if (!user) throw new Error('User not authenticated');

    const newDocument: Document = {
      id: Date.now().toString(),
      codigo: generateCode('document'),
      ...documentData
    };

    setDocuments(prev => [...prev, newDocument]);

    addHistoryItem(
      newDocument.id,
      'document',
      'create',
      [
        { field: 'status', newValue: newDocument.status },
        { field: 'version', newValue: newDocument.currentVersion }
      ]
    );

    toast.success('Documento criado com sucesso');
    return newDocument;
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, ...updates } : doc
    ));

    addHistoryItem(
      id,
      'document',
      'update',
      Object.entries(updates).map(([field, value]) => ({
        field,
        newValue: value as string
      }))
    );

    toast.success('Documento atualizado com sucesso');
  };

  const addVersion = async (documentId: string, version: Omit<DocumentVersion, 'id'>) => {
    const newVersion: DocumentVersion = {
      id: Date.now().toString(),
      ...version
    };

    setDocuments(prev => prev.map(doc => 
      doc.id === documentId
        ? {
            ...doc,
            currentVersion: version.version,
            versions: [...doc.versions, newVersion]
          }
        : doc
    ));

    addHistoryItem(
      documentId,
      'document',
      'update',
      [{ field: 'version', newValue: version.version }]
    );

    toast.success('Nova versão adicionada com sucesso');
  };

  const getDocumentVersions = (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    return document?.versions || [];
  };

  const getRelatedDocuments = (type: string, id: string) => {
    return documents.filter(doc => 
      doc.references.some(ref => ref.type === type && ref.id === id)
    );
  };

  const filterDocuments = ({
    type,
    status,
    search,
    projectId
  }: {
    type?: DocumentType;
    status?: DocumentStatus;
    search?: string;
    projectId?: string;
  }) => {
    return documents.filter(doc => {
      if (type && doc.tipo !== type) return false;
      if (status && doc.status !== status) return false;
      if (projectId && doc.projectId !== projectId) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          doc.nome.toLowerCase().includes(searchLower) ||
          doc.codigo.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  };

  const value = {
    documents,
    addDocument,
    updateDocument,
    addVersion,
    getDocumentVersions,
    getRelatedDocuments,
    filterDocuments
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
}