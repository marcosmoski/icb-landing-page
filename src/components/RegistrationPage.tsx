import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast';

// Tipo para dados do formulário
interface RegistrationData {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento?: string;
  mensagem?: string;
}

const RegistrationPage: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationData>({
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    mensagem: ''
  });

  // Hook de notificações
  const { showToast } = useToast();

  // Estado para simular loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simular processamento
    setIsSubmitting(true);

    // Por enquanto, apenas mostrar toast de "Página em construção"
    showToast({
      type: 'info',
      title: 'Página em construção',
      message: 'O sistema de cadastro estará disponível em breve!',
      duration: 5000
    });

    // Simular delay e depois parar o loading
    setTimeout(() => {
      setIsSubmitting(false);
      console.log('Dados do cadastro:', formData);
    }, 2000);
  };

  const isFormValid = formData.nome.trim() && formData.email.trim() && formData.telefone.trim();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <img
              src="./icblogo.png"
              alt="Logo Igreja"
              className="w-12 h-12 rounded-xl ring-2 ring-white/20"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Igreja ICB Gaia</h1>
              <p className="text-white/70 text-sm">Cadastro de Membros</p>
            </div>
          </Link>

          <Link
            to="/"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
            Voltar
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 pb-16">
        <div className="card bg-white/5 backdrop-blur rounded-3xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Junte-se à nossa comunidade</h2>
            <p className="text-white/70 text-lg">
              Preencha o formulário abaixo para se cadastrar e fazer parte da Igreja ICB Gaia.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-white/90 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-white/90 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="+351 965 169 925"
                />
              </div>

              <div>
                <label htmlFor="dataNascimento" className="block text-sm font-medium text-white/90 mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  id="dataNascimento"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="mensagem" className="block text-sm font-medium text-white/90 mb-2">
                Mensagem (opcional)
              </label>
              <textarea
                id="mensagem"
                name="mensagem"
                value={formData.mensagem}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder="Conte-nos um pouco sobre você ou deixe uma mensagem..."
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M16 11l2 2 4-4"></path>
                    </svg>
                    Cadastrar
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Informações adicionais */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-2xl">ℹ️</span>
              O que acontece depois do cadastro?
            </h3>
            <div className="space-y-2 text-white/80 text-sm">
              <p>• Entraremos em contato para confirmar seus dados</p>
              <p>• Você será adicionado ao nosso grupo de comunicação</p>
              <p>• Receberá informações sobre eventos e atividades</p>
              <p>• Terá acesso aos nossos estudos e conteúdos exclusivos</p>
            </div>
          </div>

          {/* Contato alternativo */}
          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              Prefere falar diretamente? Ligue para nós:
            </p>
            <a
              href="tel:965169925"
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <text x="12" y="8" font-size="9" font-weight="bold" text-anchor="middle" fill="currentColor">MB</text>
                <text x="12" y="18" font-size="9" font-weight="bold" text-anchor="middle" fill="currentColor">WAY</text>
              </svg>
              965 169 925
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegistrationPage;
