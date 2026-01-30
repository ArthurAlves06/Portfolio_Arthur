import React, { useEffect, useState, useRef } from 'react';
import './HeaderStyle.css';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { FiMoon, FiSun } from 'react-icons/fi';
import { IoLanguage } from 'react-icons/io5';

const Header = () => {
  const [active, setActive] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [navOnly, setNavOnly] = useState(false);
  const lastY = useRef(0);
  const { theme, toggleTheme } = useTheme();

  // language state (persist)
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'EN');
  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  // simple labels map — expand as needed for other components
  const labels = {
    EN: {
      home: 'Home',
      skills: 'Skills',
      education: 'Education',
      contact: 'Contact'
    },
    PT: {
      home: 'Início',
      skills: 'Habilidades',
      education: 'Educação',
      contact: 'Contato'
    }
  };

  useEffect(() => {
    const ids = ['home', 'skills', 'education', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { threshold: 0.45 }
    );

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 80);
      const delta = y - lastY.current;
      const THRESH = 12; // small threshold to avoid jitter

      if (delta > THRESH && y > 120) {
        // user scrolled down enough -> show only nav
        setNavOnly(true);
      } else if (delta < -THRESH) {
        // user scrolled up -> restore full header
        setNavOnly(false);
      }

      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${scrolled ? 'scrolled' : ''} ${navOnly ? 'nav-only' : ''}`}>
      <div className="header-inner">
        <div className="logo">Arthur.</div>

        <nav>
          <a href="#home" className={active === 'home' ? 'active' : ''}>{labels[lang].home}</a>
          <a href="#skills" className={active === 'skills' ? 'active' : ''}>{labels[lang].skills}</a>
          <a href="#education" className={active === 'education' ? 'active' : ''}>{labels[lang].education}</a>
          <a href="#contact" className={active === 'contact' ? 'active' : ''}>{labels[lang].contact}</a>
        </nav>

        {/* Right-side controls: language + theme */}
        <div className="header-controls" role="group" aria-label="Header controls">
          <button
            className="lang-icon"
            onClick={() => setLang(prev => (prev === 'EN' ? 'PT' : 'EN'))}
            title={lang === 'EN' ? 'Switch to Português' : 'Switch to English'}
            aria-label="Toggle language"
          >
            <IoLanguage size={18} />
            <span className="lang-code">{lang}</span>
          </button>

          <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;