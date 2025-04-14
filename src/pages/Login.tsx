import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, Key, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithAccessCode } = useAuth();
  
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'accessCode'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Login efetuado com sucesso');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error('Credenciais inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await loginWithAccessCode(accessCode);
      toast.success('Acesso temporário concedido');
      navigate(`/projeto/${result.projectId}/documentos`, { replace: true });
    } catch (err) {
      toast.error('Código de acesso inválido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            src="https://raw.githubusercontent.com/stackblitz/stackblitz-webcontainer-core-api/main/docs/public/logo-asch.png"
            alt="ASCH Infraestructuras"
            className="h-16 mx-auto"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Gestão de Obras
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Plataforma de Gestão de Obras e Infraestruturas
          </p>
        </div>

        <div className="bg-white shadow-card rounded-xl">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                loginMethod === 'credentials'
                  ? 'text-brand-600 border-b-2 border-brand-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setLoginMethod('credentials')}
            >
              <User className="h-5 w-5 inline-block mr-2" />
              Login com Credenciais
            </button>
            <button
              className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                loginMethod === 'accessCode'
                  ? 'text-brand-600 border-b-2 border-brand-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setLoginMethod('accessCode')}
            >
              <Key className="h-5 w-5 inline-block mr-2" />
              Código de Acesso
            </button>
          </div>

          <div className="p-6">
            {loginMethod === 'credentials' ? (
              <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Palavra-passe
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Perfil
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                  >
                    <option value="admin">Administrador</option>
                    <option value="fiscal">Fiscal</option>
                    <option value="viewer">Visualização</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      A entrar...
                    </>
                  ) : (
                    <>
                      Entrar
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAccessCodeSubmit} className="space-y-6">
                <div>
                  <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
                    Código de Acesso
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="accessCode"
                      name="accessCode"
                      type="text"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                      placeholder="Digite o código de acesso"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                    />
                    <Key className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      A validar...
                    </>
                  ) : (
                    <>
                      Validar Código
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>
            © {new Date().getFullYear()} ASCH Infraestructuras y Servicios S.A.
          </p>
        </div>
      </div>
    </div>
  );
}