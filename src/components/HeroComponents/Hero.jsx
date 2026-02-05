import React from 'react';
import './HeroStyle.css';
import ArthurImage from '../../assets/Arthur.jpg'; 
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="home" id="home">
      <div className="home-img">
        <img src={ArthurImage} alt="Foto de Arthur" />
      </div>
      <div className="home-content">
        <h1>{t('hero.hello')} <span>Arthur</span></h1>
        <h3 className="typing-text">{t('hero.typing')} <span></span></h3>
        <p>
          {t('hero.paragraph')}
        </p>
        <div className="social-icons">
          <a href="https://github.com/ArthurAlves06" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="social-btn">
            <FaGithub size={20} />
          </a>
          <a href="https://www.linkedin.com/in/arthur-de-souza-alves-449812306" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-btn">
            <FaLinkedin size={20} />
          </a>
          <a href="mailto:arthurdesouzaalves06@gmail.com" aria-label="Email" className="social-btn">
            <FiMail size={20} />
          </a>
        </div>
        <a href="#" className="btn">{t('hero.hire')}</a>
      </div>
    </section>
  );
};

export default Hero;