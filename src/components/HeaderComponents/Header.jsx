import React, { useEffect, useState, useRef } from 'react';
import './HeaderStyle.css';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { FiMoon, FiSun } from 'react-icons/fi';
import { IoLanguage } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const [active, setActive] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [navOnly, setNavOnly] = useState(false);
  const lastY = useRef(0);
  const { theme, toggleTheme } = useTheme();

  const { t, i18n } = useTranslation();

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
          <a href="#home" className={active === 'home' ? 'active' : ''}>{t('header.home')}</a>
          <a href="#skills" className={active === 'skills' ? 'active' : ''}>{t('header.skills')}</a>
          <a href="#education" className={active === 'education' ? 'active' : ''}>{t('header.education')}</a>
          <a href="#contact" className={active === 'contact' ? 'active' : ''}>{t('header.contact')}</a>
        </nav>

        {/* Right-side controls: language + theme */}
        <div className="header-controls" role="group" aria-label="Header controls">
          <button
            className="lang-icon"
            onClick={() => {
              const next = i18n.language === 'en' ? 'pt' : 'en';
              i18n.changeLanguage(next);
              localStorage.setItem('lang', next);
            }}
            title={i18n.language === 'en' ? 'Switch to Português' : 'Switch to English'}
            aria-label="Toggle language"
          >
            <IoLanguage size={18} />
            <span className="lang-code">{i18n.language.toUpperCase()}</span>
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