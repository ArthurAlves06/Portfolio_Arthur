import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import Header from './components/HeaderComponents/Header';
import Hero from './components/HeroComponents/Hero';
import Skills from './components/SkillsComponents/Skills';
import Projects from './components/ProjectsComponents/Projects';
import Education from './components/EducationComponents/Education';
import Footer from './components/FooterComponents/Footer';
import Contact from './components/ConctactComponents/Contact';
import AdminDashboard from './components/AdminComponents/AdminDashboard';
import { getAuthClient } from './services/firebase';
import { trackEvent } from './utils/analytics';

// Optional: set the admin e-mail via Vite env. If empty, any authenticated user is allowed.
const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase();
// Development-only fallback password (DO NOT set in production builds).
const DEV_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';
const IS_DEV = Boolean(import.meta.env.DEV);

const AdminGate = ({ onUnlock }) => {
  const auth = getAuthClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!auth && !IS_DEV) {
      setError('Firebase não está configurado.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    // Development fallback: if running locally and a dev password is provided, allow quick unlock.
    if (IS_DEV && DEV_ADMIN_PASSWORD && password === DEV_ADMIN_PASSWORD) {
      const signedEmail = (email || '').toLowerCase();
      if (ADMIN_EMAIL && signedEmail !== ADMIN_EMAIL) {
        setError('Conta não autorizada para acessar o painel.');
        setIsSubmitting(false);
        return;
      }
      try { sessionStorage.setItem('admin_unlocked_dev', 'true'); } catch {}
      onUnlock();
      setIsSubmitting(false);
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const signedEmail = cred?.user?.email?.toLowerCase() || '';
      if (ADMIN_EMAIL && signedEmail !== ADMIN_EMAIL) {
        // not authorized for admin
        try { await signOut(auth); } catch {}
        setError('Conta não autorizada para acessar o painel.');
        return;
      }
      onUnlock();
    } catch (err) {
      setError('Falha no login. Verifique o e-mail e a senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-login-screen">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <p className="admin-login-eyebrow">Acesso restrito</p>
        <h1>Painel administrativo</h1>
        <p className="admin-login-copy">Entre com sua conta autorizada do Firebase para acessar o painel.</p>

        <label className="admin-login-label" htmlFor="admin-email">E-mail</label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="admin-login-input"
          autoComplete="email"
        />

        <label className="admin-login-label" htmlFor="admin-password">Senha</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="admin-login-input"
          autoComplete="current-password"
        />

        {error ? <p className="admin-login-error">{error}</p> : null}

        <button type="submit" className="admin-login-button" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
};

function App() {
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const trackedRef = useRef(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    if (IS_DEV) return sessionStorage.getItem('admin_unlocked_dev') === 'true';
    return false;
  });
  const auth = getAuthClient();

  useEffect(() => {
    if (!isAdminRoute || !auth) return undefined;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIsAdminUnlocked(false);
        return;
      }
      const email = (user.email || '').toLowerCase();
      if (ADMIN_EMAIL) {
        setIsAdminUnlocked(email === ADMIN_EMAIL);
      } else {
        setIsAdminUnlocked(true);
      }
    });

    return unsubscribe;
  }, [auth, isAdminRoute]);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackEvent('page_view', { route: window.location.pathname, page: isAdminRoute ? 'admin' : 'home' });
  }, [isAdminRoute]);

  if (isAdminRoute) {
    if (!isAdminUnlocked) {
      return <AdminGate onUnlock={() => setIsAdminUnlocked(true)} />;
    }
    return <AdminDashboard onLogout={async () => {
      if (auth) {
        try { await signOut(auth); } catch {}
      }
      if (IS_DEV) {
        try { sessionStorage.removeItem('admin_unlocked_dev'); } catch {}
      }
      setIsAdminUnlocked(false);
    }} />;
  }

  return (
    <React.Fragment>
      <Header />
      <Hero />
      <Projects />
      <Skills />
      <Education />
      <Contact />
      <Footer />
    </React.Fragment>
  );
}

export default App;