import React from 'react';
import { Loader } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <Loader className="h-8 w-8 text-brand-500 animate-spin" />
        <p className="text-sm text-gray-600">Carregando módulos...</p>
      </div>
    </div>
  );
}