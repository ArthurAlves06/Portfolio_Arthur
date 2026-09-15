import React, { useEffect, useRef, useState } from 'react';
import './EducationStyle.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import CertificateCard from './CertificateCard';
import adminData from '../../utils/adminData';
import { FaChevronLeft, FaChevronRight, FaGraduationCap, FaLaptopCode } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../../utils/analytics';
import { clonePortfolioCertificates, normalizeCertificateRecord } from '../../data/portfolioContent';
import ScrollReveal from '../ScrollReveal';

const JourneyTimeline = ({ items }) => {
  const timelineRef = useRef(null);
  const [fillPercent, setFillPercent] = useState(0);

  useEffect(() => {
    let animId;
    const updateProgress = () => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || 800;

      // Generous trigger window: start as soon as it nears the lower viewport
      // and complete gracefully through the end of the section
      const triggerPoint = windowHeight * 0.78;
      const timelineTop = rect.top;
      const timelineHeight = rect.height || 600;

      if (timelineTop > triggerPoint) {
        setFillPercent(0);
      } else {
        const scrolled = triggerPoint - timelineTop;
        // Smooth linear progression spanning 95% of the extended timeline
        const pct = Math.min(Math.max((scrolled / (timelineHeight * 0.92)) * 100, 0), 100);
        setFillPercent(pct);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateProgress();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const handleMouseMove = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const mouseX = ((event.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((event.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty('--mouse-x', `${mouseX}%`);
    card.style.setProperty('--mouse-y', `${mouseY}%`);
  };

  const handleMouseLeave = (event) => {
    const card = event.currentTarget;
    card.style.setProperty('--mouse-x', '50%');
    card.style.setProperty('--mouse-y', '35%');
  };

  return (
    <div className="journey-timeline" ref={timelineRef}>
      <div className="timeline-track-line">
        <div className="timeline-line-bg" />
        <div className="timeline-line-fill" style={{ height: `${fillPercent}%` }}>
          <div className="timeline-line-glow" />
        </div>
      </div>

      <div className="timeline-steps">
        {items.map((it, idx) => {
          // Node 0 triggers around 15%, Node 1 triggers around 70%
          const triggerThreshold = idx === 0 ? 15 : 70;
          const isActive = fillPercent >= triggerThreshold;
          const Icon = idx === 0 ? FaGraduationCap : FaLaptopCode;

          return (
            <div
              key={idx}
              className={`timeline-step-item step-${idx + 1} ${isActive ? 'is-active' : ''}`}
            >
              <div className="timeline-node" aria-label={`Etapa ${idx + 1}`}>
                <div className="timeline-node-inner">
                  <Icon className="timeline-node-icon" />
                  <span className="timeline-node-num">{String(idx + 1).padStart(2, '0')}</span>
                </div>
                <div className="timeline-node-pulse" />
              </div>

              <div
                className="timeline-card"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ '--mouse-x': '50%', '--mouse-y': '35%' }}
              >
                <div className="timeline-card-header">
                  <span className="date">
                    <i className="fa-solid fa-calendar-days"></i> {it.date}
                  </span>
                  <span className="timeline-stage-tag">{idx === 0 ? 'Graduação' : 'Especialização'}</span>
                </div>
                <h3>{it.title}</h3>
                <h4>{it.institution}</h4>
                <p>{it.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Education = () => {
  const { t } = useTranslation();
  const trackRef = useRef(null);
  const swiperRef = useRef(null);
  const suppressAutoCenterRef = useRef(false);
  const suppressTimerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const dragResetTimerRef = useRef(null);

  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 700 : false));
  const [isDragging, setIsDragging] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const i18nCerts = t('education.certificates', { returnObjects: true }) || [];
  const defaultCertificates = clonePortfolioCertificates();
  const storedCertificates = adminData.getStoredCertificates() || [];
  const certificates = storedCertificates.length > 0
    ? storedCertificates.map((certificate) => normalizeCertificateRecord(certificate))
    : (i18nCerts.length > 0
      ? i18nCerts
      : defaultCertificates.map((certificate) => normalizeCertificateRecord(certificate)));

  const journeyItems = t('education.items', { returnObjects: true }) || [];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => () => {
    if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current);
    if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
  }, []);

  return (
    <section className="education" id="education">
      <ScrollReveal>
        <h2 className="heading">
          {t('education.heading').split(' ')[0]} <span>{t('education.heading').split(' ').slice(1).join(' ')}</span>
        </h2>
      </ScrollReveal>

      <div className="education-row">
        <div className="education-column">
          <ScrollReveal delay={80}>
            <h3 className="title">{t('education.title')}</h3>
          </ScrollReveal>

          <ScrollReveal delay={140}>
            <JourneyTimeline items={journeyItems} />
          </ScrollReveal>
        </div>
      </div>

      <div className="certificates-section">
        <ScrollReveal delay={120}>
          <h3 className="certificates-title">{t('education.certificatesTitle')}</h3>
        </ScrollReveal>

        <ScrollReveal delay={180}>
          <div className="certificates-carousel">
            <button
              className="carousel-btn left"
              onClick={() => swiperRef.current && swiperRef.current.slidePrev()}
              aria-label="Scroll left"
            >
              <span className="icon"><FaChevronLeft /></span>
            </button>

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
            >
              <span className="icon"><FaChevronRight /></span>
            </button>
          </div>
        </ScrollReveal>

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
