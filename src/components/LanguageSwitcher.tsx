import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';

const languages = [
  { code: 'pt', name: 'Português' },
  { code: 'es', name: 'Español' }
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = async (langCode: string) => {
    setIsChanging(true);
    try {
      await i18n.changeLanguage(langCode);
      toast.success(`Idioma alterado para ${languages.find(lang => lang.code === langCode)?.name}`);
      setIsOpen(false);
    } catch (error) {
      toast.error('Erro ao mudar idioma');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="relative">
      <button 
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
        disabled={isChanging}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isChanging ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : (
          <Languages className="h-5 w-5" />
        )}
        <span className="hidden md:inline">
          {languages.find(lang => lang.code === i18n.language)?.name}
        </span>
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`dropdown-item ${
                i18n.language === language.code ? 'text-brand-600 font-medium' : 'text-gray-700'
              }`}
            >
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}