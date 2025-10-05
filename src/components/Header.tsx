import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  showRegistrationButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showRegistrationButton = false }) => {
  const copyPhoneNumber = async () => {
    try {
      await navigator.clipboard.writeText('965169925');
      // Feedback visual simples
      const button = document.querySelector('.phone-copy-btn');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copiado!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 1500);
      }
    } catch {
      alert('Número copiado: 965169925');
    }
  };

  return (
    <header className="max-w-6xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <img
          src="./icblogo.png"
          alt="Logo Igreja"
          className="w-14 h-14 rounded-xl ring-2 ring-white/20"
        />
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Igreja ICB Gaia — Dízimos e Ofertas</h1>
          <p className="text-white/70 text-sm">"É sobre dar uma fatia de bolo a quem já te deu o bolo inteiro..."</p>
        </div>
      </div>

        <div className="hidden md:flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-2">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
              <text x="12" y="8" font-size="9" font-weight="bold" text-anchor="middle" fill="currentColor">MB</text>
              <text x="12" y="18" font-size="9" font-weight="bold" text-anchor="middle" fill="currentColor">WAY</text>
            </svg>
            <span className="text-white font-medium">965 169 925</span>
          </div>
          <button
            onClick={copyPhoneNumber}
            className="phone-copy-btn px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
          >
            Copiar
          </button>
        </div>

        {showRegistrationButton && (
          <Link
            to="/cadastro"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M16 11l2 2 4-4"></path>
            </svg>
            Cadastrar
          </Link>
        )}
    </header>
  );
};

export default Header;
