import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { DivideIcon as LucideIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  navigation: NavigationItem[];
}

export default function Sidebar({ navigation }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation('common');

  return (
    <div 
      className={`flex flex-col bg-gradient-to-b from-brand-600 to-brand-700 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo section */}
      <div className="flex flex-col items-center px-4 pt-8 pb-6 border-b border-brand-500/30">
        <img
          src="https://raw.githubusercontent.com/stackblitz/stackblitz-webcontainer-core-api/main/docs/public/logo-asch.png"
          alt="ASCH Infraestructuras"
          className={`transition-all duration-300 ${isCollapsed ? 'h-10' : 'h-14'}`}
        />
        <span className={`mt-3 text-xs text-brand-100 text-center transition-opacity duration-200 ${
          isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
        }`}>
          {t('app.company')}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-brand-100 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
            <span className={`transition-opacity duration-200 ${
              isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'
            }`}>
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Collapse button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-20 bg-white border border-brand-100 rounded-full p-1.5 shadow-soft hover:bg-brand-50 transition-colors"
        aria-label={isCollapsed ? 'Expandir menu' : 'Colapsar menu'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-brand-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-brand-600" />
        )}
      </button>

      {/* Footer */}
      <div className="border-t border-brand-500/30 p-4">
        <div className={`text-xs text-brand-100 text-center ${
          isCollapsed ? 'hidden' : 'block'
        }`}>
          © {new Date().getFullYear()} ASCH
        </div>
      </div>
    </div>
  );
}