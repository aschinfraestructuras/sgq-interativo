import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, useMockData } from '../lib/supabase';
import { useLog } from './LogContext';

export interface Project {
  id: string;
  nome: string;
  localizacao: string;
  cliente: string;
  estado: 'Em Curso' | 'Planeada' | 'Concluída' | 'Suspensa';
  dataInicio: string;
}

export interface Test {
  id: string;
  tipo: string;
  data: string;
  zona: string;
  resultado: string;
  aprovado: boolean;
  anexoUrl: string;
  materialId?: string; // Reference to associated material
}

export interface Document {
  id: string;
  nome: string;
  categoria: string;
  dataUpload: string;
  versao: string;
  ficheiro: string;
  references?: {
    type: 'nc' | 'test' | 'material' | 'checklist';
    id: string;
  }[];
}

export interface NonConformity {
  id: string;
  codigo: string;
  tipo: string;
  dataRegisto: string;
  estado: string;
  responsavel: string;
  descricao: string;
  anexoUrl?: string;
  documentIds: string[]; // References to associated documents
  testIds: string[]; // References to associated tests
}

export interface Activity {
  id: string;
  type: 'document' | 'test' | 'nonConformity';
  title: string;
  description: string;
  timestamp: string;
}

export interface Material {
  id: string;
  codigo: string;
  designacao: string;
  tipo: string;
  dataRececao: string;
  zonaAplicacao: string;
  estado: string;
  certificadoUrl?: string;
  testIds: string[]; // References to associated tests
  documentIds: string[]; // References to associated documents
}

const mockProjects: Project[] = [
  {
    id: '1',
    nome: 'Edifício Residencial Aurora',
    localizacao: 'Porto',
    cliente: 'Investimentos Urbanos, Lda.',
    estado: 'Em Curso',
    dataInicio: '2024-01-15',
  },
  {
    id: '2',
    nome: 'Centro Comercial Estrela',
    localizacao: 'Lisboa',
    cliente: 'Grupo Comercial Silva',
    estado: 'Planeada',
    dataInicio: '2024-04-01',
  },
];

const mockTests: Test[] = [
  {
    id: '1',
    tipo: 'Compressão',
    data: '2024-03-15',
    zona: 'Bloco A - Piso 1',
    resultado: '32 MPa',
    aprovado: true,
    anexoUrl: '/ensaios/relatorio-1.pdf',
    materialId: '1', // Associated with Aço A500 NR
  },
  {
    id: '2',
    tipo: 'Densidade',
    data: '2024-03-14',
    zona: 'Bloco B - Fundações',
    resultado: '2400 kg/m³',
    aprovado: false,
    anexoUrl: '/ensaios/relatorio-2.pdf',
    materialId: '2', // Associated with Betão C30/37
  },
];

const mockDocuments: Document[] = [
  {
    id: '1',
    nome: 'Projeto de Estruturas',
    categoria: 'Projeto',
    dataUpload: '2024-03-15',
    versao: 'v1.0',
    ficheiro: '/documentos/projeto-estruturas.pdf',
    references: [
      { type: 'material', id: '1' },
      { type: 'test', id: '1' }
    ]
  },
  {
    id: '2',
    nome: 'Plano de Segurança',
    categoria: 'Segurança',
    dataUpload: '2024-03-14',
    versao: 'v2.1',
    ficheiro: '/documentos/plano-seguranca.pdf',
    references: [
      { type: 'nc', id: '1' }
    ]
  },
];

const mockNonConformities: NonConformity[] = [
  {
    id: '1',
    codigo: 'NC-2024-001',
    tipo: 'Execução',
    dataRegisto: '2024-03-15',
    estado: 'Em Análise',
    responsavel: 'João Silva',
    descricao: 'Desvio na execução da parede P12',
    anexoUrl: '/ncs/nc-001.pdf',
    documentIds: ['2'], // References Plano de Segurança
    testIds: ['1'] // References Compression Test
  },
  {
    id: '2',
    codigo: 'NC-2024-002',
    tipo: 'Materiais',
    dataRegisto: '2024-03-14',
    estado: 'Aberta',
    responsavel: 'Maria Santos',
    descricao: 'Material fora das especificações',
    anexoUrl: '/ncs/nc-002.pdf',
    documentIds: [],
    testIds: ['2'] // References Density Test
  },
];

const mockMaterials: Material[] = [
  {
    id: '1',
    codigo: 'MAT-2024-001',
    designacao: 'Aço A500 NR',
    tipo: 'Aço',
    dataRececao: '2024-03-15',
    zonaAplicacao: 'Bloco A - Pilares',
    estado: 'Aprovado',
    certificadoUrl: '/materiais/cert-001.pdf',
    testIds: ['1'], // References Compression Test
    documentIds: ['1'] // References Projeto de Estruturas
  },
  {
    id: '2',
    codigo: 'MAT-2024-002',
    designacao: 'Betão C30/37',
    tipo: 'Betão',
    dataRececao: '2024-03-14',
    zonaAplicacao: 'Bloco B - Lajes',
    estado: 'Pendente',
    certificadoUrl: '/materiais/cert-002.pdf',
    testIds: ['2'], // References Density Test
    documentIds: []
  }
];

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'document',
    title: 'Novo documento adicionado',
    description: 'Projeto de Estruturas v2.0',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'test',
    title: 'Ensaio realizado',
    description: 'Compressão do Betão - Bloco A',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'nonConformity',
    title: 'Nova não conformidade',
    description: 'NC-2024-003 - Desvio dimensional',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

