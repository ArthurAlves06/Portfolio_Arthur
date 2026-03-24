import React, { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import './EducationStyle.css';
import CertificateCard from './CertificateCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const EducationItem = ({ date, title, institution, description }) => (
  <div className="education-item">
    <span className="date">
      <i className="fa-solid fa-calendar-days"></i> {date}
    </span>
    <h3>{title}</h3>
    <h4>{institution}</h4>
    <p>{description}</p>
  </div>
);

const Education = () => {
  const { t } = useTranslation();
  const trackRef = useRef(null);
  const trackStateRef = useRef({ down: false, startX: 0, scrollLeft: 0 });
  const suppressAutoCenterRef = useRef(false);
  const suppressTimerRef = useRef(null);
  // toggle automatic centering behavior
  const AUTO_CENTER = false; // set to true to re-enable auto-centering
  const certificates = t('education.certificates', { returnObjects: true }) || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  // function to center the card nearest the viewport center
  const centerNearest = () => {
    // don't auto-center while navigation explicitly requested
    if (suppressAutoCenterRef.current) return;

    const el = trackRef.current;
    if (!el) return;
    const track = el.querySelector('.carousel-track');
    if (!track) return;
    const children = Array.from(track.children);
    if (children.length === 0) return;

    const viewportCenter = el.scrollLeft + el.clientWidth / 2;
    let nearest = children[0];
    let minDist = Infinity;
    children.forEach((c) => {
      const cCenter = c.offsetLeft + c.offsetWidth / 2;
      const dist = Math.abs(cCenter - viewportCenter);
      if (dist < minDist) {
        minDist = dist;
        nearest = c;
      }
    });

    // calculate scrollLeft to center the nearest card inside the viewport
    try {
      const targetLeft = Math.max(0, nearest.offsetLeft + nearest.offsetWidth / 2 - el.clientWidth / 2);
      el.scrollTo({ left: targetLeft, behavior: 'smooth' });
    } catch {}
  };

  // ensure there's enough side padding on the track so first/last cards can be centered
  const adjustTrackPadding = () => {
    const el = trackRef.current;
    if (!el) return;
    const track = el.querySelector('.carousel-track');
    if (!track) return;
    const children = Array.from(track.children);
    if (children.length === 0) return;
    // compute average card width (more robust if cards vary slightly)
    const totalWidth = children.reduce((sum, c) => sum + c.offsetWidth, 0);
    const avgCard = Math.round(totalWidth / children.length);
    const viewportWidth = el.clientWidth;
    const basePad = Math.max(0, Math.round((viewportWidth - avgCard) / 2));
    const extra = 16; // extra visual margin so card edges don't touch viewport
    track.style.paddingLeft = basePad + extra + 'px';
    track.style.paddingRight = basePad + extra + 'px';
  };

  // recentraliza o carousel em resize e ao montar
  useEffect(() => {
    let rafId = null;
    const handler = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
          adjustTrackPadding();
          if (AUTO_CENTER && !suppressAutoCenterRef.current) centerNearest();
        });
    };

    window.addEventListener('resize', handler);
    // also adjust on mount
    handler();
    return () => {
      window.removeEventListener('resize', handler);
      if (rafId) cancelAnimationFrame(rafId);
      if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
    };
  }, []);

  return (
    <section className="education" id="education">
      <h2 className="heading">
        {t('education.heading').split(' ')[0]} <span>{t('education.heading').split(' ').slice(1).join(' ')}</span>
      </h2>

      <div className="education-row">
        <div className="education-column">
          <h3 className="title">{t('education.title')}</h3>

          <div className="education-box">
            {(
              t('education.items', { returnObjects: true }) || []
            ).map((it, idx) => (
              <EducationItem
                key={idx}
                date={it.date}
                title={it.title}
                institution={it.institution}
                description={it.description}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Nova Seção de Certificados */}
      <div className="certificates-section">
        <h3 className="certificates-title">{t('education.certificatesTitle')}</h3>

        {/* Carousel */}
        <div className="certificates-carousel">
          <button
            className="carousel-btn left"
            onClick={() => {
              // suppress auto-centering briefly so the click-driven scroll finishes
              suppressAutoCenterRef.current = true;
              if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
              suppressTimerRef.current = setTimeout(() => { suppressAutoCenterRef.current = false; suppressTimerRef.current = null; }, 600);

              const el = trackRef.current; if (!el) return;
              // scroll to previous card
              const track = el.querySelector('.carousel-track'); if (!track) return;
              const children = Array.from(track.children); if (children.length === 0) return;
              // find currently centered
              const viewportCenter = el.scrollLeft + el.clientWidth / 2;
              let nearestIdx = 0; let minDist = Infinity;
              children.forEach((c, i) => {
                const cCenter = c.offsetLeft + c.offsetWidth / 2;
                const dist = Math.abs(cCenter - viewportCenter);
                if (dist < minDist) { minDist = dist; nearestIdx = i; }
              });
              const targetIdx = Math.max(0, nearestIdx - 1);
              const target = children[targetIdx];
              if (target) {
                const left = Math.max(0, target.offsetLeft + target.offsetWidth/2 - el.clientWidth/2);
                el.scrollTo({ left, behavior: 'smooth' });
                setCurrentIdx(targetIdx);
              }
            }}
            aria-label="Scroll left"
          ><span className="icon"><FaChevronLeft /></span></button>

          <div
            className="carousel-viewport"
            ref={trackRef}
            onPointerDown={(e) => {
              const el = trackRef.current; if (!el) return;
              trackStateRef.current.down = true;
              trackStateRef.current.startX = e.clientX;
              trackStateRef.current.scrollLeft = el.scrollLeft;
              trackStateRef.current.moved = false;
            }}
            onPointerMove={(e) => {
              const el = trackRef.current; if (!el || !trackStateRef.current.down) return;
              const dx = e.clientX - trackStateRef.current.startX;
              // small threshold so clicks are not mistaken for drag
              if (!trackStateRef.current.moved && Math.abs(dx) < 6) return;
              trackStateRef.current.moved = true;
              el.dataset.dragging = 'true';
              el.scrollLeft = trackStateRef.current.scrollLeft - dx;
            }}
            onPointerUp={(e) => {
              const el = trackRef.current; if (!el) return;
              // remove dragging flag shortly after release so click handlers can detect it
              setTimeout(() => { el.dataset.dragging = 'false'; }, 50);
              trackStateRef.current.down = false;
              // recentraliza após o usuário soltar o drag
              if (AUTO_CENTER) setTimeout(() => centerNearest(), 80);
            }}
            onPointerLeave={(e) => {
              const el = trackRef.current; if (el) el.dataset.dragging = 'false';
              trackStateRef.current.down = false;
            }}
            onScroll={() => {
              // debounce scroll end to compute nearest index and update progress
              if (trackRef.current) {
                if (trackRef.current._scrollTimeout) clearTimeout(trackRef.current._scrollTimeout);
                trackRef.current._scrollTimeout = setTimeout(() => {
                  try {
                    const el = trackRef.current;
                    const track = el.querySelector('.carousel-track');
                    const children = Array.from(track.children);
                    if (children.length) {
                      const viewportCenter = el.scrollLeft + el.clientWidth / 2;
                      let nearestIdx = 0; let minDist = Infinity;
                      children.forEach((c, i) => {
                        const cCenter = c.offsetLeft + c.offsetWidth / 2;
                        const dist = Math.abs(cCenter - viewportCenter);
                        if (dist < minDist) { minDist = dist; nearestIdx = i; }
                      });
                      setCurrentIdx(nearestIdx);
                    }
                  } catch {}
                  if (AUTO_CENTER) centerNearest();
                }, 220);
              }
            }}
          
          >
            <div className="carousel-track">
              {certificates.map((cert, idx) => (
                <CertificateCard key={idx} {...cert} />
              ))}
            </div>
          </div>

          <button
            className="carousel-btn right"
            onClick={() => {
              // suppress auto-centering briefly so the click-driven scroll finishes
              suppressAutoCenterRef.current = true;
              if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
              suppressTimerRef.current = setTimeout(() => { suppressAutoCenterRef.current = false; suppressTimerRef.current = null; }, 600);

              const el = trackRef.current; if (!el) return;
              // scroll to next card
              const track = el.querySelector('.carousel-track'); if (!track) return;
              const children = Array.from(track.children); if (children.length === 0) return;
              const viewportCenter = el.scrollLeft + el.clientWidth / 2;
              let nearestIdx = 0; let minDist = Infinity;
              children.forEach((c, i) => {
                const cCenter = c.offsetLeft + c.offsetWidth / 2;
                const dist = Math.abs(cCenter - viewportCenter);
                if (dist < minDist) { minDist = dist; nearestIdx = i; }
              });
              const targetIdx = Math.min(children.length - 1, nearestIdx + 1);
              const target = children[targetIdx];
              if (target) {
                const left = Math.max(0, target.offsetLeft + target.offsetWidth/2 - el.clientWidth/2);
                el.scrollTo({ left, behavior: 'smooth' });
                setCurrentIdx(targetIdx);
              }
            }}
            aria-label="Scroll right"
          ><span className="icon"><FaChevronRight /></span></button>
        </div>
        {/* progress indicator */}
        <div className="cert-progress">
          <span className="count left">{String(currentIdx + 1).padStart(2, '0')}</span>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${((currentIdx + 1) / Math.max(1, certificates.length)) * 100}%` }} />
          </div>
          <span className="count right">{String(certificates.length).padStart(2, '0')}</span>
        </div>
      </div>
    </section>
  );
};

export default Education;
