import React from 'react';
import { 
  FileText, 
  FlaskRound as Flask,
  Package, 
  AlertTriangle,
  CheckSquare,
  HelpCircle
} from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

export default function DashboardStats() {
  const { stats, loading } = useDashboard();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-card p-6">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Tests */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-amber-50 rounded-lg">
            <Flask className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Ensaios</h3>
            <p className="text-3xl font-bold text-amber-600">
              {stats.tests.pending} Pendentes
            </p>
          </div>
        </div>
        <Line
          data={{
            labels: stats.tests.byMonth.labels,
            datasets: [{
              label: 'Ensaios Realizados',
              data: stats.tests.byMonth.data,
              borderColor: 'rgb(217, 119, 6)',
              backgroundColor: 'rgba(217, 119, 6, 0.1)',
              tension: 0.4,
              fill: true
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }}
        />
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-brand-50 rounded-lg">
            <FileText className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Documentos</h3>
            <p className="text-3xl font-bold text-brand-600">
              {stats.documents.total} Total
            </p>
          </div>
        </div>
        <Bar
          data={{
            labels: Object.keys(stats.documents.byCategory),
            datasets: [{
              data: Object.values(stats.documents.byCategory),
              backgroundColor: 'rgba(0, 60, 113, 0.6)'
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }}
        />
      </div>

      {/* Non-Conformities */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Não Conformidades</h3>
            <p className="text-3xl font-bold text-red-600">
              {stats.nonConformities.open} Abertas
            </p>
          </div>
        </div>
        <Line
          data={{
            labels: stats.nonConformities.byMonth.labels,
            datasets: [{
              label: 'NCs Registadas',
              data: stats.nonConformities.byMonth.data,
              borderColor: 'rgb(220, 38, 38)',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              tension: 0.4,
              fill: true
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }}
        />
      </div>

      {/* Materials */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Materiais</h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats.materials.pending} Pendentes
            </p>
          </div>
        </div>
        <Doughnut
          data={{
            labels: ['Aprovados', 'Pendentes', 'Rejeitados'],
            datasets: [{
              data: [
                stats.materials.approved,
                stats.materials.pending,
                stats.materials.rejected
              ],
              backgroundColor: [
                'rgba(34, 197, 94, 0.6)',
                'rgba(234, 179, 8, 0.6)',
                'rgba(239, 68, 68, 0.6)'
              ]
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }}
        />
      </div>

      {/* Checklists */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-purple-50 rounded-lg">
            <CheckSquare className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Checklists</h3>
            <p className="text-3xl font-bold text-purple-600">
              {stats.checklists.pending} Pendentes
            </p>
          </div>
        </div>
        <Doughnut
          data={{
            labels: ['Concluídos', 'Pendentes'],
            datasets: [{
              data: [stats.checklists.completed, stats.checklists.pending],
              backgroundColor: [
                'rgba(147, 51, 234, 0.6)',
                'rgba(229, 231, 235, 0.6)'
              ]
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }}
        />
      </div>

      {/* RFIs */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <HelpCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">RFIs</h3>
            <p className="text-3xl font-bold text-green-600">
              {stats.rfis.pending} Pendentes
            </p>
          </div>
        </div>
        <Bar
          data={{
            labels: ['Pendentes', 'Respondidos', 'Em Atraso'],
            datasets: [{
              data: [
                stats.rfis.pending,
                stats.rfis.answered,
                stats.rfis.delayed
              ],
              backgroundColor: [
                'rgba(234, 179, 8, 0.6)',
                'rgba(34, 197, 94, 0.6)',
                'rgba(239, 68, 68, 0.6)'
              ]
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}