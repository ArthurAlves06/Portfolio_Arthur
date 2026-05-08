import React from 'react';
import './HeroStyle.css';
import ArthurImage from '../../assets/Arthur.jpeg'; 
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import TypewriterChange from './TypewriterChange';
import ScrollReveal from '../ScrollReveal';

const Hero = () => {
  const { t } = useTranslation();
  const mailTo = 'arthurdesouzaalves06@gmail.com';

  const handleMailClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      window.location.href = `mailto:${mailTo}`;
    } catch (err) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mailTo);
        // fallback message (i18n optional)
        // eslint-disable-next-line no-alert
        alert(t('contact.emailCopied') || 'E-mail copiado para a área de transferência');
      } else {
        // eslint-disable-next-line no-alert
        alert(mailTo);
      }
    }
  };

  return (
    <section className="home" id="home">
      <ScrollReveal className="home-img">
        <img src={ArthurImage} alt="Minha foto" />
      </ScrollReveal>
      <div className="home-content">
        <ScrollReveal delay={100}>
          <h1>{t('hero.hello')} <span>Arthur</span></h1>
        </ScrollReveal>
        <ScrollReveal delay={180}>
          <h3 className="typing-text">{t('hero.typing')} <span><TypewriterChange className="hero-typewriter"/></span></h3>
        </ScrollReveal>
        <ScrollReveal delay={260}>
          <p>
            {t('hero.paragraph')}
          </p>
        </ScrollReveal>
        <ScrollReveal delay={340}>
          <div className="social-icons">
            <a href="https://github.com/ArthurAlves06" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="social-btn">
              <span className="social-inner"><FaGithub size={20} /></span>
            </a>
            <a href="https://www.linkedin.com/in/arthur-de-souza-alves-449812306" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-btn">
              <span className="social-inner"><FaLinkedin size={20} /></span>
            </a>
            <a href="mailto:arthurdesouzaalves06@gmail.com" aria-label="Email" className="social-btn" onClick={handleMailClick}>
              <span className="social-inner"><FiMail size={20} /></span>
            </a>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={420}>
          <a href="#contact" className="btn">{t('hero.contact')}</a>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Hero;