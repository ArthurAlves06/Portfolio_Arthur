import React, { useEffect, useState } from 'react';
import './ProjectsStyle.css';
import { useTranslation } from 'react-i18next';
import { FiExternalLink, FiGithub } from 'react-icons/fi';
import { FaReact, FaTools } from 'react-icons/fa';
import { SiFirebase, SiHtml5 } from 'react-icons/si';
import { BiCode } from 'react-icons/bi';
import XadrezImage from '../../assets/Xadrez.jpeg';
import JogoDaVelhaImage from '../../assets/jogo da velha.png';
import cheilaAdm from '../../assets/cheilaAdm.png';
import { trackEvent } from '../../utils/analytics';
import adminData from '../../utils/adminData';


const projectsData = [
  {
    id: 1,
    title: 'Newsletter & Mentoria',
    category: 'React + Firebase + material UI',
    image: cheilaAdm,
    description: 'Site com blog e sistema de mentoria, painel administrativo e integração com Firebase.',
    liveUrl: 'https://cheila-lamour.web.app',
    repoUrl: 'https://github.com/The-Wavem/cheila_lamaour'
  },
  {
    id: 2,
    title: 'Xadrez em C',
    category: 'Jogo',
    image: XadrezImage,
    description: 'Implementação do jogo de xadrez em C com regras básicas e interação por terminal.',
    liveUrl: null,
    repoUrl: 'https://github.com/ArthurAlves06/Xadrez'
  },

  {
    id: 4,
    title: 'Jogo da Velha em C',
    category: 'Jogo',
    image: JogoDaVelhaImage,
    description: 'Jogo da velha em C focado em lógica de jogo e experiência no terminal.',
    liveUrl: null,
    repoUrl: 'https://github.com/ArthurAlves06/Jogo-da-velha'
  }
];

// Map tools per project (keeps data small and allows icon components)
projectsData[0].tools = [
  { name: 'React', Icon: FaReact },
  { name: 'Firebase', Icon: SiFirebase },
  { name: 'Material UI', Icon: FaTools },
  { name: 'HTML', Icon: SiHtml5 }
];
projectsData[1].tools = [
  { name: 'C', Icon: BiCode }
];
projectsData[2].tools = [
  { name: 'C', Icon: BiCode }
];

export default function Projects() {
  const { t } = useTranslation();
  const [items, setItems] = useState(projectsData);

  useEffect(() => {
    const stored = adminData.getStoredProjects();
    if (Array.isArray(stored) && stored.length > 0) {
      setItems(stored);
    }
  }, []);

  return (
    <section id="projects" className="projects-section">
      <div className="projects-inner">
        <h2 className="projects-heading">{t('projects.heading')}</h2>

        <div className="projects-grid">
          {items.map((p, idx) => (
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
                  {/* languages removed: use icons/text in tools-list instead */}

                  {p.description ? (
                    <p className="project-desc">{p.description}</p>
                  ) : null}

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
          ))}
        </div>
      </div>
    </section>
  );
}
