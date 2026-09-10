import React from 'react';
import { Link } from 'react-router-dom';
import { CHURCH_DETAILS, LAST_UPDATED, legalLinks } from '@/lib/legal';

interface LegalLayoutProps {
  title: string;
  intro: string;
  currentPath: string;
  children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ title, intro, currentPath, children }) => (
  <div className="min-h-screen bg-[#060a19] text-white relative overflow-hidden">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(57,89,170,0.35),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(22,33,76,0.5),transparent_55%)]" />

    <main className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-8">
        <Link to="/" className="text-slate-300/80 hover:text-white text-sm">
          ← Voltar para a home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-100 mt-5">
          {title}
        </h1>
        <p className="text-slate-300/85 mt-3 leading-relaxed">{intro}</p>
        <p className="text-slate-400/80 text-sm mt-3">Última atualização: {LAST_UPDATED}</p>
      </header>

      <nav className="flex flex-wrap gap-2 mb-8">
        {legalLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`min-h-[40px] inline-flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
              currentPath === link.path
                ? 'bg-blue-600/30 border border-blue-500/40 text-white'
                : 'bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <article className="rounded-[28px] border border-slate-400/20 bg-[linear-gradient(145deg,rgba(14,21,44,0.95),rgba(6,10,25,0.94))] shadow-[0_24px_60px_rgba(2,6,23,0.7)] p-5 sm:p-8 space-y-8">
        {children}
      </article>

      <p className="text-slate-300/80 text-sm mt-8 text-center">
        Dúvidas sobre este documento? Fale connosco em{' '}
        <a href={`mailto:${CHURCH_DETAILS.email}`} className="text-blue-300 hover:underline">
          {CHURCH_DETAILS.email}
        </a>
        .
      </p>
    </main>
  </div>
);

/** Secção de um documento legal. */
export const LegalSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="space-y-3">
    <h2 className="text-lg sm:text-xl font-semibold text-slate-100">{title}</h2>
    <div className="space-y-3 text-slate-300/90 leading-relaxed">{children}</div>
  </section>
);

/** Lista com marcadores, com o espaçamento usado em todo o documento. */
export const LegalList: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="space-y-2 pl-5 list-disc marker:text-blue-300/60">
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

/** Tabela simples usada para "que dados" e "que cookies". */
export const LegalTable: React.FC<{ headers: string[]; rows: React.ReactNode[][] }> = ({
  headers,
  rows,
}) => (
  <div className="overflow-x-auto rounded-xl border border-slate-400/20">
    <table className="w-full text-sm">
      <thead className="bg-white/5">
        <tr>
          {headers.map((header) => (
            <th key={header} className="px-4 py-3 text-left font-medium text-slate-100 whitespace-nowrap">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} className="border-t border-slate-400/15 align-top">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="px-4 py-3 text-slate-300/90">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default LegalLayout;
