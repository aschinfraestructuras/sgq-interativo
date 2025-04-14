import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useHistory } from './HistoryContext';
import { useSubmission } from './SubmissionContext';
import { toast } from 'react-hot-toast';

export type RFIStatus = 'Submetido' | 'Em Análise' | 'Em Revisão' | 'Respondido' | 'Em Atraso';

export interface RFIResponse {
  id: string;
  content: string;
  respondedBy: string;
  respondedAt: string;
  attachments: {
    id: string;
    name: string;
    url: string;
  }[];
}

export interface RFI {
  id: string;
  codigo: string;
  dataSubmissao: string;
  projetoId: string;
  projetoNome: string;
  assunto: string;
  descricao: string;
  responsavel: string;
  prazoResposta: string;
  estado: RFIStatus;
  anexos: {
    id: string;
    nome: string;
    url: string;
    comentario?: string;
  }[];
  resposta?: RFIResponse;
  references: {
    type: 'document' | 'material' | 'nc';
    id: string;
  }[];
}

interface RFIContextType {
  rfis: RFI[];
  addRFI: (rfi: Omit<RFI, 'id' | 'codigo' | 'estado'>) => Promise<RFI>;
  updateRFI: (id: string, updates: Partial<RFI>) => Promise<void>;
  addResponse: (rfiId: string, response: Omit<RFIResponse, 'id'>) => Promise<void>;
  addAttachment: (rfiId: string, file: File, comment?: string) => Promise<void>;
  getRelatedRFIs: (type: string, id: string) => RFI[];
  filterRFIs: (filters: {
    type?: string;
    status?: RFIStatus;
    search?: string;
    projectId?: string;
  }) => RFI[];
}

const RFIContext = createContext<RFIContextType | undefined>(undefined);

// Mock data
const mockRFIs: RFI[] = [
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
        url: '/rfis/detalhe-v12.pdf',
        comentario: 'Desenho técnico da viga V12'
      }
    ],
    references: [
      { type: 'document', id: '1' },
      { type: 'material', id: '1' }
    ]
  }
];

export function RFIProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { addHistoryItem } = useHistory();
  const { generateCode } = useSubmission();
  const [rfis, setRfis] = useState<RFI[]>(mockRFIs);

  const addRFI = async (rfiData: Omit<RFI, 'id' | 'codigo' | 'estado'>) => {
    if (!user) throw new Error('User not authenticated');

    const newRFI: RFI = {
      id: Date.now().toString(),
      codigo: generateCode('rfi'),
      estado: 'Submetido',
      ...rfiData
    };

    setRfis(prev => [...prev, newRFI]);

    addHistoryItem(
      newRFI.id,
      'rfi',
      'create',
      [
        { field: 'estado', newValue: newRFI.estado },
        { field: 'responsavel', newValue: newRFI.responsavel }
      ]
    );

    toast.success('RFI criado com sucesso');
    return newRFI;
  };

  const updateRFI = async (id: string, updates: Partial<RFI>) => {
    setRfis(prev => prev.map(rfi => 
      rfi.id === id ? { ...rfi, ...updates } : rfi
    ));

    addHistoryItem(
      id,
      'rfi',
      'update',
      Object.entries(updates).map(([field, value]) => ({
        field,
        newValue: value as string
      }))
    );

    toast.success('RFI atualizado com sucesso');
  };

  const addResponse = async (rfiId: string, response: Omit<RFIResponse, 'id'>) => {
    const newResponse: RFIResponse = {
      id: Date.now().toString(),
      ...response
    };

    setRfis(prev => prev.map(rfi => 
      rfi.id === rfiId
        ? {
            ...rfi,
            estado: 'Respondido',
            resposta: newResponse
          }
        : rfi
    ));

    addHistoryItem(
      rfiId,
      'rfi',
      'update',
      [
        { field: 'estado', newValue: 'Respondido' },
        { field: 'resposta', newValue: 'Adicionada' }
      ]
    );

    toast.success('Resposta adicionada com sucesso');
  };

  const addAttachment = async (rfiId: string, file: File, comment?: string) => {
    const attachment = {
      id: Date.now().toString(),
      nome: file.name,
      url: URL.createObjectURL(file),
      comentario: comment
    };

    setRfis(prev => prev.map(rfi => 
      rfi.id === rfiId
        ? {
            ...rfi,
            anexos: [...rfi.anexos, attachment]
          }
        : rfi
    ));

    addHistoryItem(
      rfiId,
      'rfi',
      'update',
      [{ field: 'anexos', newValue: 'Novo anexo adicionado' }]
    );

    toast.success('Anexo adicionado com sucesso');
  };

  const getRelatedRFIs = (type: string, id: string) => {
    return rfis.filter(rfi => 
      rfi.references.some(ref => ref.type === type && ref.id === id)
    );
  };

  const filterRFIs = ({
    type,
    status,
    search,
    projectId
  }: {
    type?: string;
    status?: RFIStatus;
    search?: string;
    projectId?: string;
  }) => {
    return rfis.filter(rfi => {
      if (type && !rfi.references.some(ref => ref.type === type)) return false;
      if (status && rfi.estado !== status) return false;
      if (projectId && rfi.projetoId !== projectId) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          rfi.assunto.toLowerCase().includes(searchLower) ||
          rfi.codigo.toLowerCase().includes(searchLower) ||
          rfi.descricao.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  };

  const value = {
    rfis,
    addRFI,
    updateRFI,
    addResponse,
    addAttachment,
    getRelatedRFIs,
    filterRFIs
  };

  return (
    <RFIContext.Provider value={value}>
      {children}
    </RFIContext.Provider>
  );
}

export function useRFI() {
  const context = useContext(RFIContext);
  if (context === undefined) {
    throw new Error('useRFI must be used within a RFIProvider');
  }
  return context;
}