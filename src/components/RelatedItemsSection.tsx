import React from 'react';
import { useParams } from 'react-router-dom';
import { useRelationship } from '../contexts/RelationshipContext';
import RelatedItems from './RelatedItems';

interface RelatedItemsSectionProps {
  type: 'document' | 'test' | 'material' | 'nc' | 'checklist' | 'rfi';
  id: string;
}

export default function RelatedItemsSection({ type, id }: RelatedItemsSectionProps) {
  const { id: projectId } = useParams<{ id: string }>();
  const { getRelatedItems } = useRelationship();
  const [relatedItems, setRelatedItems] = React.useState<{
    type: string;
    id: string;
  }[]>([]);

  React.useEffect(() => {
    const loadRelatedItems = async () => {
      const items = await getRelatedItems(type, id);
      setRelatedItems(items);
    };
    loadRelatedItems();
  }, [type, id]);

  if (!projectId || relatedItems.length === 0) return null;

  return (
    <div className="border-t border-gray-200 mt-6 pt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Itens Relacionados
      </h3>
      <div className="space-y-6">
        {relatedItems.map((item, index) => (
          <RelatedItems
            key={`${item.type}-${item.id}-${index}`}
            type={item.type}
            id={item.id}
            projectId={projectId}
          />
        ))}
      </div>
    </div>
  );
}