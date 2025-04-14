import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function DataWarning() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
      <div className="flex items-center gap-2 text-gray-600">
        <AlertCircle className="h-5 w-5 text-gray-400" />
        <p className="text-sm">
          📊 Indicadores apresentados são ilustrativos. Integração com dados reais será feita na fase final.
        </p>
      </div>
    </div>
  );
}