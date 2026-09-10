import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import DizimosPage from './components/DizimosPage';
import RegistrationPage from './components/RegistrationPage';
import PrayerRequestsPage from './components/PrayerRequestsPage';
import SurveyPage from './components/SurveyPage';
import AdminPanel from './components/AdminPanel';
import AdminPrayerRequestsPage from './components/AdminPrayerRequestsPage';
import AdminSurveysPage from './components/AdminSurveysPage';
import AdminSurveyDetailPage from './components/AdminSurveyDetailPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import CookiePolicyPage from './components/CookiePolicyPage';
import TermsPage from './components/TermsPage';
import CookieBanner from './components/CookieBanner';
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
          <Route path="/pedidos-oracao" element={<PrayerRequestsPage />} />
          <Route path="/pesquisa/:slug" element={<SurveyPage />} />

          {/* Páginas legais (RGPD) */}
          <Route path="/privacidade" element={<PrivacyPolicyPage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route path="/termos" element={<TermsPage />} />

          {/* Rotas Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminPanel />} />
            <Route path="pedidos-oracao" element={<AdminPrayerRequestsPage />} />
            <Route path="pesquisas" element={<AdminSurveysPage />} />
            <Route path="pesquisas/:id" element={<AdminSurveyDetailPage />} />
          </Route>
        </Routes>

        <Footer />
        <CookieBanner />
      </div>
    </Router>
  );
}

export default App;
