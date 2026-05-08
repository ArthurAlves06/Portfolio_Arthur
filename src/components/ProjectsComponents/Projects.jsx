import React, { useEffect, useMemo, useState } from 'react';
import './ProjectsStyle.css';
import { useTranslation } from 'react-i18next';
import { FiExternalLink, FiGithub } from 'react-icons/fi';
import { trackEvent } from '../../utils/analytics';
import adminData from '../../utils/adminData';
import { clonePortfolioProjects, normalizeProjectRecord } from '../../data/portfolioContent';
import ScrollReveal from '../ScrollReveal';

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

const getLocalizedValue = (value, language, fallback = '') => {
  if (value && typeof value === 'object') {
    return value[language] || value.pt || value.en || fallback;
  }
  return hasText(value) ? value : fallback;
};

const migrateLocalizedField = (storedValue, fallbackValue) => {
  if (storedValue && typeof storedValue === 'object') return storedValue;
  if (hasText(storedValue) && fallbackValue && typeof fallbackValue === 'object') {
    return {
      pt: storedValue,
      en: fallbackValue.en || fallbackValue.pt || storedValue,
    };
  }
  return storedValue ?? fallbackValue;
};

const normalizeProject = (project, fallback) => ({
  ...normalizeProjectRecord(project, fallback),
});

export default function Projects() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState(() => clonePortfolioProjects());

  const normalizedDefaults = useMemo(() => clonePortfolioProjects(), []);

  useEffect(() => {
    const stored = adminData.getStoredProjects();
    if (Array.isArray(stored) && stored.length > 0) {
      const mergedDefaults = normalizedDefaults.map((fallback) => {
        const fallbackTitles = [];
        if (fallback?.title) {
          if (typeof fallback.title === 'object') {
            fallbackTitles.push(fallback.title.pt, fallback.title.en);
          } else {
            fallbackTitles.push(fallback.title);
          }
        }

        const match = stored.find((project) => {
          if (!project) return false;
          if (String(project?.id) === String(fallback.id)) return true;
          const projectTitle = project.title;
          if (typeof projectTitle === 'string' && fallbackTitles.includes(projectTitle)) return true;
          if (projectTitle && typeof projectTitle === 'object') {
            return fallbackTitles.includes(projectTitle.pt) || fallbackTitles.includes(projectTitle.en);
          }
          return false;
        });

        const merged = normalizeProject(match || {}, fallback || {});

        // Preserve admin-edited Portuguese text, but add EN from the localized defaults.
        merged.title = migrateLocalizedField(match?.title, fallback?.title) || merged.title;
        merged.description = migrateLocalizedField(match?.description, fallback?.description) || merged.description;
        merged.category = migrateLocalizedField(match?.category, fallback?.category) || merged.category;
        merged.imageAlt = migrateLocalizedField(match?.imageAlt, fallback?.imageAlt) || merged.imageAlt;
        return merged;
      });
      setItems(mergedDefaults);
      return;
    }
    setItems(normalizedDefaults);
  }, [normalizedDefaults]);

  return (
    <section id="projects" className="projects-section">
      <div className="projects-inner">
        <ScrollReveal>
          <h2 className="projects-heading">{t('projects.heading')}</h2>
        </ScrollReveal>

        <div className="projects-grid">
          {items.map((p, idx) => (
            <ScrollReveal key={p.id} delay={idx * 110}>
              <article className={`project-card card-${idx + 1}`}>
                <div
                  className="project-media"
                    style={{ backgroundImage: `url(${p.image})` }}
                  aria-hidden="true"
                />

                <div className="project-overlay">
                  <div className="project-badge">{t('projects.heading')} {String(idx + 1).padStart(2, '0')}</div>
                  <div className="project-category">{getLocalizedValue(p.category, i18n.language)}</div>
                  <h3 className="project-title">{getLocalizedValue(p.title, i18n.language)}</h3>
                  <p className="project-summary">{getLocalizedValue(p.description, i18n.language)}</p>
                </div>

                <div className="project-hover" aria-hidden>
                  <div className="hover-inner">
                    {p.tools ? (
                      <div className="tools-list">
                        {p.tools.map((t, i) => {
                          // support both string names and { name, Icon } objects
                          const name = typeof t === 'string' ? t : (t.name || '');
                          const Icon = typeof t === 'object' && t.Icon ? t.Icon : null;
                          return (
                            <span key={i} className="tool-item">
                              {Icon ? <Icon className="tool-icon" /> : null} {name}
                            </span>
                          );
                        })}
                      </div>
                    ) : null}

                    <div className="hover-actions">
                      {p.liveUrl ? (
                        <a
                          className="btn btn-live"
                          href={p.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${p.title} live`}
                          onClick={() => trackEvent('project_click', { projectTitle: p.title, projectCategory: p.category, action: 'live' })}
                        >
                          <FiExternalLink /> {t('projects.viewLive')}
                        </a>
                      ) : null}

                      {p.repoUrl ? (
                        <a
                          className="btn btn-code"
                          href={p.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${p.title} repository`}
                          onClick={() => trackEvent('project_click', { projectTitle: p.title, projectCategory: p.category, action: 'repository' })}
                        >
                          <FiGithub /> {t('projects.viewCode')}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
