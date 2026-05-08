import React, { useEffect, useState } from 'react';
import './AdminDashboardStyle.css';
import adminData, { createProjectFirestore, updateProjectFirestore, deleteProjectFirestore, createCertificateFirestore, updateCertificateFirestore, deleteCertificateFirestore, subscribeFirestoreChanges, fetchFromFirestore } from '../../utils/adminData';
import { FiExternalLink, FiGithub, FiPlus, FiX, FiImage } from 'react-icons/fi';
import { clonePortfolioProjects, clonePortfolioCertificates, normalizeProjectRecord, normalizeCertificateRecord } from '../../data/portfolioContent';

const emptyProject = { id: null, title: '', category: '', image: '', description: '', liveUrl: '', repoUrl: '', tools: '' };
const emptyCert = { id: null, title: '', issuer: '', date: '', link: '', certificateImage: '', skills: '' };

export default function AdminContent() {
  const [projects, setProjects] = useState(() => {
    const stored = adminData.getStoredProjects();
    return stored.length > 0 ? stored : clonePortfolioProjects();
  });
  const [certs, setCerts] = useState(() => {
    const stored = adminData.getStoredCertificates();
    return stored.length > 0 ? stored : clonePortfolioCertificates();
  });
  const [projForm, setProjForm] = useState(emptyProject);
  const [certForm, setCertForm] = useState(emptyCert);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingCertId, setEditingCertId] = useState(null);

  useEffect(() => { adminData.saveStoredProjects(projects); }, [projects]);
  useEffect(() => { adminData.saveStoredCertificates(certs); }, [certs]);
  useEffect(() => {
    // if Firestore configured, subscribe to remote updates and bootstrap local data
    if (typeof window !== 'undefined') {
      try {
        fetchFromFirestore();
        const unsub = subscribeFirestoreChanges();
        return () => unsub();
      } catch {}
    }
  }, []);

  const saveProject = () => {
    const next = [...projects];
    const payload = {
      id: projForm.id || `${Date.now()}`,
      title: projForm.title,
      category: projForm.category,
      description: projForm.description,
      image: projForm.image,
      imageAlt: projForm.imageAlt || projForm.title,
      liveUrl: projForm.liveUrl,
      repoUrl: projForm.repoUrl,
      tools: (projForm.tools || '').split(',').map((s) => s.trim()).filter(Boolean),
      media: {
        src: projForm.image,
        alt: projForm.imageAlt || projForm.title,
      },
      links: {
        live: projForm.liveUrl,
        repo: projForm.repoUrl,
      },
    };
    const idx = next.findIndex((p) => p.id === payload.id);
    if (idx >= 0) next[idx] = payload; else next.unshift(payload);
    setProjects(next);
    setProjForm(emptyProject);
    // try persist to firestore when available
    try {
      if (payload.id && payload.id.toString().length > 8) {
        // if id looks like a timestamp local id, create a doc remotely
        void createProjectFirestore(payload);
      } else {
        void updateProjectFirestore(payload.id, payload);
      }
    } catch {}
    setIsProjectModalOpen(false);
  };

  const restoreDefaultProjects = () => {
    const defaultProjects = clonePortfolioProjects();
    setProjects(defaultProjects);
    adminData.saveStoredProjects(defaultProjects);
  };

  const restoreDefaultCertificates = () => {
    const defaultCertificates = clonePortfolioCertificates();
    setCerts(defaultCertificates);
    adminData.saveStoredCertificates(defaultCertificates);
  };

  const removeProject = (id) => setProjects((s) => s.filter((p) => p.id !== id));
  const removeProjectRemote = async (id) => {
    try { await deleteProjectFirestore(id); } catch {}
  };

  const openNewProjectModal = () => {
    setEditingProjectId(null);
    setProjForm(emptyProject);
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (project) => {
    const normalized = normalizeProjectRecord(project);
    setEditingProjectId(normalized.id);
    setProjForm({
      ...normalized,
      liveUrl: normalized.liveUrl,
      repoUrl: normalized.repoUrl,
      imageAlt: normalized.imageAlt || normalized.title,
      tools: Array.isArray(normalized.tools)
        ? normalized.tools.map((tool) => (typeof tool === 'string' ? tool : tool.name)).join(', ')
        : '',
    });
    setIsProjectModalOpen(true);
  };

  const saveCert = () => {
    const next = [...certs];
    const payload = {
      id: certForm.id || `${Date.now()}`,
      title: certForm.title,
      issuer: certForm.issuer,
      date: certForm.date,
      certificateImage: certForm.certificateImage,
      link: certForm.link,
      skills: (certForm.skills || '').split(',').map((s) => s.trim()).filter(Boolean),
      disableFlip: !!certForm.disableFlip,
      media: {
        image: certForm.certificateImage,
      },
      details: {
        link: certForm.link,
      },
    };
    const idx = next.findIndex((c) => c.id === payload.id);
    if (idx >= 0) next[idx] = payload; else next.unshift(payload);
    setCerts(next);
    setCertForm(emptyCert);
    setIsCertModalOpen(false);
    try {
      if (payload.id && payload.id.toString().length > 8) {
        void createCertificateFirestore(payload);
      } else {
        void updateCertificateFirestore(payload.id, payload);
      }
    } catch {}
  };

  const removeCert = (id) => setCerts((s) => s.filter((c) => c.id !== id));
  const removeCertRemote = async (id) => {
    try { await deleteCertificateFirestore(id); } catch {}
  };

  const openNewCertModal = () => {
    setEditingCertId(null);
    setCertForm(emptyCert);
    setIsCertModalOpen(true);
  };

  const openEditCertModal = (cert) => {
    const normalized = normalizeCertificateRecord(cert);
    setEditingCertId(normalized.id);
    setCertForm({
      ...normalized,
      certificateImage: normalized.certificateImage,
      link: normalized.link,
      skills: Array.isArray(normalized.skills) ? normalized.skills.join(', ') : '',
    });
    setIsCertModalOpen(true);
  };

  const projectCount = projects.length;
  const certCount = certs.length;

  const renderProjectCards = () => {
    if (!projectCount) {
      return (
        <div className="manage-empty-panel">
          <div>
            <div className="empty-illustration">◻</div>
            <strong>Nenhum projeto encontrado</strong>
            <p>Clique em "Novo Projeto" para começar.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="project-gallery">
        {projects.map((project) => (
          <article className="project-admin-card" key={project.id}>
            <div className="project-admin-media">
              {project.image ? <img src={project.image} alt={project.imageAlt || project.title} /> : <div className="image-placeholder"><FiImage /> Sem imagem</div>}
              <span className="project-admin-badge">{project.category || 'Projeto'}</span>
            </div>
            <div className="project-admin-body">
              <div className="project-admin-topline">
                <div>
                  <h4>{project.title}</h4>
                  <p>{project.description}</p>
                </div>
              </div>

              <div className="project-admin-tags">
                {(Array.isArray(project.tools) ? project.tools : []).map((tool) => (
                  <span className="tag-pill" key={`${project.id}-${typeof tool === 'string' ? tool : tool.name}`}>{typeof tool === 'string' ? tool : tool.name}</span>
                ))}
              </div>

              <div className="project-admin-footer">
                <div className="project-admin-links">
                  {project.liveUrl ? (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer" className="project-link-pill"><FiExternalLink /> Entrar no site</a>
                  ) : null}
                  {project.repoUrl ? (
                    <a href={project.repoUrl} target="_blank" rel="noreferrer" className="project-link-pill ghost"><FiGithub /> Git</a>
                  ) : null}
                </div>
                <div className="project-admin-actions">
                  <button className="admin-button" onClick={() => openEditProjectModal(project)}>Editar</button>
                  <button className="admin-button ghost" onClick={() => { removeProject(project.id); void removeProjectRemote(project.id); }}>Remover</button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  };

  const renderCertificateCards = () => {
    if (!certCount) {
      return (
        <div className="manage-empty-panel">
          <div>
            <div className="empty-illustration">◻</div>
            <strong>Nenhum certificado encontrado</strong>
            <p>Clique em "Novo Certificado" para começar.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="certificate-admin-list">
        {certs.map((certificate) => (
          <article className="certificate-admin-card" key={certificate.id}>
            <div className="certificate-admin-top">
              <div className="certificate-admin-icon">
                {certificate.certificateImage ? <img src={certificate.certificateImage} alt={certificate.title} /> : <FiImage />}
              </div>
              <div className="certificate-admin-meta">
                <h4>{certificate.title}</h4>
                <p>{certificate.issuer}</p>
              </div>
              <span className="summary-pill compact">{certificate.date}</span>
            </div>

            <div className="certificate-admin-tags">
              {(Array.isArray(certificate.skills) ? certificate.skills : []).slice(0, 5).map((skill) => (
                <span className="tag-pill soft" key={`${certificate.id}-${skill}`}>{skill}</span>
              ))}
            </div>

            <div className="certificate-admin-footer">
              {certificate.link ? (
                <a href={certificate.link} target="_blank" rel="noreferrer" className="project-link-pill ghost">Ver certificado</a>
              ) : null}
              <div className="project-admin-actions">
                <button className="admin-button" onClick={() => openEditCertModal(certificate)}>Editar</button>
                <button className="admin-button ghost" onClick={() => { removeCert(certificate.id); void removeCertRemote(certificate.id); }}>Remover</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="admin-content">
      <div className="content-column">
        <div className="section-toolbar">
          <div>
            <h3>Gerenciar Projetos</h3>
            <p className="section-subtitle">Adicione, edite ou remova itens do seu portfólio.</p>
          </div>
          <div>
            <button className="admin-button ghost" onClick={restoreDefaultProjects}>Restaurar Projetos Padrão</button>
            <button className="admin-button ghost" onClick={restoreDefaultCertificates}>Restaurar Certificados Padrão</button>
            <button className="admin-button gold" onClick={openNewProjectModal}><FiPlus /> Novo Projeto</button>
          </div>
        </div>

        <div className="list-summary-row">
          <span className="summary-pill">Total: {projectCount}</span>
        </div>

        {renderProjectCards()}
      </div>

      <div className="content-column">
        <div className="section-toolbar">
          <div>
            <h3>Gerenciar Certificados</h3>
            <p className="section-subtitle">Adicione, edite ou remova certificados do seu portfólio.</p>
          </div>
          <div>
            <button className="admin-button gold" onClick={openNewCertModal}><FiPlus /> Novo Certificado</button>
          </div>
        </div>

        <div className="list-summary-row">
          <span className="summary-pill">Total: {certCount}</span>
        </div>

        {renderCertificateCards()}

        {isProjectModalOpen && (
          <div className="modal-backdrop">
            <div className="modal modal-wide">
              <div className="modal-header">
                <div>
                  <h3>{editingProjectId ? 'Editar Projeto' : 'Novo Projeto'}</h3>
                  <p>Adicione as informações do projeto para o portfólio.</p>
                </div>
                <button className="icon-btn" onClick={() => setIsProjectModalOpen(false)}><FiX /></button>
              </div>
              <div className="modal-body">
                <div className="form-section">
                  <h4 className="form-section-title">Informações principais</h4>
                  <div className="form-grid form-grid-two">
                    <input placeholder="Título" value={projForm.title} onChange={(e) => setProjForm({ ...projForm, title: e.target.value })} />
                    <input placeholder="Categoria" value={projForm.category} onChange={(e) => setProjForm({ ...projForm, category: e.target.value })} />
                    <textarea className="span-2" placeholder="Descrição" value={projForm.description} onChange={(e) => setProjForm({ ...projForm, description: e.target.value })} rows={4} />
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="form-section-title">Mídia e links</h4>
                  <div className="form-grid form-grid-two">
                    <input placeholder="URL imagem" value={projForm.image} onChange={(e) => setProjForm({ ...projForm, image: e.target.value })} />
                    <input placeholder="Alt da imagem" value={projForm.imageAlt || ''} onChange={(e) => setProjForm({ ...projForm, imageAlt: e.target.value })} />
                    <input placeholder="Live URL" value={projForm.liveUrl} onChange={(e) => setProjForm({ ...projForm, liveUrl: e.target.value })} />
                    <input placeholder="Repo URL" value={projForm.repoUrl} onChange={(e) => setProjForm({ ...projForm, repoUrl: e.target.value })} />
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="form-section-title">Ferramentas</h4>
                  <div className="form-grid">
                    <input placeholder="Ferramentas (vírgula separadas)" value={projForm.tools} onChange={(e) => setProjForm({ ...projForm, tools: e.target.value })} />
                  </div>
                </div>

                <div className="image-preview-wrap">
                  <strong>Pré-visualização da imagem</strong>
                  <div className="image-preview-box">
                    {projForm.image ? (
                      <img src={projForm.image} alt="preview do projeto" />
                    ) : (
                      <div className="image-placeholder"><FiImage /> Sem imagem</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="admin-button gold" onClick={saveProject}><FiPlus /> Salvar Projeto</button>
                <button className="admin-button ghost" onClick={() => { setProjForm(emptyProject); setIsProjectModalOpen(false); }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {isCertModalOpen && (
          <div className="modal-backdrop">
            <div className="modal modal-wide">
              <div className="modal-header">
                <div>
                  <h3>{editingCertId ? 'Editar Certificado' : 'Novo Certificado'}</h3>
                  <p>Adicione os dados do certificado para aparecer no portfólio.</p>
                </div>
                <button className="icon-btn" onClick={() => setIsCertModalOpen(false)}><FiX /></button>
              </div>
              <div className="modal-body">
                <div className="form-section">
                  <h4 className="form-section-title">Dados principais</h4>
                  <div className="form-grid form-grid-two">
                    <input placeholder="Título" value={certForm.title} onChange={(e) => setCertForm({ ...certForm, title: e.target.value })} />
                    <input placeholder="Emissor" value={certForm.issuer} onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })} />
                    <input placeholder="Data" value={certForm.date} onChange={(e) => setCertForm({ ...certForm, date: e.target.value })} />
                    <label className="checkbox-field">
                      <input type="checkbox" checked={!!certForm.disableFlip} onChange={(e) => setCertForm({ ...certForm, disableFlip: e.target.checked })} />
                      <span>Desabilitar flip</span>
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="form-section-title">Mídia e link</h4>
                  <div className="form-grid form-grid-two">
                    <input placeholder="URL da imagem" value={certForm.certificateImage} onChange={(e) => setCertForm({ ...certForm, certificateImage: e.target.value })} />
                    <input placeholder="Link do certificado" value={certForm.link} onChange={(e) => setCertForm({ ...certForm, link: e.target.value })} />
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="form-section-title">Competências</h4>
                  <div className="form-grid">
                    <input placeholder="skills (vírgula separadas)" value={certForm.skills} onChange={(e) => setCertForm({ ...certForm, skills: e.target.value })} />
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <strong>Pré-visualização da imagem</strong>
                  <div className="image-preview-box">
                    {certForm.certificateImage ? (
                      <img src={certForm.certificateImage} alt="preview" />
                    ) : (
                      <div className="image-placeholder"><FiImage /> Sem imagem</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="admin-button gold" onClick={() => {
                  if (!certForm.title || !certForm.issuer) {
                    alert('Título e Emissor são obrigatórios');
                    return;
                  }
                  saveCert();
                }}><FiPlus /> Salvar Certificado</button>
                <button className="admin-button ghost" onClick={() => { setCertForm(emptyCert); setIsCertModalOpen(false); }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
