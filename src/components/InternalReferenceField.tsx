import React from 'react';
import { Hash } from 'lucide-react';

interface InternalReferenceFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function InternalReferenceField({
  value,
  onChange,
  label = 'Referência Interna',
  placeholder = 'Ex: ZONA-A1, EST-001, PROC-123',
  required = false,
  className = ''
}: InternalReferenceFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Hash className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Use este campo para ligar o registo a um código, obra, zona ou estrutura externa
      </p>
    </div>
  );
}