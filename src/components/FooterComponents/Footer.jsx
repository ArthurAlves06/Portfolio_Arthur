import React from 'react';
import './FooterStyle.css';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const copyright = t('footer.copyright', {
    defaultValue: 'Copyright © 2026 por Arthur | Todos os direitos reservados.',
  });

  return (
    <footer className="footer">
      <div className="footer-text">
        <p>{copyright}</p>
      </div>
      <div className="footer-iconTop">
        <a href="#home" aria-label="Voltar ao topo">
          <i className="fa-solid fa-arrow-up"></i>
        </a>
      </div>
    </footer>
  );
};

export default Footer;