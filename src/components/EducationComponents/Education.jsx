import React, { useEffect, useRef, useState } from 'react';
import './EducationStyle.css';
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
import { clonePortfolioCertificates, normalizeCertificateRecord } from '../../data/portfolioContent';
import ScrollReveal from '../ScrollReveal';

const EducationItem = ({ date, title, institution, description }) => {
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
    <div
      className="education-item"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ '--mouse-x': '50%', '--mouse-y': '35%' }}
    >
      <span className="date">
        <i className="fa-solid fa-calendar-days"></i> {date}
      </span>
      <h3>{title}</h3>
      <h4>{institution}</h4>
      <p>{description}</p>
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
            <div className="education-box">
              {(t('education.items', { returnObjects: true }) || []).map((it, idx) => (
                <EducationItem
                  key={idx}
                  date={it.date}
                  title={it.title}
                  institution={it.institution}
                  description={it.description}
                />
              ))}
            </div>
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
