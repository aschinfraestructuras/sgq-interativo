import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { FileDown, AlertTriangle } from 'lucide-react';
import { useShare, ShareLink } from '../contexts/ShareContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SharedDocument() {
  const { token } = useParams<{ token: string }>();
  const { getShareLink } = useShare();
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShareLink = async () => {
      try {
        if (!token) {
          setError('Link inválido');
          return;
        }

        const link = await getShareLink(token);
        if (!link) {
          setError('Link não encontrado');
          return;
        }

        if (link.isExpired) {
          setError('Este link expirou');
          return;
        }

        setShareLink(link);
      } catch (error) {
        setError('Erro ao carregar documento');
      } finally {
        setIsLoading(false);
      }
    };

    loadShareLink();
  }, [token]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !shareLink) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Negado
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Voltar ao Início
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <FileDown className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {shareLink.documentName}
          </h1>
          <p className="text-sm text-gray-500">
            Link válido até {new Date(shareLink.expiresAt).toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.open(shareLink.documentId, '_blank')}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FileDown className="h-5 w-5 mr-2" />
            Baixar Documento
          </button>

          <p className="text-xs text-gray-500 text-center">
            Este é um link de acesso direto ao documento. Não é necessário fazer login.
          </p>
        </div>
      </div>
    </div>
  );
}