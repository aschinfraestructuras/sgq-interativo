import React, { useState } from 'react';
import { X, Copy, Calendar, Link as LinkIcon, Trash } from 'lucide-react';
import { useShare, ShareLink } from '../contexts/ShareContext';
import { toast } from 'react-hot-toast';

interface ShareLinkModalProps {
  documentId: string;
  documentName: string;
  onClose: () => void;
}

export default function ShareLinkModal({ documentId, documentName, onClose }: ShareLinkModalProps) {
  const { createShareLink, getDocumentShareLinks, revokeShareLink } = useShare();
  const [expiresAt, setExpiresAt] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    loadShareLinks();
  }, [documentId]);

  const loadShareLinks = async () => {
    const links = await getDocumentShareLinks(documentId);
    setShareLinks(links);
  };

  const handleCreateLink = async () => {
    setIsLoading(true);
    try {
      const shareLink = await createShareLink(documentId, documentName, expiresAt);
      setShareLinks([...shareLinks, shareLink]);
      toast.success('Link de partilha criado com sucesso');
    } catch (error) {
      toast.error('Erro ao criar link de partilha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = (token: string) => {
    const shareUrl = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copiado para a área de transferência');
  };

  const handleRevoke = async (id: string) => {
    try {
      await revokeShareLink(id);
      setShareLinks(shareLinks.filter(link => link.id !== id));
    } catch (error) {
      toast.error('Erro ao revogar link de partilha');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Partilhar Documento</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {documentName}
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="expiresAt" className="block text-sm text-gray-500 mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Data de Expiração
                </label>
                <input
                  type="date"
                  id="expiresAt"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <button
                onClick={handleCreateLink}
                disabled={isLoading}
                className="mt-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Criar Link
              </button>
            </div>
          </div>

          {shareLinks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Links Ativos</h4>
              <div className="space-y-3">
                {shareLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`bg-gray-50 p-3 rounded-lg ${
                      link.isExpired ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          Link de Acesso
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyLink(link.token)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Copiar Link"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRevoke(link.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Revogar Acesso"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Expira em: {new Date(link.expiresAt).toLocaleDateString()}
                      {link.isExpired && (
                        <span className="ml-2 text-red-600">(Expirado)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}