interface DataContextType {
  projects: Project[];
  tests: Test[];
  documents: Document[];
  nonConformities: NonConformity[];
  materials: Material[];
  recentActivities: Activity[];
  loading: boolean;
  error: string | null;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  addTest: (test: Test) => void;
  addDocument: (document: Document) => void;
  addNonConformity: (nc: NonConformity) => void;
  addMaterial: (material: Material) => void;
  getRelatedDocuments: (type: 'nc' | 'test' | 'material' | 'checklist', id: string) => Document[];
  getRelatedTests: (materialId: string) => Test[];
  refreshData: () => Promise<void>;
  isMockData: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [tests, setTests] = useState<Test[]>(mockTests);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [nonConformities, setNonConformities] = useState<NonConformity[]>(mockNonConformities);
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [recentActivities, setRecentActivities] = useState<Activity[]>(mockActivities);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { addLog } = useLog();

  const fetchProjects = async () => {
    if (useMockData) {
      setProjects(mockProjects);
      return;
    }

    try {
      const { data, error } = await supabase!
        .from('projects')
        .select('*')
        .order('dataInicio', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setProjects(data);
      } else {
        setProjects(mockProjects);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setProjects(mockProjects);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchProjects();
      setTests(mockTests);
      setDocuments(mockDocuments);
      setNonConformities(mockNonConformities);
      setMaterials(mockMaterials);
      setRecentActivities(mockActivities);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addProject = async (project: Omit<Project, 'id'>) => {
    if (useMockData) {
      const mockProject: Project = {
        id: Date.now().toString(),
        ...project,
      };
      setProjects(prev => [...prev, mockProject]);
      addLog('project_create', `Novo projeto criado: ${project.nome}`);
      return;
    }

    try {
      const { data, error } = await supabase!
        .from('projects')
        .insert([project])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProjects(prev => [...prev, data]);
        addLog('project_create', `Novo projeto criado: ${project.nome}`);
      }
    } catch (err) {
      console.error('Error adding project:', err);
      const mockProject: Project = {
        id: Date.now().toString(),
        ...project,
      };
      setProjects(prev => [...prev, mockProject]);
      addLog('project_create', `Novo projeto criado: ${project.nome}`);
    }
  };

  const addTest = (test: Test) => {
    setTests(prev => [...prev, test]);
    
    // Update material if test is associated with one
    if (test.materialId) {
      setMaterials(prev => prev.map(mat => 
        mat.id === test.materialId
          ? { ...mat, testIds: [...mat.testIds, test.id] }
          : mat
      ));
    }

    const newActivity: Activity = {
      id: Date.now().toString(),
      type: 'test',
      title: 'Novo ensaio registado',
      description: `${test.tipo} - ${test.zona}`,
      timestamp: new Date().toISOString(),
    };
    setRecentActivities(prev => [newActivity, ...prev].slice(0, 10));
  };

  const addDocument = (document: Document) => {
    setDocuments(prev => [...prev, document]);

    // Update references if document is associated with other items
    if (document.references) {
      document.references.forEach(ref => {
        switch (ref.type) {
          case 'material':
            setMaterials(prev => prev.map(mat => 
              mat.id === ref.id
                ? { ...mat, documentIds: [...mat.documentIds, document.id] }
                : mat
            ));
            break;
          case 'nc':
            setNonConformities(prev => prev.map(nc => 
              nc.id === ref.id
                ? { ...nc, documentIds: [...nc.documentIds, document.id] }
                : nc
            ));
            break;
        }
      });
    }

    const newActivity: Activity = {
      id: Date.now().toString(),
      type: 'document',
      title: 'Novo documento adicionado',
      description: `${document.nome} - ${document.versao}`,
      timestamp: new Date().toISOString(),
    };
    setRecentActivities(prev => [newActivity, ...prev].slice(0, 10));
  };

  const addNonConformity = (nc: NonConformity) => {
    setNonConformities(prev => [...prev, nc]);
    const newActivity: Activity = {
      id: Date.now().toString(),
      type: 'nonConformity',
      title: 'Nova não conformidade',
      description: `${nc.codigo} - ${nc.descricao}`,
      timestamp: new Date().toISOString(),
    };
    setRecentActivities(prev => [newActivity, ...prev].slice(0, 10));
  };

  const addMaterial = (material: Material) => {
    setMaterials(prev => [...prev, material]);
  };

  const getRelatedDocuments = (type: 'nc' | 'test' | 'material' | 'checklist', id: string) => {
    return documents.filter(doc => 
      doc.references?.some(ref => ref.type === type && ref.id === id)
    );
  };

  const getRelatedTests = (materialId: string) => {
    return tests.filter(test => test.materialId === materialId);
  };

  const value = {
    projects,
    tests,
    documents,
    nonConformities,
    materials,
    recentActivities,
    loading,
    error,
    addProject,
    addTest,
    addDocument,
    addNonConformity,
    addMaterial,
    getRelatedDocuments,
    getRelatedTests,
    refreshData,
    isMockData: useMockData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}