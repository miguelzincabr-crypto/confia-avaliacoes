import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

import './app/globals.css';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import HomePage from './app/page';
import AvaliarPage from './app/avaliar/[slug]/page';
import EmpresaPage from './app/empresa/[slug]/page';
import DashboardPage from './app/dashboard/page';
import LoginPage from './app/login/page';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-extrabold text-brand-900">Página não encontrada</h1>
      <p className="mt-2 text-sm text-slate-500">O endereço acessado não existe.</p>
      <a href="/" className="btn-primary mt-6">Voltar ao início</a>
    </div>
  );
}

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/avaliar/:slug" element={<AvaliarPage />} />
          <Route path="/empresa/:slug" element={<EmpresaPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
