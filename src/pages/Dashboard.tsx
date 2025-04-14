import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Calendar,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../contexts/DashboardContext';
import DashboardStats from '../components/DashboardStats';
import RecentActivity from '../components/RecentActivity';
import DataWarning from '../components/DataWarning';

export default function Dashboard() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { activeProject } = useAuth();
  const { filters, setFilters } = useDashboard();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <LayoutDashboard className="h-6 w-6 text-brand-500" />
            {t('dashboard:title')}
          </h1>
          {activeProject && (
            <p className="text-sm text-gray-600">
              Obra: {activeProject.nome}
            </p>
          )}
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="h-4 w-4 inline mr-1" />
              Data Início
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ startDate: e.target.value })}
              className="block rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="h-4 w-4 inline mr-1" />
              Data Fim
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ endDate: e.target.value })}
              className="block rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
            />
          </div>
          {!activeProject && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="h-4 w-4 inline mr-1" />
                Zona
              </label>
              <select
                value={filters.zone}
                onChange={(e) => setFilters({ zone: e.target.value })}
                className="block rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
              >
                <option value="">Todas</option>
                <option value="Bloco A">Bloco A</option>
                <option value="Bloco B">Bloco B</option>
                <option value="Área Externa">Área Externa</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <DataWarning />

      {/* Stats Grid */}
      <DashboardStats />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}