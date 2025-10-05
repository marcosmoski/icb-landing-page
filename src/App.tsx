import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import VerseSection from './components/VerseSection';
import InspirationSection from './components/InspirationSection';
import Footer from './components/Footer';
import RegistrationPage from './components/RegistrationPage';

function App() {
  return (
    <Router>
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

        <Routes>
          <Route path="/" element={
            <>
              <Header showRegistrationButton={true} />
              <main className="max-w-6xl mx-auto px-6 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <VerseSection />
                <InspirationSection />
              </main>
            </>
          } />
          <Route path="/cadastro" element={<RegistrationPage />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
