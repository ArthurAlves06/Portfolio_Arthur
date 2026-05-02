import React, { useEffect, useMemo, useState } from 'react';
import './AdminDashboardStyle.css';
import { FiBarChart2, FiHome, FiUsers, FiMousePointer, FiMessageCircle, FiAward, FiSettings, FiLogOut, FiDownload, FiRefreshCw, FiPlay } from 'react-icons/fi';
import { refreshAnalyticsEvents, seedAnalyticsDemo, subscribeAnalyticsEvents } from '../../utils/analytics';
import AdminContent from './AdminContent';

const labelByType = {
  page_view: 'Acesso',
  lead_captured: 'Lead',
  message_sent: 'Mensagem',
  project_click: 'Projeto',
  certificate_click: 'Certificado',
};

const typeColor = {
  page_view: 'var(--admin-blue)',
  lead_captured: 'var(--admin-accent-1)',
  message_sent: 'var(--admin-accent-2)',
  project_click: 'var(--admin-purple)',
  certificate_click: 'var(--admin-deep-blue)',
};

const formatTime = (value) => {
  if (!value) return '--';
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
};

const lastNDays = (days) => Array.from({ length: days }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (days - 1 - index));
  return date.toISOString().slice(0, 10);
});

const sumBy = (events, key) => events.reduce((acc, event) => {
  const nextKey = event[key] || 'Sem nome';
  acc[nextKey] = (acc[nextKey] || 0) + 1;
  return acc;
}, {});

const sortEntries = (entries) => entries.sort((left, right) => right[1] - left[1]);

const makeExportFile = (events) => {
  const header = ['id', 'type', 'createdAt', 'path', 'title', 'name', 'email', 'subject', 'action', 'projectTitle', 'certificateTitle'];
  const rows = events.map((event) => header.map((key) => JSON.stringify(event[key] ?? '')).join(','));
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const StatCard = ({ label, value, helper, icon, tone }) => (
  <article className="admin-stat-card">
    <span className={`stat-icon ${tone}`}>{icon}</span>
    <div className="stat-copy">
      <small>{label}</small>
      <strong>{value}</strong>
      <span>{helper}</span>
    </div>
    <span className="stat-trend">+4.5%</span>
  </article>
);

const DonutCard = ({ events }) => {
  const counts = useMemo(() => ({
    project_click: events.filter((event) => event.type === 'project_click').length,
    certificate_click: events.filter((event) => event.type === 'certificate_click').length,
    lead_captured: events.filter((event) => event.type === 'lead_captured').length,
    message_sent: events.filter((event) => event.type === 'message_sent').length,
  }), [events]);

  const total = Math.max(1, Object.values(counts).reduce((acc, value) => acc + value, 0));
  const segments = [
    ['project_click', counts.project_click, '#7B61FF'],
    ['certificate_click', counts.certificate_click, '#1f34bc'],
    ['lead_captured', counts.lead_captured, '#6366f1'],
    ['message_sent', counts.message_sent, '#4f8cff'],
  ];

  const canvasRef = React.useRef(null);
  const figureRef = React.useRef(null);
  const [canvasSize, setCanvasSize] = React.useState(200);
  const [hover, setHover] = React.useState(null);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return undefined;

    const updateSize = () => {
      const nextSize = Math.max(160, Math.min(280, Math.floor(figure.clientWidth)));
      setCanvasSize(nextSize);
    };

    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateSize);
      observer.observe(figure);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const visibleSegments = useMemo(() => {
    let start = 0;
    return segments
      .filter(([, value]) => value > 0)
      .map(([key, value, color]) => {
        const pct = value / total;
        const end = start + pct;
        const segment = { key, value, color, start, end };
        start = end;
        return segment;
      });
  }, [segments, total]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    const center = canvasSize / 2;
    const radius = 76;
    const lineWidth = 42;
    let currentAngle = -Math.PI / 2;

    visibleSegments.forEach((segment) => {
      const slice = Math.max(0.001, (segment.end - segment.start) * Math.PI * 2);
      ctx.beginPath();
      ctx.strokeStyle = segment.color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'butt';
      ctx.arc(center, center, radius, currentAngle, currentAngle + slice);
      ctx.stroke();
      currentAngle += slice;
    });
  }, [visibleSegments]);

  const handlePointerMove = (event) => {
    const canvas = canvasRef.current;
    if (!canvas || visibleSegments.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const center = rect.width / 2;
    const dx = x - center;
    const dy = y - center;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 48 || distance > 98) {
      setHover(null);
      return;
    }

    let angle = Math.atan2(dy, dx);
    angle += Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;
    const normalized = angle / (Math.PI * 2);

    const found = visibleSegments.find((segment) => normalized >= segment.start && normalized < segment.end)
      || visibleSegments[visibleSegments.length - 1];

    if (!found) {
      setHover(null);
      return;
    }

    setHover({
      key: found.key,
      value: found.value,
      leftPx: x,
      topPx: y,
    });
  };

  return (
    <article className="panel-card panel-card-donut">
      <h3>Interesse dos visitantes</h3>
      <div className="donut-figure" ref={figureRef} style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          className="donut-canvas"
          onMouseMove={handlePointerMove}
          onMouseLeave={() => setHover(null)}
        />

        <div className="donut-ring" />

        <div className="donut-hole">
          <div className="donut-hole-content">
            <strong>{total}</strong>
            <span>eventos</span>
          </div>
        </div>

        {hover && (
          <div
            className="donut-tooltip chart-tooltip"
            style={{ left: hover.leftPx, top: hover.topPx + 12, position: 'absolute', transform: 'translate(-50%, 0)', pointerEvents: 'none' }}
          >
            <strong style={{ color: '#f8fafc' }}>{labelByType[hover.key] || hover.key}</strong>
            <div className="muted" style={{ color: '#f8fafc', marginTop: 4 }}>{hover.value} eventos</div>
          </div>
        )}
      </div>

      <div className="chart-legend compact">
        {segments.map(([key, value, color]) => {
          const pct = total ? Math.round((value / total) * 100) : 0;
          return (
            <span key={key} className="legend-item">
              <i style={{ background: color }} />
              {labelByType[key]} — {value} ({pct}%)
            </span>
          );
        })}
      </div>
    </article>
  );
};

