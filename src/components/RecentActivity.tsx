import React from 'react';
import { Clock, FileText, FlaskRound as Flask, AlertTriangle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useTranslation } from 'react-i18next';

export default function RecentActivity() {
  const { t } = useTranslation('dashboard');
  const { recentActivities } = useData();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Há ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    }
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'test':
        return <Flask className="h-4 w-4" />;
      case 'nonConformity':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActivityStyle = (type: string) => {
    switch (type) {
      case 'document':
        return 'bg-brand-50 text-brand-600';
      case 'test':
        return 'bg-amber-50 text-amber-600';
      case 'nonConformity':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-brand-500" />
        {t('recentActivity')}
      </h3>
      <div className="space-y-4">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${getActivityStyle(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-xs text-gray-500">{activity.description}</p>
              <p className="text-xs text-gray-400">{formatTimestamp(activity.timestamp)}</p>
            </div>
          </div>
        ))}
        {recentActivities.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhuma atividade recente
          </p>
        )}
      </div>
    </div>
  );
}