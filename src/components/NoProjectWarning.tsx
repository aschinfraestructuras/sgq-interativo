import React from 'react';
import { Building2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NoProjectWarning() {
  return (
    <div className="p-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Building2 className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Nenhum projeto ativo
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Para aceder aos módulos do sistema, é necessário selecionar um projeto.
              </p>
            </div>
            <div className="mt-4">
              <Link
                to="/projetos"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Selecionar Projeto
                <ChevronRight className="ml-2 -mr-0.5 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}