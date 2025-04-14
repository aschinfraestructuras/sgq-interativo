import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, FlaskRound as Flask, Package, AlertTriangle, CheckSquare, HelpCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface RelatedItemsProps {
  type: 'document' | 'test' | 'material' | 'nc' | 'checklist' | 'rfi';
  ids: string[];
  projectId: string;
}

export default function RelatedItems({ type, ids, projectId }: RelatedItemsProps) {
  const { documents, tests, materials, nonConformities } = useData();

  const getIcon = () => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4 text-indigo-500" />;
      case 'test':
        return <Flask className="h-4 w-4 text-amber-500" />;
      case 'material':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'nc':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'checklist':
        return <CheckSquare className="h-4 w-4 text-purple-500" />;
      case 'rfi':
        return <HelpCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getItems = () => {
    switch (type) {
      case 'document':
        return ids.map(id => documents.find(d => d.id === id)).filter(Boolean);
      case 'test':
        return ids.map(id => tests.find(t => t.id === id)).filter(Boolean);
      case 'material':
        return ids.map(id => materials.find(m => m.id === id)).filter(Boolean);
      case 'nc':
        return ids.map(id => nonConformities.find(nc => nc.id === id)).filter(Boolean);
      default:
        return [];
    }
  };

  const getItemPath = (id: string) => {
    switch (type) {
      case 'document':
        return `/projeto/${projectId}/documentos`;
      case 'test':
        return `/projeto/${projectId}/ensaios`;
      case 'material':
        return `/projeto/${projectId}/materiais`;
      case 'nc':
        return `/projeto/${projectId}/nao-conformidades`;
      case 'checklist':
        return `/projeto/${projectId}/checklists`;
      case 'rfi':
        return `/projeto/${projectId}/rfis`;
      default:
        return '#';
    }
  };

  const getItemTitle = (item: any) => {
    switch (type) {
      case 'document':
        return `${item.nome} (${item.versao})`;
      case 'test':
        return `${item.tipo} - ${item.zona}`;
      case 'material':
        return `${item.designacao} (${item.codigo})`;
      case 'nc':
        return `${item.codigo} - ${item.tipo}`;
      case 'checklist':
        return item.nome;
      case 'rfi':
        return item.assunto;
      default:
        return '';
    }
  };

  const items = getItems();

  if (!items.length) return null;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
        {getIcon()}
        Itens Relacionados
      </h4>
      <div className="space-y-2">
        {items.map((item: any) => (
          <Link
            key={item.id}
            to={getItemPath(item.id)}
            className="block bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {getItemTitle(item)}
          </Link>
        ))}
      </div>
    </div>
  );
}