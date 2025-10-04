import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="max-w-6xl mx-auto px-6 pb-8 text-white/60 text-sm">
      © {currentYear} Igreja — Todos os direitos reservados.
    </footer>
  );
};

export default Footer;
