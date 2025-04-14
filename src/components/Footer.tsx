import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          © {new Date().getFullYear()} ASCH Infraestructuras y Servicios S.A.
        </div>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-brand-700 transition-colors">
            Política de Privacidade
          </Link>
          <Link to="/contact" className="hover:text-brand-700 transition-colors">
            Contactos
          </Link>
        </div>
      </div>
    </footer>
  );
}