import React from 'react';
import './ProjectsStyle.css';
import { useTranslation } from 'react-i18next';
import { FiExternalLink, FiGithub } from 'react-icons/fi';
import XadrezImage from '../../assets/Xadrez.jpeg';
import JogoDaVelhaImage from '../../assets/jogo da velha.png';

const projectsData = [
  {
    id: 1,
    title: 'Aplicativo de Viagem',
    category: 'React + CSS',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80&auto=format&fit=crop',
    languages: ['React', 'CSS'],
    liveUrl: 'https://example.com/travel-app',
    repoUrl: 'https://github.com/The-Wavem/cheila_lamaour'
  },
  {
    id: 2,
    title: 'Xadrez em C',
    category: 'Jogo',
    image: XadrezImage,
    languages: ['C'],
    liveUrl: null,
    repoUrl: 'https://github.com/ArthurAlves06/Xadrez'
  },
  {
    id: 3,
    title: 'Exploração Urbana',
    category: 'React + Vite',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80&auto=format&fit=crop',
    languages: ['React', 'Vite'],
    liveUrl: 'https://example.com/urban',
    repoUrl: 'https://github.com/example/urban-explore'
  },
  {
    id: 4,
    title: 'Jogo da Velha em C',
    category: 'Lógica e prática',
    image: JogoDaVelhaImage,
    languages: ['C'],
    liveUrl: null,
    repoUrl: 'https://github.com/ArthurAlves06/Jogo-da-velha'
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
