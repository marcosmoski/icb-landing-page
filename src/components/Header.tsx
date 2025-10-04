import React from 'react';

const Header: React.FC = () => {
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
          <p className="text-white/70 text-sm">"Cada um contribua segundo propôs no coração..." (2 Co 9:7)</p>
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
    </header>
  );
};

export default Header;
