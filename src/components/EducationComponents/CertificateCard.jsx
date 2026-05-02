import React, { useState } from 'react';
import './CertificateCard.css';
import { useTranslation } from 'react-i18next';
import { PiMedalBold } from 'react-icons/pi';
import { AiOutlinePython } from 'react-icons/ai';
import { LuBrainCircuit } from 'react-icons/lu';
import { TbWorld, TbCloudLock } from 'react-icons/tb';

const CertificateCard = ({ title, issuer, date, skills = [], certificateImage, link, disableFlip = false, isActive = true, onNavigate = null, onTrackClick = null }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const { t } = useTranslation();

  const maxVisible = 4;
  const visibleSkills = skills.slice(0, maxVisible);
  const extraSkills = skills.slice(maxVisible);
  const extraCount = extraSkills.length;

  const toggle = (e) => {
    if (disableFlip) return;

    // track only when flipping to reveal the certificate (not when unflipping)
    if (!isFlipped && isActive && typeof onTrackClick === 'function') {
      onTrackClick({
        title,
        issuer,
        date,
        isActive,
        action: 'flip',
      });
    }

    // if this card isn't the active/centered slide, navigate to it instead of flipping
    try {
      if (!isActive) {
        if (typeof onNavigate === 'function') onNavigate();
        return;
      }
    } catch {}
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

  const toggleSkills = (e) => {
    e.stopPropagation();
    setShowAllSkills(prev => !prev);
  };

  return (
    <div className="certificate-wrapper">
      <div
        className={`certificate-card ${disableFlip ? 'no-flip' : ''} ${isFlipped ? 'flipped' : ''}`}
        onClick={disableFlip ? undefined : toggle}
        role={disableFlip ? undefined : 'button'}
        tabIndex={disableFlip ? -1 : 0}
        aria-pressed={disableFlip ? undefined : isFlipped}
        onKeyDown={disableFlip ? undefined : (e) => { if (e.key === 'Enter' || e.code === 'Space') toggle(e); }}
      >
        <div className="certificate-front">
          <div className="certificate-header">
            <div className="cert-icon" aria-hidden>
              <PiMedalBold size={20} />
            </div>
            <div className="cert-date">{date}</div>
          </div>
          <div className="certificate-image">
            {certificateImage ? (
                <img src={certificateImage} alt={title} />
              ) : (
                <div className="certificate-placeholder">
                  {(() => {
                    const key = title ? title.toLowerCase() : '';
                    let iconClass = '';
                    if (key.includes('python')) iconClass = 'icon-python';
                    else if (key.includes('pentest') || key.includes('vulner') || key.includes('vuln')) iconClass = 'icon-pentest';
                    else if (key.includes('http')) iconClass = 'icon-http';
                    else if (key.includes('pensamento') || key.includes('comput')) iconClass = 'icon-computational';
                    else iconClass = 'icon-default';

                    return (
                      <span className={`issuer-logo ${iconClass}`}>
                        {key.includes('python') ? (
                          <AiOutlinePython size={36} />
                        ) : (key.includes('pentest') || key.includes('vulner') || key.includes('vuln')) ? (
                          <TbCloudLock size={36} />
                        ) : key.includes('http') ? (
                          <TbWorld size={36} />
                        ) : (key.includes('pensamento') || key.includes('comput')) ? (
                          <LuBrainCircuit size={36} />
                        ) : (
                          <PiMedalBold size={36} />
                        )}
                      </span>
                    );
                  })()}
                </div>
              )}
          </div>

          <div className="certificate-info">
            <h3>{title}</h3>
            <p className="issuer">{issuer}</p>
            <p className="tap-hint">{t('certificate.tapHintFront')}</p>
          </div>
        </div>

        {!disableFlip && (
          <div className="certificate-back">
          <h3>{t('certificate.learned')}</h3>
          {link && (
            <div className="back-actions">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="certificate-link"
                onClick={(e) => { e.stopPropagation(); }}
                onKeyDown={(e) => { e.stopPropagation(); }}
              >
                {t('certificate.viewCertificate')}
              </a>
            </div>
          )}
          <ul className="skills-list">
            {visibleSkills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
            {showAllSkills && extraSkills.map((skill, index) => (
              <li key={`extra-${index}`}>{skill}</li>
            ))}
          </ul>
          {extraCount > 0 && (
            <button
              type="button"
              className="more-skills"
              onClick={toggleSkills}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSkills(e); }}
            >
              {showAllSkills ? t('certificate.showLess') : t('certificate.more', { count: extraCount })}
            </button>
          )}
          <p className="tap-hint">{t('certificate.tapHintBack')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateCard;
