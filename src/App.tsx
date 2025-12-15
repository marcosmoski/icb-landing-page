import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import DizimosPage from './components/DizimosPage';
import RegistrationPage from './components/RegistrationPage';
import AdminPanel from './components/AdminPanel';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './components/AdminLogin';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navigation />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dizimos" element={<DizimosPage />} />
          <Route path="/cadastro" element={<RegistrationPage />} />
          
          {/* Rotas Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminPanel />} />
          </Route>
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
