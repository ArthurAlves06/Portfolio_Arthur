import React from 'react';
import './FooterStyle.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-text">
        <p>Copyright &copy; 2025 by Arthur | All Rights Reserved.</p>
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