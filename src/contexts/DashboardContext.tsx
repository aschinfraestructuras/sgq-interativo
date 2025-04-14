import React, { createContext, useContext, useState, useEffect } from 'react';
import { useData } from './DataContext';
import { useAuth } from './AuthContext';
import { useLog } from './LogContext';
import { format, isWithinInterval, parseISO } from 'date-fns';

interface DashboardStats {
  tests: {
    total: number;
    approved: number;
    pending: number;
    byType: Record<string, number>;
    byMonth: {
      labels: string[];
      data: number[];
    };
  };
  documents: {
    total: number;
    byCategory: Record<string, number>;
    pending: number;
    recentUploads: {
      id: string;
      name: string;
      date: string;
    }[];
  };
  nonConformities: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    byType: Record<string, number>;
    byMonth: {
      labels: string[];
      data: number[];
    };
  };
  materials: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    byType: Record<string, number>;
  };
  checklists: {
    total: number;
    completed: number;
    pending: number;
    byStatus: Record<string, number>;
  };
  rfis: {
    total: number;
    pending: number;
    answered: number;
    delayed: number;
    byStatus: Record<string, number>;
  };
}

interface DashboardFilters {
  startDate: string;
  endDate: string;
  projectId?: string;
  zone?: string;
}

interface DashboardContextType {
  stats: DashboardStats;
  filters: DashboardFilters;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  refreshStats: () => void;
  loading: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { activeProject } = useAuth();
  const { 
    tests,
    documents,
    nonConformities,
    materials,
    recentActivities,
    loading: dataLoading
  } = useData();
  const { getLogs } = useLog();

  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    startDate: format(new Date().setDate(1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const [stats, setStats] = useState<DashboardStats>({
    tests: { 
      total: 0, 
      approved: 0, 
      pending: 0, 
      byType: {},
      byMonth: { labels: [], data: [] }
    },
    documents: { 
      total: 0, 
      byCategory: {}, 
      pending: 0,
      recentUploads: []
    },
    nonConformities: { 
      total: 0, 
      open: 0, 
      inProgress: 0, 
      resolved: 0, 
      byType: {},
      byMonth: { labels: [], data: [] }
    },
    materials: { 
      total: 0, 
      approved: 0, 
      pending: 0, 
      rejected: 0, 
      byType: {} 
    },
    checklists: { 
      total: 0, 
      completed: 0, 
      pending: 0,
      byStatus: {}
    },
    rfis: { 
      total: 0, 
      pending: 0, 
      answered: 0, 
      delayed: 0,
      byStatus: {}
    }
  });

  const calculateStats = () => {
    const startDate = parseISO(filters.startDate);
    const endDate = parseISO(filters.endDate);

    const isInDateRange = (date: string) => {
      const itemDate = parseISO(date);
      return isWithinInterval(itemDate, { start: startDate, end: endDate });
    };

    const filterByProject = (projectId?: string) => {
      return !filters.projectId || projectId === filters.projectId;
    };

    // Filter data based on current filters
    const filteredTests = tests.filter(test => 
      isInDateRange(test.data) && filterByProject(test.projectId)
    );

    const filteredDocuments = documents.filter(doc => 
      isInDateRange(doc.dataUpload) && filterByProject(doc.projectId)
    );

    const filteredNCs = nonConformities.filter(nc => 
      isInDateRange(nc.dataRegisto) && filterByProject(nc.projectId)
    );

    const filteredMaterials = materials.filter(mat => 
      isInDateRange(mat.dataRececao) && filterByProject(mat.projectId)
    );

    // Calculate monthly trends
    const getMonthlyData = (items: any[], dateField: string) => {
      const months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return format(date, 'MMM yyyy');
      }).reverse();

      const data = months.map(month => {
        return items.filter(item => 
          format(parseISO(item[dateField]), 'MMM yyyy') === month
        ).length;
      });

      return { labels: months, data };
    };

    // Calculate new stats
    const newStats: DashboardStats = {
      tests: {
        total: filteredTests.length,
        approved: filteredTests.filter(t => t.aprovado).length,
        pending: filteredTests.filter(t => !t.aprovado).length,
        byType: filteredTests.reduce((acc, test) => {
          acc[test.tipo] = (acc[test.tipo] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byMonth: getMonthlyData(filteredTests, 'data')
      },
      documents: {
        total: filteredDocuments.length,
        byCategory: filteredDocuments.reduce((acc, doc) => {
          acc[doc.categoria] = (acc[doc.categoria] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        pending: filteredDocuments.filter(d => d.estado === 'Pendente').length,
        recentUploads: filteredDocuments
          .sort((a, b) => new Date(b.dataUpload).getTime() - new Date(a.dataUpload).getTime())
          .slice(0, 5)
          .map(doc => ({
            id: doc.id,
            name: doc.nome,
            date: doc.dataUpload
          }))
      },
      nonConformities: {
        total: filteredNCs.length,
        open: filteredNCs.filter(nc => nc.estado === 'Aberta').length,
        inProgress: filteredNCs.filter(nc => nc.estado === 'Em Análise').length,
        resolved: filteredNCs.filter(nc => nc.estado === 'Resolvida').length,
        byType: filteredNCs.reduce((acc, nc) => {
          acc[nc.tipo] = (acc[nc.tipo] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byMonth: getMonthlyData(filteredNCs, 'dataRegisto')
      },
      materials: {
        total: filteredMaterials.length,
        approved: filteredMaterials.filter(m => m.estado === 'Aprovado').length,
        pending: filteredMaterials.filter(m => m.estado === 'Pendente').length,
        rejected: filteredMaterials.filter(m => m.estado === 'Rejeitado').length,
        byType: filteredMaterials.reduce((acc, mat) => {
          acc[mat.tipo] = (acc[mat.tipo] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      checklists: {
        total: 0,
        completed: 0,
        pending: 0,
        byStatus: {}
      },
      rfis: {
        total: 0,
        pending: 0,
        answered: 0,
        delayed: 0,
        byStatus: {}
      }
    };

    setStats(newStats);
  };

  // Update stats when filters or data change
  useEffect(() => {
    if (!dataLoading) {
      calculateStats();
      setLoading(false);
    }
  }, [filters, tests, documents, nonConformities, materials, dataLoading]);

  // Update project filter when active project changes
  useEffect(() => {
    if (activeProject) {
      setFilters(prev => ({ ...prev, projectId: activeProject.id }));
    }
  }, [activeProject]);

  const refreshStats = () => {
    setLoading(true);
    calculateStats();
    setLoading(false);
  };

  const value = {
    stats,
    filters,
    setFilters: (newFilters: Partial<DashboardFilters>) => 
      setFilters(prev => ({ ...prev, ...newFilters })),
    refreshStats,
    loading
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}