const RankedBarCard = ({ title, subtitle, items, accent }) => {
  const ordered = sortEntries(Object.entries(items)).slice(0, 6);
  const max = Math.max(1, ...ordered.map(([, value]) => value));

  return (
    <article className="panel-card panel-card-bars">
      <h3>{title}</h3>
      <p className="panel-subtitle">{subtitle}</p>
      <div className="rank-list">
        {ordered.length === 0 ? (
          <p className="chart-empty-inline">Sem registros ainda.</p>
        ) : ordered.map(([name, value]) => (
          <div className="rank-row" key={name}>
            <div className="rank-row-meta">
              <strong>{name}</strong>
              <span>{value}</span>
            </div>
            <div className="rank-track">
              <div className="rank-fill" style={{ width: `${(value / max) * 100}%`, background: accent }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
};

const LineCard = ({ events, range = 'week', onRangeChange = () => {} }) => {
  const daysCount = range === 'week' ? 7 : 30;
  const days = useMemo(() => lastNDays(daysCount), [daysCount]);
  const grouped = days.map((day) => ({
    day,
    page_view: events.filter((event) => event.dateKey === day && event.type === 'page_view').length,
  }));

  const maxValue = Math.max(1, ...grouped.map((item) => item.page_view));

  // build points for svg
  const points = grouped.map((item, idx) => {
    const raw = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(new Date(item.day));
    const cleaned = raw.replace('.', '').replace('\u00A0', '');
    const label = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    return ({ xIndex: idx, label, value: item.page_view });
  });

  const showMonthLabel = range === 'month';
  const monthLabel = (() => {
    if (!showMonthLabel) return null;
    const dt = new Date();
    const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dt);
    const year = dt.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  })();

  return (
    <article className="panel-card panel-card-line">
      <div className="panel-card-header">
        <div>
          <h3>Tráfego</h3>
          <p className="panel-subtitle">visitas e geração de leads nos últimos {daysCount} dias</p>
        </div>
        <div className="chart-controls">
          {showMonthLabel && <div className="month-label">{monthLabel}</div>}
          <div className="range-buttons">
            <button className={`range-btn ${range === 'week' ? 'active' : ''}`} onClick={() => onRangeChange('week')}>Semana</button>
            <button className={`range-btn ${range === 'month' ? 'active' : ''}`} onClick={() => onRangeChange('month')}>Mês</button>
          </div>
        </div>
      </div>
      <div className="chart-wrap">
        <LineChart points={points} maxValue={maxValue} color="var(--admin-accent-2)" fillColor="rgba(99,102,241,0.12)" strokeWidth={4} />
      </div>
    </article>
  );
};

const LineChart = ({ points, maxValue, color = 'var(--admin-accent-2)', fillColor = 'rgba(79,140,255,0.08)', strokeWidth = 3 }) => {
  const svgRef = React.useRef(null);
  const [hover, setHover] = useState(null);
  const width = 820; // viewBox width
  const height = 240;
  const padding = 24;

  const coords = points.map((p, i) => {
    const x = padding + (i * (width - padding * 2)) / Math.max(1, points.length - 1);
    const y = padding + (1 - (p.value / Math.max(1, maxValue))) * (height - padding * 2);
    return { ...p, x, y };
  });

  const buildPath = (pts) => {
    // cubic smoothing using simple midpoint control points for a smooth curve
    if (!pts.length) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      const cx1 = p.x + (q.x - (pts[i - 1]?.x ?? p.x)) * 0.2;
      const cy1 = p.y + (q.y - (pts[i - 1]?.y ?? p.y)) * 0.2;
      const cx2 = q.x - ((pts[i + 2]?.x ?? q.x) - p.x) * 0.2;
      const cy2 = q.y - ((pts[i + 2]?.y ?? q.y) - p.y) * 0.2;
      d += ` C ${cx1} ${cy1} ${cx2} ${cy2} ${q.x} ${q.y}`;
    }
    return d;
  };

  const lineD = buildPath(coords);
  const areaD = lineD && coords.length ? `${lineD} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z` : '';

  const pathRef = React.useRef(null);
  React.useEffect(() => {
    const pathEl = pathRef.current;
    if (!pathEl) return;
    try {
      const len = pathEl.getTotalLength();
      pathEl.style.strokeDasharray = String(len);
      pathEl.style.strokeDashoffset = String(len);
      // trigger layout
      // eslint-disable-next-line no-unused-expressions
      pathEl.getBoundingClientRect();
      pathEl.style.transition = 'stroke-dashoffset 900ms cubic-bezier(.22,.9,.2,1)';
      pathEl.style.strokeDashoffset = '0';
    } catch (e) {
      // ignore in case SVG not ready
    }
  }, [lineD]);

  const findNearest = (svgX) => {
    let best = null;
    let bestDist = Infinity;
    coords.forEach((c, idx) => {
      const d = Math.abs(c.x - svgX);
      if (d < bestDist) { bestDist = d; best = { ...c, idx }; }
    });
    return best;
  };

  return (
    <div className="svg-chart" style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} ref={svgRef} preserveAspectRatio="none" width="100%" height="240"
        onMouseMove={(e) => {
          if (!svgRef.current) return;
          const pt = svgRef.current.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const ctm = svgRef.current.getScreenCTM();
          let svgP;
          try {
            svgP = pt.matrixTransform(ctm.inverse());
          } catch (err) {
            // fallback: use bounding rect mapping
            const rect = svgRef.current.getBoundingClientRect();
            const scaleX = rect.width / width;
            svgP = { x: (e.clientX - rect.left) / scaleX, y: (e.clientY - rect.top) / (rect.height / height) };
          }
          const n = findNearest(svgP.x);
          if (n) {
            // compute pixel positions for tooltip
            const rect = svgRef.current.getBoundingClientRect();
            const scaleX = rect.width / width;
            const scaleY = rect.height / height;
            const leftPx = svgP.x * scaleX;
            const topPx = svgP.y * scaleY;
            setHover({ ...n, svgX: svgP.x, svgY: svgP.y, leftPx, topPx });
          }
        }}
        onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--admin-accent-2)" stopOpacity={0.15} />
            <stop offset="95%" stopColor="var(--admin-accent-2)" stopOpacity={0} />
          </linearGradient>
        </defs>

        {areaD && <path d={areaD} fill="url(#colorVisitas)" className="chart-area" />}
        {lineD && (
          <path ref={pathRef} d={lineD} fill="none" stroke={color} strokeWidth={strokeWidth} className="chart-line" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={4} fill={color} style={{ opacity: hover && hover.idx === i ? 1 : 0.9 }} />
        ))}

        {hover && (
          <g className="hover-group">
            <line x1={hover.x} x2={hover.x} y1={padding} y2={height - padding} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
            <circle cx={hover.x} cy={hover.y} r={6} fill="#fff" />
          </g>
        )}

        {/* Y axis grid & labels (6 ticks) */}
        {Array.from({ length: 6 }).map((_, i) => {
          const t = i / 5; // 0..1
          const y = padding + t * (height - padding * 2);
          const value = Math.round((1 - t) * Math.max(0, maxValue));
          const formatted = new Intl.NumberFormat('pt-BR').format(value);
          return (
            <g key={`grid-${i}`} className="chart-grid">
              <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
              <text x={padding - 8} y={y + 4} fontSize="11" textAnchor="end">{formatted}</text>
            </g>
          );
        })}
        {coords.map((c, i) => (
          <text key={`x-${i}`} x={c.x} y={height - 6} fill="#64748B" fontSize="11" textAnchor="middle">{c.label}</text>
        ))}
      </svg>

      {hover && (
        <div
          className="chart-tooltip"
          style={{
            left: `${hover.leftPx}px`,
            top: `${hover.topPx - 62}px`,
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 16,
            padding: '0.6rem 0.9rem',
            minWidth: 90,
            transform: 'translate(-50%, 0)'
          }}
        >
          <strong style={{ color: '#f8fafc' }}>{ptWeekday(hover.label)}</strong>
          <div className="muted" style={{ color: '#f8fafc', marginTop: 4 }}>visitas: {hover.value}</div>
        </div>
      )}
    </div>
  );
};

