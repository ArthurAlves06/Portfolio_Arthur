import React, { useState } from 'react';
import './CertificateCard.css';
import { useTranslation } from 'react-i18next';

const CertificateCard = ({ title, issuer, date, skills = [], certificateImage, link }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { t } = useTranslation();

  const maxVisible = 4;
  const visibleSkills = skills.slice(0, maxVisible);
  const extraCount = skills.length > maxVisible ? skills.length - maxVisible : 0;

  const toggle = (e) => {
    // evitar scroll ao pressionar Space
    if (e?.type === 'keydown' && e.code === 'Space') e.preventDefault();

    // if the parent carousel was just used for dragging, ignore click
    try {
      const vp = e?.currentTarget?.closest?.('.carousel-viewport');
      if (vp && vp.dataset.dragging === 'true') {
        // ignore this click which resulted from a drag
        return;
      }
    } catch {}

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
            <p className="tap-hint">{t('certificate.tapHintFront')}</p>
          </div>
        </div>

        <div className="certificate-back">
          <h3>{t('certificate.learned')}</h3>
          <ul className="skills-list">
            {visibleSkills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
            {extraCount > 0 && (
              <li className="more-skills">+{extraCount} mais</li>
            )}
          </ul>
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="certificate-link">
              {t('certificate.viewCertificate')}
            </a>
          )}
          <p className="tap-hint">{t('certificate.tapHintBack')}</p>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;
