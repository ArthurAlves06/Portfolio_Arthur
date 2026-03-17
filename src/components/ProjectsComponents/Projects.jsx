import React from 'react';
import './ProjectsStyle.css';
import { useTranslation } from 'react-i18next';
import { FiExternalLink, FiGithub } from 'react-icons/fi';

const projectsData = [
  {
    id: 1,
    title: '5 Inspiring Apps for Your Next Trip',
    category: 'Travel',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80&auto=format&fit=crop',
    languages: ['React', 'CSS'],
    liveUrl: 'https://example.com/travel-app',
    repoUrl: 'https://github.com/example/travel-app'
  },
  {
    id: 2,
    title: 'Contemplate the Meaning of Life Twice a Day',
    category: 'How to',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1600&q=80&auto=format&fit=crop',
    languages: ['Next.js', 'TypeScript'],
    liveUrl: null,
    repoUrl: 'https://github.com/example/meaning-app'
  },
  {
    id: 3,
    title: 'Urban Exploration Apps',
    category: 'Steps',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80&auto=format&fit=crop',
    languages: ['React', 'Vite'],
    liveUrl: 'https://example.com/urban',
    repoUrl: 'https://github.com/example/urban-explore'
  },
  {
    id: 4,
    title: 'Take Control of Your Hat Life',
    category: 'Hats',
    image: 'https://images.unsplash.com/photo-1520975910013-2a0b2f3b3cbb?w=1600&q=80&auto=format&fit=crop',
    languages: ['JavaScript', 'HTML', 'CSS'],
    liveUrl: null,
    repoUrl: 'https://github.com/example/hat-life'
  }
];

export default function Projects() {
  const { t } = useTranslation();

  return (
    <section id="projects" className="projects-section">
      <div className="projects-inner">
        <h2 className="projects-heading">{t('projects.heading')}</h2>

        <div className="projects-grid">
          {projectsData.map((p, idx) => (
            <article key={p.id} className={`project-card card-${idx + 1}`}>
              <div
                className="project-media"
                style={{ backgroundImage: `url(${p.image})` }}
                aria-hidden="true"
              />

              <div className="project-overlay">
                <div className="project-category">{p.category}</div>
                <h3 className="project-title">{p.title}</h3>
              </div>

              <div className="project-hover" aria-hidden>
                <div className="hover-inner">
                  <div className="hover-langs">
                    {p.languages.map((ln, i) => (
                      <span key={i} className="lang-pill">{ln}</span>
                    ))}
                  </div>

                  <div className="hover-actions">
                    {p.liveUrl ? (
                      <a
                        className="btn btn-live"
                        href={p.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${p.title} live`}
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
                      >
                        <FiGithub /> {t('projects.viewCode')}
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
