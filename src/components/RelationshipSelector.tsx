import React, { useState } from 'react';
import { Link as LinkIcon, Plus, X } from 'lucide-react';
import { RelationType } from '../contexts/RelationshipContext';
import { useData } from '../contexts/DataContext';

interface RelationshipSelectorProps {
  type: RelationType;
  onSelect: (selectedType: RelationType, selectedId: string) => void;
  onCancel: () => void;
  excludeIds?: string[];
}

const typeLabels: Record<RelationType, string> = {
  document: 'Documento',
  test: 'Ensaio',
  material: 'Material',
  nc: 'Não Conformidade',
  checklist: 'Checklist',
  rfi: 'RFI'
};

export default function RelationshipSelector({
  type,
  onSelect,
  onCancel,
  excludeIds = []
}: RelationshipSelectorProps) {
  const { documents, tests, materials, nonConformities } = useData();
  const [selectedType, setSelectedType] = useState<RelationType>(type);
  const [search, setSearch] = useState('');

  const getItems = () => {
    switch (selectedType) {
      case 'document':
        return documents.filter(d => !excludeIds.includes(d.id));
      case 'test':
        return tests.filter(t => !excludeIds.includes(t.id));
      case 'material':
        return materials.filter(m => !excludeIds.includes(m.id));
      case 'nc':
        return nonConformities.filter(nc => !excludeIds.includes(nc.id));
      default:
        return [];
    }
  };

  const getItemTitle = (item: any) => {
    switch (selectedType) {
      case 'document':
        return `${item.nome} (${item.versao})`;
      case 'test':
        return `${item.tipo} - ${item.zona}`;
      case 'material':
        return `${item.designacao} (${item.codigo})`;
      case 'nc':
        return `${item.codigo} - ${item.tipo}`;
      default:
        return '';
    }
  };

  const filteredItems = getItems().filter(item => {
    if (!search) return true;
    const title = getItemTitle(item).toLowerCase();
    return title.includes(search.toLowerCase());
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Adicionar Relacionamento</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Item
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as RelationType)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pesquisar
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Digite para pesquisar..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="max-h-60 overflow-y-auto">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(selectedType, item.id)}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2"
            >
              <LinkIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-900">
                {getItemTitle(item)}
              </span>
            </button>
          ))}
          {filteredItems.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhum item encontrado
            </p>
          )}
        </div>
      </div>
    </div>
  );
}