function ptWeekday(enShort) {
  const map = { Mon: 'Seg', Tue: 'Ter', Wed: 'Qua', Thu: 'Qui', Fri: 'Sex', Sat: 'Sáb', Sun: 'Dom' };
  return map[enShort] || enShort;
}

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [range, setRange] = useState('week'); // 'week' or 'month'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('overview');
    // const [isCollapsed, setIsCollapsed] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    const unsubscribe = subscribeAnalyticsEvents((nextEvents) => {
      setEvents(nextEvents);
    });

    return () => unsubscribe();
  }, []);

  const totals = useMemo(() => {
    const pageView = events.filter((event) => event.type === 'page_view').length;
    const leads = events.filter((event) => event.type === 'lead_captured').length;
    const messages = events.filter((event) => event.type === 'message_sent').length;
    const conversion = pageView > 0 ? Math.round((leads / pageView) * 100) : 0;
    return { pageView, leads, messages, conversion };
  }, [events]);

  const projectCounts = useMemo(() => sumBy(events.filter((event) => event.type === 'project_click'), 'projectTitle'), [events]);
  const certificateCounts = useMemo(() => sumBy(events.filter((event) => event.type === 'certificate_click'), 'certificateTitle'), [events]);
  const latestEvents = useMemo(() => events.slice(0, 8), [events]);
  const hasData = events.length > 0;

  const filteredEvents = useMemo(() => {
    switch (activeCategory) {
      case 'leads': return events.filter((e) => e.type === 'lead_captured');
      case 'projects': return events.filter((e) => e.type === 'project_click');
      case 'certificates': return events.filter((e) => e.type === 'certificate_click');
      case 'messages': return events.filter((e) => e.type === 'message_sent');
      case 'visits': return events.filter((e) => e.type === 'page_view');
      default: return events;
    }
  }, [events, activeCategory]);

  const categoryTitle = {
    overview: 'Visão Geral',
    leads: 'Leads',
    visits: 'Visitas',
    messages: 'Mensagens',
    certificates: 'Certificados',
    projects: 'Projetos',
    reports: 'Relatórios'
  }[activeCategory] || 'Eventos';

  const renderMainContent = () => {
    if (activeCategory === 'overview') {
      return (
        <>
          <section className="metrics-grid">
            <StatCard label="Total de Leads" value={totals.leads} helper="capturas no formulário" icon={<FiUsers />} tone="blue" />
            <StatCard label="Mensagens" value={totals.messages} helper="envios confirmados" icon={<FiMessageCircle />} tone="green" />
            <StatCard label="Taxa de Conversão" value={`${totals.conversion}%`} helper="leads ÷ acessos" icon={<FiBarChart2 />} tone="purple" />
          </section>

          <section className="dashboard-grid three-cols">
            <div id="leads">
              <DonutCard events={events} />
            </div>
            <div id="projects">
              <RankedBarCard title="Projetos mais clicados" subtitle="visibilidade dos links dos cards" items={projectCounts} accent="var(--admin-accent-1)" />
            </div>
            <div id="certificates">
              <RankedBarCard title="Certificados mais clicados" subtitle="cartões e botão de ver certificado" items={certificateCounts} accent="var(--admin-deep-blue)" />
            </div>

            <div className="dashboard-full" id="reports">
              <LineCard events={events} range={range} onRangeChange={setRange} />
            </div>

            <article className="panel-card panel-card-table dashboard-full" id="messages">
              <h3>Eventos recentes</h3>
              <p className="panel-subtitle">últimos registros capturados do site</p>

              {hasData ? (
                <div className="events-table">
                  {latestEvents.map((event) => (
                    <div className="event-row" key={event.id}>
                      <div className="event-main">
                        <span className="event-pill" style={{ background: typeColor[event.type] || 'var(--admin-muted)' }}>
                          {labelByType[event.type] || event.type}
                        </span>
                        <strong>{event.projectTitle || event.certificateTitle || event.subject || event.name || event.title || 'Evento'}</strong>
                        <small>{event.email || event.action || event.path || 'Sem detalhes adicionais'}</small>
                      </div>
                      <time>{formatTime(event.createdAt)}</time>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h4>Sem dados ainda</h4>
                  <p>Interaja com o site ou use o botão de demo para preencher os gráficos rapidamente.</p>
                </div>
              )}
            </article>
          </section>
        </>
      );
    }

    if (activeCategory === 'manage') {
      return (
        <section className="dashboard-full">
          <AdminContent />
        </section>
      );
    }

    // default: filtered list view
    return (
      <section className="dashboard-full">
        <article className="panel-card panel-card-table dashboard-full">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{categoryTitle}</h3>
            <div>
              <button type="button" className="admin-button ghost" onClick={() => setActiveCategory('overview')}>Voltar</button>
            </div>
          </div>
          <p className="panel-subtitle">Lista filtrada por <strong>{categoryTitle}</strong></p>

          {filteredEvents.length ? (
            <div className="events-table">
              {filteredEvents.map((event) => (
                <div className="event-row" key={event.id}>
                  <div className="event-main">
                    <span className="event-pill" style={{ background: typeColor[event.type] || 'var(--admin-muted)' }}>
                      {labelByType[event.type] || event.type}
                    </span>
                    <strong>{event.projectTitle || event.certificateTitle || event.subject || event.name || event.title || 'Evento'}</strong>
                    <small>{event.email || event.action || event.path || 'Sem detalhes adicionais'}</small>
                  </div>
                  <time>{formatTime(event.createdAt)}</time>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h4>Sem registros</h4>
              <p>Não há eventos para a categoria selecionada.</p>
            </div>
          )}
        </article>
      </section>
    );
  };

  return (
    <div className={`admin-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {sidebarOpen && <button type="button" className="sidebar-backdrop" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">A</span>
          <div>
            <strong>ADMIN</strong>
            <small>Portfolio Arthur</small>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Admin navigation">
          <a className={`sidebar-link ${activeCategory === 'overview' ? 'active' : ''}`} href="#overview" onClick={(e) => { e.preventDefault(); setActiveCategory('overview'); closeSidebar(); }}><FiHome /> Dashboard</a>
          <a className={`sidebar-link ${activeCategory === 'leads' ? 'active' : ''}`} href="#leads" onClick={(e) => { e.preventDefault(); setActiveCategory('leads'); closeSidebar(); }}><FiUsers /> Leads</a>
          <a className={`sidebar-link ${activeCategory === 'visits' ? 'active' : ''}`} href="#visits" onClick={(e) => { e.preventDefault(); setActiveCategory('visits'); closeSidebar(); }}><FiMousePointer /> Visitas</a>
          <a className={`sidebar-link ${activeCategory === 'messages' ? 'active' : ''}`} href="#messages" onClick={(e) => { e.preventDefault(); setActiveCategory('messages'); closeSidebar(); }}><FiMessageCircle /> Mensagens</a>
          <a className={`sidebar-link ${activeCategory === 'certificates' ? 'active' : ''}`} href="#certificates" onClick={(e) => { e.preventDefault(); setActiveCategory('certificates'); closeSidebar(); }}><FiAward /> Certificados</a>
          <a className={`sidebar-link ${activeCategory === 'reports' ? 'active' : ''}`} href="#reports" onClick={(e) => { e.preventDefault(); setActiveCategory('reports'); closeSidebar(); }}><FiBarChart2 /> Relatórios</a>
          <a className={`sidebar-link ${activeCategory === 'manage' ? 'active' : ''}`} href="#manage" onClick={(e) => { e.preventDefault(); setActiveCategory('manage'); closeSidebar(); }}>Conteúdo</a>
        </nav>

        <div className="sidebar-footer">
          <a className="sidebar-link muted" href="#settings" onClick={closeSidebar}><FiSettings /> Configurações</a>
          <a className="sidebar-link muted" href="/" onClick={closeSidebar}><FiLogOut /> Sair</a>
        </div>
      </aside>

      <main className="admin-main" id="overview">
        <header className="admin-topbar">
          <div>
            <div className="topbar-row">
              <button
                type="button"
                className="sidebar-toggle"
                onClick={() => setSidebarOpen((value) => !value)}
                aria-label="Alternar menu"
                aria-expanded={sidebarOpen}
              >
                <span />
                <span />
                <span />
              </button>
              <h1>Visão Geral</h1>
            </div>
            <p>Bem-vindo ao painel administrativo do Portfolio Arthur.</p>
          </div>

          <div className="admin-actions">
            <button type="button" className="admin-button ghost" onClick={() => makeExportFile(events)}>
              <FiDownload /> Exportar Relatório
            </button>
            <button type="button" className="admin-button gold" onClick={() => { void seedAnalyticsDemo(); }}>
              <FiPlay /> Gerar Demo
            </button>
            <button type="button" className="admin-button" onClick={() => { void refreshAnalyticsEvents(); }}>
              <FiRefreshCw /> Atualizar
            </button>
          </div>
        </header>
        {renderMainContent()}

        <div className="hidden-anchor" id="settings" />
      </main>
    </div>
  );
};

export default AdminDashboard;