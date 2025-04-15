import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { DataProvider } from './contexts/DataContext';
import { LogProvider } from './contexts/LogContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ShareProvider } from './contexts/ShareContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { SubmissionProvider } from './contexts/SubmissionContext';
import { RelationshipProvider } from './contexts/RelationshipContext';
import { DashboardProvider } from './contexts/DashboardContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projetos from './pages/Projetos';
import ProjetoLayout from './pages/projeto/ProjetoLayout';
import SharedDocument from './pages/SharedDocument';

function App() {
  const { t } = useTranslation('common');

  const navigation = [
    { name: t('navigation.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('navigation.projects'), href: '/projetos', icon: Package },
  ];

  return (
    <AuthProvider>
      <ProjectProvider>
        <LogProvider>
          <DataProvider>
            <NotificationProvider>
              <ShareProvider>
                <HistoryProvider>
                  <SubmissionProvider>
                    <RelationshipProvider>
                      <DashboardProvider>
                        <BrowserRouter>
                          <div className="min-h-screen flex flex-col bg-brand-50">
  <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
    <div className="flex items-center space-x-4">
      <img src="/logo-asch.png" alt="Logótipo ASCH" className="h-12" />
      <h1 className="text-2xl font-bold text-gray-800">
        SGQ – Sistema de Gestão da Qualidade ASCH
      </h1>
    </div>
  </header>
                            <Routes>
                              <Route path="/login" element={<Login />} />
                              <Route path="/share/:token" element={<SharedDocument />} />
                              <Route
                                path="/*"
                                element={
                                  <ProtectedRoute>
                                    <div className="flex flex-1">
                                      <Sidebar navigation={navigation} />
                                      <div className="flex-1 flex flex-col">
                                        <TopBar />
                                        <main className="flex-1 overflow-auto">
                                          <Routes>
                                            <Route path="/dashboard" element={<Dashboard />} />
                                            <Route path="/projetos" element={<Projetos />} />
                                            <Route path="/projeto/:id/*" element={<ProjetoLayout />} />
                                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                          </Routes>
                                        </main>
                                        <Footer />
                                      </div>
                                    </div>
                                  </ProtectedRoute>
                                }
                              />
                            </Routes>
                          </div>
                          <Toaster
                            position="top-right"
                            toastOptions={{
                              duration: 3000,
                              style: {
                                background: '#363636',
                                color: '#fff',
                                borderRadius: '0.5rem',
                              },
                              success: {
                                iconTheme: {
                                  primary: '#22c55e',
                                  secondary: '#fff',
                                },
                              },
                              error: {
                                iconTheme: {
                                  primary: '#e60000',
                                  secondary: '#fff',
                                },
                              },
                            }}
                          />
                        </BrowserRouter>
                      </DashboardProvider>
                    </RelationshipProvider>
                  </SubmissionProvider>
                </HistoryProvider>
              </ShareProvider>
            </NotificationProvider>
          </DataProvider>
        </LogProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;