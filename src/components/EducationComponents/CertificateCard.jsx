import React, { useState } from 'react';
import './CertificateCard.css';

const CertificateCard = ({ title, issuer, date, skills = [], certificateImage, link }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const toggle = (e) => {
    // evitar scroll ao pressionar Space
    if (e?.type === 'keydown' && e.code === 'Space') e.preventDefault();
    setIsFlipped(prev => !prev);
  };

  return (
    <div className="certificate-wrapper">
      <div
        className={`certificate-card ${isFlipped ? 'flipped' : ''}`}
        onClick={toggle}
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.code === 'Space') toggle(e); }}
      >
        <div className="certificate-front">
          <div className="certificate-image">
            {certificateImage ? (
              <img src={certificateImage} alt={title} />
            ) : (
              <div className="certificate-placeholder">
                <span className="issuer-logo">{issuer ? issuer.charAt(0) : '?'}</span>
              </div>
            )}
          </div>

          <div className="certificate-info">
            <h3>{title}</h3>
            <p className="issuer">{issuer}</p>
            <p className="date">{date}</p>
            <p className="tap-hint">Clique para ver o conteúdo</p>
          </div>
        </div>

        <div className="certificate-back">
          <h3>O que aprendi</h3>
          <ul className="skills-list">
            {skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="certificate-link">
              Ver Certificado
            </a>
          )}
          <p className="tap-hint">Clique para voltar</p>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;
