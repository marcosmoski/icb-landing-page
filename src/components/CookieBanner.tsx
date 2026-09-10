import React from 'react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '@/hooks/useCookieConsent';

const CookieBanner: React.FC = () => {
  const { hasDecided, accept, reject } = useCookieConsent();

  if (hasDecided) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="aviso-cookies-titulo"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-400/25 bg-[linear-gradient(145deg,rgba(14,21,44,0.98),rgba(6,10,25,0.98))] shadow-[0_20px_50px_rgba(2,6,23,0.8)] p-5">
        <h2 id="aviso-cookies-titulo" className="text-slate-100 font-semibold">
          Cookies neste site
        </h2>
        <p className="text-slate-300/90 text-sm mt-2 leading-relaxed">
          Usamos apenas o essencial para o site funcionar. O feed do Instagram na página inicial é
          carregado por um serviço externo, que pode colocar cookies próprios — só o carregamos se
          aceitar. Não usamos publicidade nem ferramentas de análise.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button
            onClick={accept}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#567bc7] to-[#6f94df] text-white font-semibold hover:brightness-110 transition"
          >
            Aceitar tudo
          </button>
          <button
            onClick={reject}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-slate-100 transition-colors"
          >
            Só o essencial
          </button>
          <Link
            to="/cookies"
            className="min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 text-sm text-slate-300 hover:text-white underline transition-colors"
          >
            Saber mais
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
