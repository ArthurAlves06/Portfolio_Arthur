import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, writeBatch, setDoc } from 'firebase/firestore';
import { getDb, hasFirebaseConfig } from '../services/firebase';

const PROJECTS_KEY = 'portfolio_projects_v1';
const CERTS_KEY = 'portfolio_certificates_v1';

const safeWindow = () => (typeof window !== 'undefined' ? window : null);

const readJson = (value, fallback) => {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
};

export function getStoredProjects() {
  const win = safeWindow();
  if (!win?.localStorage) return [];
  return readJson(win.localStorage.getItem(PROJECTS_KEY), []);
}

export function saveStoredProjects(projects) {
  const win = safeWindow();
  if (!win?.localStorage) return;
  win.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function getStoredCertificates() {
  const win = safeWindow();
  if (!win?.localStorage) return [];
  return readJson(win.localStorage.getItem(CERTS_KEY), []);
}

export function saveStoredCertificates(certs) {
  const win = safeWindow();
  if (!win?.localStorage) return;
  win.localStorage.setItem(CERTS_KEY, JSON.stringify(certs));
}

// Future: sync with Firestore if configured
export async function syncToFirestore() {
  if (!hasFirebaseConfig) return;
  const db = getDb();
  if (!db) return;
  // naive sync: write local projects/certs to collections if empty (no overwrite)
  try {
    const projects = getStoredProjects();
    const certs = getStoredCertificates();
    const projCol = collection(db, 'projects');
    const certCol = collection(db, 'certificates');
    await Promise.all(projects.map((p) => addDoc(projCol, p)));
    await Promise.all(certs.map((c) => addDoc(certCol, c)));
  } catch (e) {
    // ignore
  }
}

// Fetch projects & certificates from Firestore and persist locally
export async function fetchFromFirestore() {
  if (!hasFirebaseConfig) return { projects: [], certificates: [] };
  const db = getDb();
  if (!db) return { projects: [], certificates: [] };
  try {
    const projSnap = await getDocs(collection(db, 'projects'));
    const certSnap = await getDocs(collection(db, 'certificates'));
    const projects = projSnap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
    const certificates = certSnap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
    // persist locally
    saveStoredProjects(projects);
    saveStoredCertificates(certificates);
    return { projects, certificates };
  } catch (e) {
    return { projects: [], certificates: [] };
  }
}

// Subscribe to realtime updates and persist changes locally. Returns unsubscribe function.
export function subscribeFirestoreChanges() {
  if (!hasFirebaseConfig) return () => {};
  const db = getDb();
  if (!db) return () => {};

  const projCol = collection(db, 'projects');
  const certCol = collection(db, 'certificates');

  const unsubProj = onSnapshot(projCol, (snap) => {
    const projects = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
    saveStoredProjects(projects);
    // also emit a custom event so UI can react if needed
    const win = safeWindow();
    if (win) win.dispatchEvent(new CustomEvent('admin-data-updated', { detail: { projects } }));
  });

  const unsubCert = onSnapshot(certCol, (snap) => {
    const certificates = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
    saveStoredCertificates(certificates);
    const win = safeWindow();
    if (win) win.dispatchEvent(new CustomEvent('admin-data-updated', { detail: { certificates } }));
  });
  return () => {
    try { unsubProj(); } catch (e) { /* ignore */ }
    try { unsubCert(); } catch (e) { /* ignore */ }
  };
}

// Firestore CRUD helpers
export async function createProjectFirestore(project) {
  if (!hasFirebaseConfig) return null;
  const db = getDb();
  if (!db) return null;
  try {
    const ref = await addDoc(collection(db, 'projects'), project);
    return ref.id;
  } catch { return null; }
}

export async function updateProjectFirestore(id, project) {
  if (!hasFirebaseConfig) return null;
  const db = getDb();
  if (!db) return null;
  try {
    await setDoc(doc(db, 'projects', id), project);
    return id;
  } catch { return null; }
}

export async function deleteProjectFirestore(id) {
  if (!hasFirebaseConfig) return false;
  const db = getDb();
  if (!db) return false;
  try {
    await deleteDoc(doc(db, 'projects', id));
    return true;
  } catch { return false; }
}

export async function createCertificateFirestore(cert) {
  if (!hasFirebaseConfig) return null;
  const db = getDb();
  if (!db) return null;
  try {
    const ref = await addDoc(collection(db, 'certificates'), cert);
    return ref.id;
  } catch { return null; }
}

export async function updateCertificateFirestore(id, cert) {
  if (!hasFirebaseConfig) return null;
  const db = getDb();
  if (!db) return null;
  try {
    await setDoc(doc(db, 'certificates', id), cert);
    return id;
  } catch { return null; }
}

export async function deleteCertificateFirestore(id) {
  if (!hasFirebaseConfig) return false;
  const db = getDb();
  if (!db) return false;
  try {
    await deleteDoc(doc(db, 'certificates', id));
    return true;
  } catch { return false; }
}

export default {
  getStoredProjects,
  saveStoredProjects,
  getStoredCertificates,
  saveStoredCertificates,
  syncToFirestore,
  fetchFromFirestore,
  subscribeFirestoreChanges,
  createProjectFirestore,
  updateProjectFirestore,
  deleteProjectFirestore,
  createCertificateFirestore,
  updateCertificateFirestore,
  deleteCertificateFirestore,
};
