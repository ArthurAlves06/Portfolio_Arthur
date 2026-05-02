import React, { useEffect, useRef, useState } from 'react';
import './EducationStyle.css';
// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import CertificateCard from './CertificateCard';
import adminData from '../../utils/adminData';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../../utils/analytics';

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
  const swiperRef = useRef(null);
  const trackStateRef = useRef({ down: false, startX: 0, scrollLeft: 0 });
  const suppressAutoCenterRef = useRef(false);
  const suppressTimerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 700);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const dragResetTimerRef = useRef(null);
  // toggle automatic centering behavior
  const AUTO_CENTER = false; // set to true to re-enable auto-centering
  const i18nCerts = t('education.certificates', { returnObjects: true }) || [];
  const certificates = (adminData.getStoredCertificates() || []).length > 0 ? adminData.getStoredCertificates() : i18nCerts;
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
    };
  }, []);

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
            onClick={() => swiperRef.current && swiperRef.current.slidePrev()}
            aria-label="Scroll left"
          ><span className="icon"><FaChevronLeft /></span></button>

          <div
            className="carousel-viewport"
            ref={trackRef}
            data-dragging={isDragging ? 'true' : 'false'}
            onPointerDown={(e) => {
              touchStartRef.current = { x: e.clientX, y: e.clientY };
              setIsDragging(false);
              if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
            }}
            onPointerMove={(e) => {
              const startX = touchStartRef.current.x || 0;
              const startY = touchStartRef.current.y || 0;
              const moved = Math.max(Math.abs(e.clientX - startX), Math.abs(e.clientY - startY));
              if (moved > 8) setIsDragging(true);
            }}
            onPointerUp={() => {
              if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
              dragResetTimerRef.current = setTimeout(() => setIsDragging(false), 180);
            }}
            onPointerCancel={() => {
              if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
              dragResetTimerRef.current = setTimeout(() => setIsDragging(false), 180);
            }}
            onPointerLeave={() => {
              /* when pointer leaves, ensure dragging resets shortly after */
              if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
              dragResetTimerRef.current = setTimeout(() => setIsDragging(false), 180);
            }}
          >
            <Swiper
              onSwiper={(s) => { swiperRef.current = s; }}
              key={isMobile ? 'swiper-mobile' : 'swiper-desktop'}
              effect="coverflow"
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              spaceBetween={isMobile ? 16 : 0}
              coverflowEffect={{
                rotate: isMobile ? 36 : 22,
                stretch: isMobile ? 0 : -50,
                depth: isMobile ? 80 : 60,
                modifier: 1,
                slideShadows: true,
              }}
              pagination={true}
              modules={[EffectCoverflow, Pagination]}
              className="mySwiper"
              onTouchStart={(swiper) => {
                const touch = swiper.touches?.current || swiper.touches?.startX ? { x: swiper.touches.startX, y: swiper.touches.startY } : null;
                if (touch) {
                  touchStartRef.current = touch;
                }
                setIsDragging(false);
                if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
              }}
              onTouchMove={(swiper) => {
                const startX = touchStartRef.current.x;
                const startY = touchStartRef.current.y;
                const currentX = swiper.touches?.currentX ?? swiper.touches?.current?.x ?? 0;
                const currentY = swiper.touches?.currentY ?? swiper.touches?.current?.y ?? 0;
                const moved = Math.max(Math.abs(currentX - startX), Math.abs(currentY - startY));
                if (moved > 8) setIsDragging(true);
              }}
              onTouchEnd={() => {
                if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
                dragResetTimerRef.current = setTimeout(() => setIsDragging(false), 180);
              }}
              onSlideChange={(swiper) => {
                setCurrentIdx(swiper.realIndex);
                setIsDragging(false);
              }}
            >
              {certificates.map((cert, idx) => (
                <SwiperSlide key={idx} style={{ width: isMobile ? 'auto' : '250px' }}>
                  <CertificateCard
                    {...cert}
                    isActive={currentIdx === idx}
                    onNavigate={() => {
                      try {
                        trackEvent('certificate_click', {
                          certificateTitle: cert.title,
                          issuer: cert.issuer,
                          action: 'navigate',
                        });
                        suppressAutoCenterRef.current = true;
                        if (swiperRef.current && typeof swiperRef.current.slideTo === 'function') {
                          swiperRef.current.slideTo(idx);
                        }
                        setCurrentIdx(idx);
                        if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
                        suppressTimerRef.current = setTimeout(() => { suppressAutoCenterRef.current = false; }, 600);
                      } catch {}
                    }}
                    onTrackClick={(details) => {
                      trackEvent('certificate_click', {
                        certificateTitle: details.title,
                        issuer: details.issuer,
                        action: details.action,
                      });
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <button
            className="carousel-btn right"
            onClick={() => swiperRef.current && swiperRef.current.slideNext()}
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
