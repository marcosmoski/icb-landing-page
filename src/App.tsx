import Header from './components/Header';
import VerseSection from './components/VerseSection';
import InspirationSection from './components/InspirationSection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <img 
          src="./icb_dizimos.jpg" 
          alt="Fundo - Leão de Judá (placeholder)" 
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-overlay"></div>
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <VerseSection />
        <InspirationSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
