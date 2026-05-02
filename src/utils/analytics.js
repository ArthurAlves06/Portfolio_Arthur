import { addDoc, collection, getDocs, limit, onSnapshot, orderBy, query, writeBatch } from 'firebase/firestore';
import { getDb, hasFirebaseConfig } from '../services/firebase';

const STORAGE_KEY = 'portfolio_analytics_events_v1';
const COLLECTION_NAME = 'analytics_events';
export const ANALYTICS_UPDATED_EVENT = 'portfolio-analytics-updated';

const listeners = new Set();
let cachedEvents = [];
let firestoreUnsubscribe = null;

const safeWindow = () => (typeof window !== 'undefined' ? window : null);

const readJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const toLocalDateKey = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const emitUpdate = (events) => {
  cachedEvents = events;
  const win = safeWindow();
  if (win) {
    win.dispatchEvent(new CustomEvent(ANALYTICS_UPDATED_EVENT, { detail: { events } }));
  }
  listeners.forEach((listener) => {
    try {
      listener(events);
    } catch {
      // ignore listener failures to keep analytics flowing
    }
  });
};

const readFallbackEvents = () => {
  const win = safeWindow();
  if (!win?.localStorage) return [];
  const parsed = readJson(win.localStorage.getItem(STORAGE_KEY), []);
  return Array.isArray(parsed) ? parsed : [];
};

const writeFallbackEvents = (events) => {
  const win = safeWindow();
  if (!win?.localStorage) return;
  win.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

const removeFallbackEvents = () => {
  const win = safeWindow();
  if (!win?.localStorage) return;
  win.localStorage.removeItem(STORAGE_KEY);
};

const normalizeFirestoreEvent = (snapshot) => {
  const data = snapshot.data() || {};
  const createdAtValue = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || data.clientCreatedAt || new Date().toISOString();
  return {
    id: snapshot.id,
    ...data,
    createdAt: createdAtValue,
    dateKey: data.dateKey || toLocalDateKey(createdAtValue),
  };
};

const ensureRealtimeSubscription = () => {
  const db = getDb();
  if (!db || !hasFirebaseConfig || firestoreUnsubscribe) return;

  const eventsQuery = query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAtMs', 'desc'),
    limit(500)
  );

  firestoreUnsubscribe = onSnapshot(
    eventsQuery,
    (snapshot) => {
      const events = snapshot.docs.map(normalizeFirestoreEvent);
      emitUpdate(events);
    },
    (error) => {
      console.error('Firestore analytics subscription error:', error);
      firestoreUnsubscribe = null;
      emitUpdate(readFallbackEvents());
    }
  );
};

export const subscribeAnalyticsEvents = (callback) => {
  listeners.add(callback);
  ensureRealtimeSubscription();

  if (cachedEvents.length > 0) {
    callback(cachedEvents);
  } else {
    const _db = getDb();
    if (!hasFirebaseConfig || !_db) {
    const fallbackEvents = readFallbackEvents();
    emitUpdate(fallbackEvents);
    callback(fallbackEvents);
    }
  }

  return () => {
    listeners.delete(callback);
  };
};

export const getAnalyticsEvents = () => {
  if (cachedEvents.length > 0) return cachedEvents;
  const _db = getDb();
  return !hasFirebaseConfig || !_db ? readFallbackEvents() : [];
};

const createAnalyticsEvent = (type, payload = {}) => {
  const win = safeWindow();
  const createdAt = new Date().toISOString();
  return {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    createdAt,
    createdAtMs: Date.now(),
    dateKey: toLocalDateKey(createdAt),
    path: win?.location?.pathname || '/',
    referrer: win?.document?.referrer || '',
    title: win?.document?.title || '',
    ...payload,
  };
};

const appendEvent = (event) => {
  const next = [event, ...getAnalyticsEvents()].slice(0, 2000);
  const _db = getDb();
  if (!hasFirebaseConfig || !_db) {
    writeFallbackEvents(next);
  }
  emitUpdate(next);
};

