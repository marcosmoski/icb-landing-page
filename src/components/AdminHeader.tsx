import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const adminLinks = [
  { path: '/admin', label: 'Cadastros' },
  { path: '/admin/pedidos-oracao', label: 'Pedidos de oração' },
  { path: '/admin/pesquisas', label: 'Pesquisas' },
];

interface AdminHeaderProps {
  subtitle?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <header className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-4">
          <img src="/icblogo.png" alt="Logo Igreja" className="w-12 h-12 rounded-xl ring-2 ring-white/20" />
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">ICB Gaia - Admin</h1>
            {subtitle && <p className="text-white/70 text-sm">{subtitle}</p>}
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {adminLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-blue-600/30 border border-blue-500/40'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
