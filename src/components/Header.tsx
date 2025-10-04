import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="max-w-6xl mx-auto px-6 pt-8 pb-4 flex items-center gap-4">
      <img 
        src="./icblogo.png" 
        alt="Logo Igreja" 
        className="w-14 h-14 rounded-xl ring-2 ring-white/20"
      />
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Igreja ICB — Doações</h1>
        <p className="text-white/70 text-sm">"Cada um contribua segundo propôs no coração..." (2 Co 9:7)</p>
      </div>
    </header>
  );
};

export default Header;
