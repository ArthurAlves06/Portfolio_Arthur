import React, { useEffect, useMemo, useState } from 'react';
import './AdminDashboardStyle.css';
import { FiBarChart2, FiHome, FiUsers, FiMousePointer, FiMessageCircle, FiAward, FiSettings, FiLogOut, FiDownload, FiRefreshCw, FiPlay, FiEdit3, FiSearch, FiCopy, FiCheck, FiLayers, FiExternalLink } from 'react-icons/fi';
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

const extractName = (value, maxLen = 80) => {
  if (!value) return 'Sem nome';
  const str = typeof value === 'object' ? (value.pt || value.en || 'Sem nome') : String(value);
  if (str.length > maxLen) {
    return `${str.slice(0, maxLen).trim()}...`;
  }
  return str;
};

const sumBy = (events, key) => events.reduce((acc, event) => {
  const raw = event[key];
  const nextKey = extractName(raw);
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

const StatCard = ({ label, value, helper, icon, tone, trend }) => (
  <article className="admin-stat-card">
    <span className={`stat-icon ${tone}`}>{icon}</span>
    <div className="stat-copy">
      <small>{label}</small>
      <strong>{value}</strong>
      <span>{helper}</span>
    </div>
    {trend && <span className="stat-trend">{trend}</span>}
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
              <strong>{extractName(name)}</strong>
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

const LineCard = ({ events }) => {
  const [metric, setMetric] = useState('page_view');
  const [viewMode, setViewMode] = useState('30d'); // '7d', '30d', 'month', 'year'

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12

  // Available years from events
  const availableYears = useMemo(() => {
    const yearsSet = new Set([currentDate.getFullYear()]);
    events.forEach((e) => {
      if (e.createdAt) {
        const y = new Date(e.createdAt).getFullYear();
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [events, currentDate]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Compute grouped data points according to viewMode
  const { points, periodTitle } = useMemo(() => {
    let result = [];
    let title = '';

    if (viewMode === '7d' || viewMode === '30d') {
      const daysCount = viewMode === '7d' ? 7 : 30;
      title = viewMode === '7d' ? 'Últimos 7 dias' : 'Últimos 30 dias';
      const days = lastNDays(daysCount);

      result = days.map((day, idx) => {
        const d = new Date(day + 'T12:00:00');
        const dayNum = String(d.getDate()).padStart(2, '0');
        const monthShort = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(d).replace('.', '');
        const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(d).replace('.', '');
        const val = events.filter((e) => e.dateKey === day && e.type === metric).length;

        return {
          xIndex: idx,
          shortLabel: viewMode === '7d' ? (weekday.charAt(0).toUpperCase() + weekday.slice(1)) : `${dayNum}/${monthShort}`,
          fullDateLabel: `${dayNum} de ${monthShort}`,
          value: val,
        };
      });
    } else if (viewMode === 'month') {
      // Days of the selected month
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      title = `${monthNames[selectedMonth - 1]} de ${selectedYear}`;

      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = String(day).padStart(2, '0');
        const mStr = String(selectedMonth).padStart(2, '0');
        const dateKey = `${selectedYear}-${mStr}-${dayStr}`;
        const val = events.filter((e) => e.dateKey === dateKey && e.type === metric).length;

        result.push({
          xIndex: day - 1,
          shortLabel: `Dia ${dayStr}`,
          fullDateLabel: `${dayStr} de ${monthNames[selectedMonth - 1]} de ${selectedYear}`,
          value: val,
        });
      }
    } else if (viewMode === 'year') {
      // 12 months of the selected year
      title = `Ano de ${selectedYear}`;
      for (let m = 1; m <= 12; m++) {
        const mStr = String(m).padStart(2, '0');
        const yearPrefix = `${selectedYear}-${mStr}`;
        const val = events.filter((e) => (e.dateKey || '').startsWith(yearPrefix) && e.type === metric).length;

        result.push({
          xIndex: m - 1,
          shortLabel: monthNames[m - 1].slice(0, 3),
          fullDateLabel: `${monthNames[m - 1]} de ${selectedYear}`,
          value: val,
        });
      }
    }

    return { points: result, periodTitle: title };
  }, [viewMode, selectedYear, selectedMonth, events, metric]);

  const totalPeriod = points.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(1, ...points.map((item) => item.value));
  const avgValue = points.length ? (totalPeriod / points.length).toFixed(1) : 0;

  const metricLabel = {
    page_view: 'Visitas',
    project_click: 'Cliques em Projetos',
    lead_captured: 'Leads Capturados',
  }[metric] || 'Visitas';

  return (
    <article className="panel-card panel-card-line">
      <div className="panel-card-header">
        <div>
          <h3>Gráfico de Atividade ({metricLabel})</h3>
          <p className="panel-subtitle">{periodTitle} • Métricas em tempo real</p>
        </div>

        <div className="chart-controls">
          {/* Metric Selector */}
          <div className="range-buttons metric-selector">
            <button className={`range-btn ${metric === 'page_view' ? 'active' : ''}`} onClick={() => setMetric('page_view')}>Visitas</button>
            <button className={`range-btn ${metric === 'project_click' ? 'active' : ''}`} onClick={() => setMetric('project_click')}>Cliques</button>
            <button className={`range-btn ${metric === 'lead_captured' ? 'active' : ''}`} onClick={() => setMetric('lead_captured')}>Leads</button>
          </div>

          {/* Time Scope Tabs */}
          <div className="range-buttons">
            <button className={`range-btn ${viewMode === '7d' ? 'active' : ''}`} onClick={() => setViewMode('7d')}>7D</button>
            <button className={`range-btn ${viewMode === '30d' ? 'active' : ''}`} onClick={() => setViewMode('30d')}>30D</button>
            <button className={`range-btn ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Mês</button>
            <button className={`range-btn ${viewMode === 'year' ? 'active' : ''}`} onClick={() => setViewMode('year')}>Ano</button>
          </div>

          {/* Dropdowns when Month or Year are selected */}
          {viewMode === 'month' && (
            <div className="chart-dropdowns">
              <select
                className="chart-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {monthNames.map((mName, idx) => (
                  <option key={idx + 1} value={idx + 1}>{mName}</option>
                ))}
              </select>
              <select
                className="chart-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'year' && (
            <div className="chart-dropdowns">
              <select
                className="chart-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="chart-stat-bar">
        <div className="chart-stat-item">
          <span className="chart-stat-label">Total do Período</span>
          <strong className="chart-stat-num">{totalPeriod}</strong>
        </div>
        <div className="chart-stat-item">
          <span className="chart-stat-label">Média do Período</span>
          <strong className="chart-stat-num">{avgValue}</strong>
        </div>
        <div className="chart-stat-item">
          <span className="chart-stat-label">Pico Máximo</span>
          <strong className="chart-stat-num">{maxValue}</strong>
        </div>
      </div>

      <div className="chart-wrap">
        <LineChart
          points={points}
          maxValue={maxValue}
          color="#38bdf8"
          strokeWidth={3.5}
          metricLabel={metricLabel}
          viewMode={viewMode}
        />
      </div>
    </article>
  );
};

const LineChart = ({ points, maxValue, color = '#38bdf8', strokeWidth = 3, metricLabel = 'Visitas', viewMode = '30d' }) => {
  const svgRef = React.useRef(null);
  const [hover, setHover] = useState(null);
  const width = 960;
  const height = 300;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 32;
  const paddingBottom = 55;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const coords = points.map((p, i) => {
    const x = paddingLeft + (i * chartWidth) / Math.max(1, points.length - 1);
    const y = paddingTop + (1 - (p.value / Math.max(1, maxValue))) * chartHeight;
    return { ...p, x, y };
  });

  const buildPath = (pts) => {
    if (!pts.length) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    const bottomLimit = paddingTop + chartHeight;
    const topLimit = paddingTop;
    const clampY = (y) => Math.min(bottomLimit, Math.max(topLimit, y));

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      const dx = (q.x - p.x) * 0.38;
      const cx1 = p.x + dx;
      const cy1 = clampY(p.y);
      const cx2 = q.x - dx;
      const cy2 = clampY(q.y);
      d += ` C ${cx1} ${cy1} ${cx2} ${cy2} ${q.x} ${q.y}`;
    }
    return d;
  };

  const lineD = buildPath(coords);
  const baselineY = paddingTop + chartHeight;
  const areaD = lineD && coords.length
    ? `${lineD} L ${coords[coords.length - 1].x} ${baselineY} L ${coords[0].x} ${baselineY} Z`
    : '';

  const findNearest = (svgX) => {
    let best = null;
    let bestDist = Infinity;
    coords.forEach((c, idx) => {
      const d = Math.abs(c.x - svgX);
      if (d < bestDist) { bestDist = d; best = { ...c, idx }; }
    });
    return best;
  };

  // Determine tick spacing based on viewMode
  const tickStep = useMemo(() => {
    if (viewMode === '7d') return 1;
    if (viewMode === 'year') return 1; // 12 months fit comfortably
    if (viewMode === '30d' || viewMode === 'month') return Math.ceil(points.length / 8);
    return 1;
  }, [viewMode, points.length]);

  // Y-axis tick values
  const yTicksCount = 4;
  const yTicks = Array.from({ length: yTicksCount + 1 }, (_, i) => {
    const ratio = i / yTicksCount;
    const y = paddingTop + ratio * chartHeight;
    const val = Math.round((1 - ratio) * Math.max(1, maxValue));
    return { y, val };
  });

  return (
    <div className="svg-chart modern-chart" style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        ref={svgRef}
        preserveAspectRatio="none"
        width="100%"
        height="300"
        onMouseMove={(e) => {
          if (!svgRef.current) return;
          const rect = svgRef.current.getBoundingClientRect();
          const scaleX = rect.width / width;
          const scaleY = rect.height / height;
          const svgX = (e.clientX - rect.left) / scaleX;
          const n = findNearest(svgX);
          if (n) {
            setHover({
              ...n,
              leftPx: n.x * scaleX,
              topPx: n.y * scaleY,
            });
          }
        }}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="modernAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.28} />
            <stop offset="65%" stopColor="#2563eb" stopOpacity={0.06} />
            <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Y Axis Grid Lines */}
        {yTicks.map((tick, i) => {
          const isBottom = i === yTicks.length - 1;
          return (
            <g key={`y-grid-${i}`} className="chart-grid-line">
              <line
                x1={paddingLeft}
                x2={width - paddingRight}
                y1={tick.y}
                y2={tick.y}
                stroke={isBottom ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)'}
                strokeDasharray={isBottom ? 'none' : '4 4'}
                strokeWidth={1}
              />
              <text
                x={paddingLeft - 14}
                y={tick.y + 4}
                fill="#64748b"
                fontSize="12"
                fontWeight="600"
                textAnchor="end"
              >
                {tick.val}
              </text>
            </g>
          );
        })}

        {/* Shaded area */}
        {areaD && <path d={areaD} fill="url(#modernAreaGradient)" />}

        {/* Main Line with crisp subtle stroke glow */}
        {lineD && (
          <path
            d={lineD}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 4px 10px rgba(56, 189, 248, 0.45))' }}
          />
        )}

        {/* Active hover crosshair and point */}
        {hover && (
          <g className="hover-elements">
            <line
              x1={hover.x}
              x2={hover.x}
              y1={paddingTop}
              y2={baselineY}
              stroke="rgba(56, 189, 248, 0.45)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
            <circle
              cx={hover.x}
              cy={hover.y}
              r={11}
              fill="rgba(56, 189, 248, 0.28)"
            />
            <circle
              cx={hover.x}
              cy={hover.y}
              r={5.5}
              fill="#fff"
              stroke="#0284c7"
              strokeWidth={2.5}
            />
          </g>
        )}

        {/* Data points (when viewMode is 7d or year) */}
        {(viewMode === '7d' || viewMode === 'year') && coords.map((c, i) => (
          <circle
            key={`pt-${i}`}
            cx={c.x}
            cy={c.y}
            r={hover && hover.idx === i ? 6 : 4}
            fill="#38bdf8"
            stroke="#0f172a"
            strokeWidth={2}
            style={{ transition: 'r 0.15s ease' }}
          />
        ))}

        {/* X Axis Labels with generous vertical padding to prevent cutoff */}
        {(() => {
          // Select indices to display so they never overlap
          const totalPoints = coords.length;
          let displayedIndices = [];

          if (viewMode === '7d' || viewMode === 'year') {
            displayedIndices = coords.map((_, i) => i);
          } else {
            // For 30 days or month: pick ~6 to 7 evenly spaced indexes
            const targetCount = 6;
            const step = (totalPoints - 1) / (targetCount - 1);
            const indexSet = new Set();
            for (let k = 0; k < targetCount; k++) {
              indexSet.add(Math.round(k * step));
            }
            displayedIndices = Array.from(indexSet).sort((a, b) => a - b);
          }

          return displayedIndices.map((idx) => {
            const c = coords[idx];
            if (!c) return null;
            const isHovered = hover && hover.idx === idx;
            return (
              <text
                key={`x-label-${idx}`}
                x={c.x}
                y={baselineY + 28}
                fill={isHovered ? '#38bdf8' : '#94a3b8'}
                fontSize="12"
                fontWeight={isHovered ? '700' : '500'}
                textAnchor="middle"
              >
                {c.shortLabel}
              </text>
            );
          });
        })()}
      </svg>

      {hover && (
        <div
          className="chart-tooltip modern-tooltip"
          style={{
            left: `${hover.leftPx}px`,
            top: `${hover.topPx - 68}px`,
          }}
        >
          <div className="tooltip-date">{hover.fullDateLabel}</div>
          <div className="tooltip-value">
            <strong>{hover.value}</strong>
            <span>{metricLabel.toLowerCase()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = ({ onLogout }) => {
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

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const filteredEvents = useMemo(() => {
    let result = events;
    if (activeCategory === 'leads') result = events.filter((e) => e.type === 'lead_captured');
    else if (activeCategory === 'projects') result = events.filter((e) => e.type === 'project_click');
    else if (activeCategory === 'certificates') result = events.filter((e) => e.type === 'certificate_click');
    else if (activeCategory === 'messages') result = events.filter((e) => e.type === 'message_sent');
    else if (activeCategory === 'visits') result = events.filter((e) => e.type === 'page_view');

    if (typeFilter !== 'all') {
      result = result.filter((e) => e.type === typeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) => {
        const title = extractName(e.projectTitle || e.certificateTitle || e.subject || e.name || e.title || '').toLowerCase();
        const email = (e.email || '').toLowerCase();
        const desc = (e.action || e.path || '').toLowerCase();
        return title.includes(q) || email.includes(q) || desc.includes(q);
      });
    }

    return result;
  }, [events, activeCategory, typeFilter, searchQuery]);

  const recentList = useMemo(() => {
    let list = events;
    if (typeFilter !== 'all') {
      list = list.filter((e) => e.type === typeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) => {
        const title = extractName(e.projectTitle || e.certificateTitle || e.subject || e.name || e.title || '').toLowerCase();
        const email = (e.email || '').toLowerCase();
        return title.includes(q) || email.includes(q);
      });
    }
    return list.slice(0, 10);
  }, [events, typeFilter, searchQuery]);

  const categoryTitle = {
    overview: 'Visão Geral',
    leads: 'Leads Capturados',
    visits: 'Histórico de Visitas',
    messages: 'Mensagens Recebidas',
    certificates: 'Interações com Certificados',
    projects: 'Cliques em Projetos',
    reports: 'Relatórios de Performance',
    manage: 'Gerenciar Portfólio',
  }[activeCategory] || 'Eventos';

  const renderMainContent = () => {
    if (activeCategory === 'overview') {
      return (
        <>
          <section className="metrics-grid">
            <StatCard label="Total de Visitas" value={totals.pageView} helper="acessos ao site" icon={<FiMousePointer />} tone="blue" trend="Ao vivo" />
            <StatCard label="Total de Leads" value={totals.leads} helper="capturas de contato" icon={<FiUsers />} tone="purple" trend="Leads" />
            <StatCard label="Mensagens" value={totals.messages} helper="formulário enviado" icon={<FiMessageCircle />} tone="green" trend="Contatos" />
            <StatCard label="Taxa de Conversão" value={`${totals.conversion}%`} helper="leads ÷ acessos" icon={<FiBarChart2 />} tone="blue" trend={`${totals.conversion}%`} />
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
              <LineCard events={events} />
            </div>

            <article className="panel-card panel-card-table dashboard-full" id="messages">
              <div className="table-header-row">
                <div>
                  <h3>Eventos e Atividades Recentes</h3>
                  <p className="panel-subtitle">Histórico em tempo real de navegação e interações</p>
                </div>

                <div className="table-filters">
                  <div className="search-box">
                    <FiSearch />
                    <input
                      type="text"
                      placeholder="Filtrar por nome ou e-mail..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="filter-pills">
                    <button className={`filter-pill ${typeFilter === 'all' ? 'active' : ''}`} onClick={() => setTypeFilter('all')}>Todos</button>
                    <button className={`filter-pill ${typeFilter === 'lead_captured' ? 'active' : ''}`} onClick={() => setTypeFilter('lead_captured')}>Leads</button>
                    <button className={`filter-pill ${typeFilter === 'message_sent' ? 'active' : ''}`} onClick={() => setTypeFilter('message_sent')}>Mensagens</button>
                    <button className={`filter-pill ${typeFilter === 'project_click' ? 'active' : ''}`} onClick={() => setTypeFilter('project_click')}>Projetos</button>
                    <button className={`filter-pill ${typeFilter === 'page_view' ? 'active' : ''}`} onClick={() => setTypeFilter('page_view')}>Visitas</button>
                  </div>
                </div>
              </div>

              {recentList.length > 0 ? (
                <div className="events-table">
                  {recentList.map((event) => {
                    const titleText = extractName(event.projectTitle || event.certificateTitle || event.subject || event.name || event.title || 'Evento');
                    const email = event.email;

                    return (
                      <div className="event-row" key={event.id}>
                        <div className="event-main">
                          <div className="event-row-topline">
                            <span className="event-pill" style={{ background: typeColor[event.type] || 'var(--admin-muted)' }}>
                              {labelByType[event.type] || event.type}
                            </span>
                            <strong>{titleText}</strong>
                          </div>
                          <small>{email || event.action || event.path || 'Sem detalhes adicionais'}</small>
                        </div>
                        <div className="event-meta">
                          {email && (
                            <button
                              type="button"
                              className="copy-btn"
                              onClick={() => handleCopy(email, event.id)}
                              title="Copiar e-mail"
                            >
                              {copiedId === event.id ? <><FiCheck /> Copiado</> : <><FiCopy /> Copiar</>}
                            </button>
                          )}
                          <time>{formatTime(event.createdAt)}</time>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <h4>Nenhum evento encontrado</h4>
                  <p>{searchQuery ? 'Tente ajustar sua busca ou limpar os filtros.' : 'Interaja com o site ou clique em "Gerar Demo" para preencher o painel.'}</p>
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

    // Smart Dedicated View for leads, messages, or other filtered lists
    return (
      <section className="dashboard-full">
        <article className="panel-card panel-card-table dashboard-full">
          <div className="table-header-row">
            <div>
              <h3>{categoryTitle}</h3>
              <p className="panel-subtitle">Visualização detalhada ({filteredEvents.length} registros encontrados)</p>
            </div>
            <div className="table-filters">
              <div className="search-box">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Buscar nesta lista..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="button" className="admin-button ghost" onClick={() => setActiveCategory('overview')}>
                <FiHome /> Voltar ao Dashboard
              </button>
            </div>
          </div>

          {filteredEvents.length ? (
            <div className="events-table">
              {filteredEvents.map((event) => {
                const titleText = extractName(event.projectTitle || event.certificateTitle || event.subject || event.name || event.title || 'Evento');
                const email = event.email;

                return (
                  <div className="event-row" key={event.id}>
                    <div className="event-main">
                      <div className="event-row-topline">
                        <span className="event-pill" style={{ background: typeColor[event.type] || 'var(--admin-muted)' }}>
                          {labelByType[event.type] || event.type}
                        </span>
                        <strong>{titleText}</strong>
                      </div>
                      <small>{email || event.action || event.path || 'Sem detalhes adicionais'}</small>
                    </div>
                    <div className="event-meta">
                      {email && (
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => handleCopy(email, event.id)}
                          title="Copiar e-mail"
                        >
                          {copiedId === event.id ? <><FiCheck /> Copiado</> : <><FiCopy /> Copiar</>}
                        </button>
                      )}
                      <time>{formatTime(event.createdAt)}</time>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <h4>Sem registros correspondentes</h4>
              <p>Não há eventos encontrados para esta categoria ou termo de busca.</p>
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
          <a className={`sidebar-link ${activeCategory === 'manage' ? 'active' : ''}`} href="#manage" onClick={(e) => { e.preventDefault(); setActiveCategory('manage'); closeSidebar(); }}><FiEdit3 /> Gerenciar Conteúdo</a>
          <a className={`sidebar-link ${activeCategory === 'leads' ? 'active' : ''}`} href="#leads" onClick={(e) => { e.preventDefault(); setActiveCategory('leads'); closeSidebar(); }}><FiUsers /> Leads</a>
          <a className={`sidebar-link ${activeCategory === 'messages' ? 'active' : ''}`} href="#messages" onClick={(e) => { e.preventDefault(); setActiveCategory('messages'); closeSidebar(); }}><FiMessageCircle /> Mensagens</a>
          <a className={`sidebar-link ${activeCategory === 'projects' ? 'active' : ''}`} href="#projects" onClick={(e) => { e.preventDefault(); setActiveCategory('projects'); closeSidebar(); }}><FiLayers /> Cliques Projetos</a>
          <a className={`sidebar-link ${activeCategory === 'certificates' ? 'active' : ''}`} href="#certificates" onClick={(e) => { e.preventDefault(); setActiveCategory('certificates'); closeSidebar(); }}><FiAward /> Cliques Certificados</a>
          <a className={`sidebar-link ${activeCategory === 'visits' ? 'active' : ''}`} href="#visits" onClick={(e) => { e.preventDefault(); setActiveCategory('visits'); closeSidebar(); }}><FiMousePointer /> Visitas</a>
        </nav>

        <div className="sidebar-footer">
          <a className="sidebar-link muted" href="#settings" onClick={closeSidebar}><FiSettings /> Configurações</a>
          <a className="sidebar-link muted" href="/" onClick={closeSidebar} title="Navegar de volta à página inicial">
            <FiExternalLink /> Voltar ao Portfólio
          </a>
          {onLogout ? (
            <button type="button" className="sidebar-link muted sidebar-logout-btn" onClick={() => { closeSidebar(); onLogout(); }} title="Fazer logout da conta">
              <FiLogOut /> Sair (Logout)
            </button>
          ) : (
            <a className="sidebar-link muted" href="/" onClick={closeSidebar}><FiLogOut /> Sair</a>
          )}
        </div>
      </aside>

      <main className="admin-main" id="overview">
        <div className="admin-topbar">
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
              <h1>{categoryTitle}</h1>
            </div>
            <p>
              {activeCategory === 'manage'
                ? 'Adicione, edite ou remova conteúdos do portfólio em tempo real.'
                : 'Painel analítico e administrativo do Portfolio Arthur.'}
            </p>
          </div>

          <div className="admin-actions">
            {activeCategory === 'manage' ? (
              <button type="button" className="admin-button ghost" onClick={() => setActiveCategory('overview')}>
                <FiHome /> Voltar ao Dashboard
              </button>
            ) : (
              <>
                <button type="button" className="admin-button ghost" onClick={() => makeExportFile(events)} title="Exportar dados em formato CSV">
                  <FiDownload /> Exportar CSV
                </button>
                <button type="button" className="admin-button" onClick={() => { void refreshAnalyticsEvents(); }} title="Recarregar eventos em tempo real">
                  <FiRefreshCw /> Atualizar
                </button>
              </>
            )}
            <a href="/" className="admin-button ghost" title="Retornar à página principal do portfólio">
              <FiExternalLink /> Voltar ao Portfólio
            </a>
            {onLogout && (
              <button type="button" className="admin-button ghost danger-btn" onClick={onLogout} title="Encerrar sessão no painel">
                <FiLogOut /> Sair (Logout)
              </button>
            )}
          </div>
        </div>
        {renderMainContent()}

        <div className="hidden-anchor" id="settings" />
      </main>
    </div>
  );
};

export default AdminDashboard;