export const trackEvent = (type, payload = {}) => {
  const event = createAnalyticsEvent(type, payload);

  appendEvent(event);

  if (hasFirebaseConfig) {
    const _db = getDb();
    if (_db) {
      void addDoc(collection(_db, COLLECTION_NAME), event).catch((error) => {
        console.error('Firestore analytics write error:', error);
        if (!cachedEvents.some((entry) => entry.id === event.id)) {
          appendEvent(event);
        }
      });
    }
  }

  return event;
};

export const clearAnalyticsEvents = async () => {
  const _db = getDb();
  if (!hasFirebaseConfig || !_db) {
    removeFallbackEvents();
    emitUpdate([]);
    return;
  }

  const eventsQuery = query(collection(_db, COLLECTION_NAME), orderBy('createdAtMs', 'desc'), limit(500));
  while (true) {
    const snapshot = await getDocs(eventsQuery);
    if (snapshot.empty) break;

    const batch = writeBatch(_db);
    snapshot.docs.forEach((docSnapshot) => batch.delete(docSnapshot.ref));
    await batch.commit();

    if (snapshot.size < 500) break;
  }

  emitUpdate([]);
};

export const refreshAnalyticsEvents = async () => {
  const _db = getDb();
  if (!hasFirebaseConfig || !_db) {
    const fallbackEvents = readFallbackEvents();
    emitUpdate(fallbackEvents);
    return fallbackEvents;
  }

  const eventsQuery = query(collection(_db, COLLECTION_NAME), orderBy('createdAtMs', 'desc'), limit(500));
  const snapshot = await getDocs(eventsQuery);
  const events = snapshot.docs.map(normalizeFirestoreEvent);
  emitUpdate(events);
  return events;
};

export const seedAnalyticsDemo = async () => {
  const base = Date.now();
  const demoEvents = [
    { type: 'page_view', title: 'Portfolio Arthur', path: '/', daysAgo: 0 },
    { type: 'lead_captured', name: 'Marina Alves', email: 'marina@email.com', subject: 'Freelance', daysAgo: 0 },
    { type: 'message_sent', subject: 'Freelance', messageLength: 124, daysAgo: 0 },
    { type: 'project_click', projectTitle: 'Xadrez em C', action: 'repository', daysAgo: 1 },
    { type: 'project_click', projectTitle: 'Aplicativo de Viagem', action: 'live', daysAgo: 2 },
    { type: 'certificate_click', certificateTitle: 'PYTHON: primeiras aplicações', action: 'open', daysAgo: 2 },
    { type: 'certificate_click', certificateTitle: 'HTTP: entendendo a web por baixo dos panos', action: 'open', daysAgo: 3 },
    { type: 'page_view', title: 'Portfolio Arthur', path: '/', daysAgo: 3 },
    { type: 'page_view', title: 'Portfolio Arthur', path: '/', daysAgo: 4 },
    { type: 'project_click', projectTitle: 'Jogo da Velha em C', action: 'repository', daysAgo: 5 },
  ].map((item, index) => ({
    id: `${base}-demo-${index}`,
    type: item.type,
    createdAt: new Date(base - item.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    createdAtMs: base - item.daysAgo * 24 * 60 * 60 * 1000,
    dateKey: toLocalDateKey(base - item.daysAgo * 24 * 60 * 60 * 1000),
    path: item.path || '/',
    referrer: '',
    title: item.title || 'Portfolio Arthur',
    ...item,
  }));

  const _db = getDb();
  if (!hasFirebaseConfig || !_db) {
    const current = getAnalyticsEvents();
    const next = [...demoEvents, ...current];
    writeFallbackEvents(next);
    emitUpdate(next);
    return;
  }

  const writes = demoEvents.map((event) => addDoc(collection(_db, COLLECTION_NAME), event));
  await Promise.all(writes);
};
