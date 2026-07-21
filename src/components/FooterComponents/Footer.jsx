import React from 'react';
import './FooterStyle.css';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language && i18n.language.startsWith('en');

  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          Copyright © 2025 {isEn ? 'by' : 'por'} <span className="footer-name">Arthur</span> | {isEn ? 'All Rights Reserved.' : 'Todos os direitos reservados.'}
        </p>
        <div className="footer-iconTop">
          <a href="#home" aria-label="Voltar ao topo">
            <i className="fa-solid fa-arrow-up"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;