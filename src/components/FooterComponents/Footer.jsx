import React from 'react';
import './FooterStyle.css';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="footer-text">
        <p>{t('footer.copyright')}</p>
      </div>
      <div className="footer-iconTop">
        <a href="#home">
          <i className="fa-solid fa-arrow-up"></i>
        </a>
      </div>
    </footer>
  );
};

export default Footer;