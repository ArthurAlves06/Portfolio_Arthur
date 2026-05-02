import React, { useEffect, useState } from 'react';
import './AdminDashboardStyle.css';
import adminData, { createProjectFirestore, updateProjectFirestore, deleteProjectFirestore, createCertificateFirestore, updateCertificateFirestore, deleteCertificateFirestore, subscribeFirestoreChanges, fetchFromFirestore } from '../../utils/adminData';

const emptyProject = { id: null, title: '', category: '', image: '', description: '', liveUrl: '', repoUrl: '', tools: '' };
const emptyCert = { id: null, title: '', issuer: '', date: '', link: '', certificateImage: '', skills: '' };

export default function AdminContent() {
  const [projects, setProjects] = useState(() => adminData.getStoredProjects());
  const [certs, setCerts] = useState(() => adminData.getStoredCertificates());
  const [projForm, setProjForm] = useState(emptyProject);
  const [certForm, setCertForm] = useState(emptyCert);

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
    const payload = { ...projForm, id: projForm.id || `${Date.now()}` };
    // normalize tools: comma separated names -> array of names
    if (payload.tools && typeof payload.tools === 'string') {
      payload.tools = payload.tools.split(',').map((s) => s.trim()).filter(Boolean);
    }
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
  };

  const removeProject = (id) => setProjects((s) => s.filter((p) => p.id !== id));
  const removeProjectRemote = async (id) => {
    try { await deleteProjectFirestore(id); } catch {}
  };

  const saveCert = () => {
    const next = [...certs];
    const payload = { ...certForm, id: certForm.id || `${Date.now()}`, skills: (certForm.skills || '').split(',').map((s) => s.trim()).filter(Boolean) };
    const idx = next.findIndex((c) => c.id === payload.id);
    if (idx >= 0) next[idx] = payload; else next.unshift(payload);
    setCerts(next);
    setCertForm(emptyCert);
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

  return (
    <div className="admin-content">
      <div className="content-column">
        <h3>Projetos</h3>
        <div className="manage-list">
          {projects.map((p) => (
            <div className="manage-row" key={p.id}>
              <div>
                <strong>{p.title}</strong>
                <div className="muted">{p.category} {p.tools ? `· ${Array.isArray(p.tools) ? p.tools.map(t=> typeof t === 'string' ? t : t.name).join(', ') : p.tools}` : ''}</div>
              </div>
              <div>
                <button className="admin-button" onClick={() => setProjForm({ ...p, tools: Array.isArray(p.tools) ? p.tools.map(t => typeof t === 'string' ? t : t.name).join(', ') : (p.tools || '') })}>Editar</button>
                <button className="admin-button ghost" onClick={() => { removeProject(p.id); void removeProjectRemote(p.id); }}>Remover</button>
              </div>
            </div>
          ))}
        </div>

        <h4>Adicionar / Editar Projeto</h4>
        <div className="form-grid">
          <input placeholder="Título" value={projForm.title} onChange={(e) => setProjForm({ ...projForm, title: e.target.value })} />
          <input placeholder="Categoria" value={projForm.category} onChange={(e) => setProjForm({ ...projForm, category: e.target.value })} />
          <input placeholder="URL imagem" value={projForm.image} onChange={(e) => setProjForm({ ...projForm, image: e.target.value })} />
          <input placeholder="Descrição" value={projForm.description} onChange={(e) => setProjForm({ ...projForm, description: e.target.value })} />
          <input placeholder="Live URL" value={projForm.liveUrl} onChange={(e) => setProjForm({ ...projForm, liveUrl: e.target.value })} />
          <input placeholder="Repo URL" value={projForm.repoUrl} onChange={(e) => setProjForm({ ...projForm, repoUrl: e.target.value })} />
          <input placeholder="Ferramentas (vírgula separadas)" value={projForm.tools} onChange={(e) => setProjForm({ ...projForm, tools: e.target.value })} />
          <div>
            <button className="admin-button" onClick={saveProject}>Salvar Projeto</button>
            <button className="admin-button ghost" onClick={() => setProjForm(emptyProject)}>Limpar</button>
          </div>
        </div>
      </div>

      <div className="content-column">
        <h3>Certificados</h3>
        <div className="manage-list">
          {certs.map((c) => (
            <div className="manage-row" key={c.id}>
              <div>
                <strong>{c.title}</strong>
                <div className="muted">{c.issuer} · {(c.skills || []).join(', ')}</div>
              </div>
              <div>
                <button className="admin-button" onClick={() => setCertForm({ ...c, skills: (c.skills || []).join(', '), disableFlip: !!c.disableFlip })}>Editar</button>
                <button className="admin-button ghost" onClick={() => { removeCert(c.id); void removeCertRemote(c.id); }}>Remover</button>
              </div>
            </div>
          ))}
        </div>

        <h4>Adicionar / Editar Certificado</h4>
        <div className="form-grid">
          <input placeholder="Título" value={certForm.title} onChange={(e) => setCertForm({ ...certForm, title: e.target.value })} />
          <input placeholder="Emissor" value={certForm.issuer} onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })} />
          <input placeholder="Data" value={certForm.date} onChange={(e) => setCertForm({ ...certForm, date: e.target.value })} />
          <input placeholder="URL da imagem" value={certForm.certificateImage} onChange={(e) => setCertForm({ ...certForm, certificateImage: e.target.value })} />
          <input placeholder="Link do certificado" value={certForm.link} onChange={(e) => setCertForm({ ...certForm, link: e.target.value })} />
          <input placeholder="skills (vírgula separadas)" value={certForm.skills} onChange={(e) => setCertForm({ ...certForm, skills: e.target.value })} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={!!certForm.disableFlip} onChange={(e) => setCertForm({ ...certForm, disableFlip: e.target.checked })} />
            <span>Desabilitar flip</span>
          </label>
          <div>
            <button className="admin-button" onClick={saveCert}>Salvar Certificado</button>
            <button className="admin-button ghost" onClick={() => setCertForm(emptyCert)}>Limpar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
