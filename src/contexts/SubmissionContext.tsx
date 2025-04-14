import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useHistory } from './HistoryContext';
import { toast } from 'react-hot-toast';

export type RecordType = 'nc' | 'test' | 'material' | 'document' | 'rfi' | 'checklist';

export interface SubmissionState {
  nc: 'Aberta';
  test: 'Agendado';
  material: 'Pendente';
  document: 'Rascunho';
  rfi: 'Submetido';
  checklist: 'Pendente';
}

interface SubmissionContextType {
  generateCode: (type: RecordType) => string;
  getInitialState: (type: RecordType) => string;
  submitRecord: (type: RecordType, data: any) => Promise<void>;
}

const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined);

// Counter for each record type
const recordCounters: Record<RecordType, number> = {
  nc: 0,
  test: 0,
  material: 0,
  document: 0,
  rfi: 0,
  checklist: 0
};

// Initial states for each record type
const initialStates: SubmissionState = {
  nc: 'Aberta',
  test: 'Agendado',
  material: 'Pendente',
  document: 'Rascunho',
  rfi: 'Submetido',
  checklist: 'Pendente'
};

// Type prefixes for code generation
const typePrefixes: Record<RecordType, string> = {
  nc: 'NC',
  test: 'ENS',
  material: 'MAT',
  document: 'DOC',
  rfi: 'RFI',
  checklist: 'CKL'
};

export function SubmissionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { addHistoryItem } = useHistory();

  const generateCode = (type: RecordType): string => {
    recordCounters[type]++;
    const year = new Date().getFullYear();
    const number = recordCounters[type].toString().padStart(3, '0');
    return `${typePrefixes[type]}-${year}-${number}`;
  };

  const getInitialState = (type: RecordType): string => {
    return initialStates[type];
  };

  const submitRecord = async (type: RecordType, data: any) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Generate unique code
      const code = generateCode(type);

      // Set initial state
      const initialState = getInitialState(type);

      // Create submission record
      const submission = {
        ...data,
        codigo: code,
        estado: initialState,
        dataSubmissao: new Date().toISOString(),
        submittedBy: user.id
      };

      // Add to history
      addHistoryItem(
        submission.id,
        type,
        'create',
        [
          { field: 'codigo', newValue: code },
          { field: 'estado', newValue: initialState }
        ]
      );

      // Show success notification
      toast.success('Registo submetido com sucesso', {
        duration: 3000,
        icon: '✅'
      });

      return submission;
    } catch (error) {
      console.error('Error submitting record:', error);
      toast.error('Erro ao submeter registo');
      throw error;
    }
  };

  const value = {
    generateCode,
    getInitialState,
    submitRecord
  };

  return (
    <SubmissionContext.Provider value={value}>
      {children}
    </SubmissionContext.Provider>
  );
}

export function useSubmission() {
  const context = useContext(SubmissionContext);
  if (context === undefined) {
    throw new Error('useSubmission must be used within a SubmissionProvider');
  }
  return context;
}