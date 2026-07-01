import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Real Analytics Dashboard — No fake data, no placeholders.
 * All metrics are computed from actual tracked events in window.__oddwebs_analytics_events
 * and live browser Performance APIs.
 */
export default function AnalyticsDashboard({ onViewChange }) {
  const [liveEvents, setLiveEvents] = useState([]);
  const [webVitals, setWebVitals] = useState({ lcp: null, inp: null, cls: null, fcp: null, ttfb: null });
  const [sessionStart] = useState(() => Date.now());
  const [engagementTime, setEngagementTime] = useState('0s');
  const engagementRef = useRef(null);

  // ─── Compute all stats from REAL event data ───
  const computeStats = useCallback((events) => {
    const pageViews = events.filter(e => e.name === 'page_view').length;
    const bookings = events.filter(e => e.name === 'booking_confirmed').length;
    const ctaClicks = events.filter(e => e.name === 'cta_click').length;
    const ctaHovers = events.filter(e => e.name === 'cta_hover').length;
    const formStarts = events.filter(e => e.name === 'form_start').length;
    const formSuccesses = events.filter(e => e.name === 'form_success').length;
    const formErrors = events.filter(e => e.name === 'form_validation_error').length;
    const calendarOpened = events.filter(e => e.name === 'calendar_opened').length;
    const dateSelected = events.filter(e => e.name === 'date_selected').length;
    const timeSelected = events.filter(e => e.name === 'time_selected').length;
    const scrollEvents = events.filter(e => e.name === 'scroll_depth');
    const fieldFocus = events.filter(e => e.name === 'form_field_focus');
    const fieldCompleted = events.filter(e => e.name === 'form_field_completed');

    // Unique pages visited
    const uniquePages = new Set(events.filter(e => e.name === 'page_view').map(e => e.params?.page_path)).size;

    // Scroll depth breakdown
    const scrollDepths = { 25: 0, 50: 0, 75: 0, 100: 0 };
    scrollEvents.forEach(e => {
      const depth = parseInt(e.params?.depth_percent || e.params?.scroll_percent || '0');
      if (depth >= 100) scrollDepths[100]++;
      else if (depth >= 75) scrollDepths[75]++;
      else if (depth >= 50) scrollDepths[50]++;
      else if (depth >= 25) scrollDepths[25]++;
    });

    // Conversion rate: bookings / unique sessions (page_views as proxy)
    const conversionRate = pageViews > 0 ? ((bookings / pageViews) * 100).toFixed(2) : '0.00';

    // Form drop-off: fields focused vs completed
    const fieldDropoff = {};
    fieldFocus.forEach(e => {
      const field = e.params?.field_name || 'unknown';
      if (!fieldDropoff[field]) fieldDropoff[field] = { focused: 0, completed: 0 };
      fieldDropoff[field].focused++;
    });
    fieldCompleted.forEach(e => {
      const field = e.params?.field_name || 'unknown';
      if (!fieldDropoff[field]) fieldDropoff[field] = { focused: 0, completed: 0 };
      fieldDropoff[field].completed++;
    });

    return {
      total: events.length,
      pageViews,
      bookings,
      ctaClicks,
      ctaHovers,
      formStarts,
      formSuccesses,
      formErrors,
      calendarOpened,
      dateSelected,
      timeSelected,
      uniquePages,
      scrollDepths,
      conversionRate,
      fieldDropoff
    };
  }, []);

  const [stats, setStats] = useState(() => computeStats([]));

  // ─── Live engagement timer ───
  useEffect(() => {
    engagementRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      setEngagementTime(mins > 0 ? `${mins}m ${secs}s` : `${secs}s`);
    }, 1000);
    return () => clearInterval(engagementRef.current);
  }, [sessionStart]);

  // ─── Measure REAL Web Vitals via PerformanceObserver ───
  useEffect(() => {
    // LCP
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          setWebVitals(prev => ({ ...prev, lcp: lastEntry.startTime }));
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) { /* browser doesn't support */ }

    // FCP
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries.find(e => e.name === 'first-contentful-paint');
        if (fcp) {
          setWebVitals(prev => ({ ...prev, fcp: fcp.startTime }));
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (e) { /* browser doesn't support */ }

    // CLS
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        setWebVitals(prev => ({ ...prev, cls: clsValue }));
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) { /* browser doesn't support */ }

    // TTFB from navigation timing
    try {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        const nav = navEntries[0];
        setWebVitals(prev => ({ ...prev, ttfb: nav.responseStart - nav.requestStart }));
      }
    } catch (e) { /* */ }
  }, []);

  // ─── Populate from existing events + listen for new ones ───
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__oddwebs_analytics_events) {
      const existing = [...window.__oddwebs_analytics_events];
      setLiveEvents(existing);
      setStats(computeStats(existing));
    }

    const handleNewEvent = (e) => {
      const newEvent = e.detail;
      setLiveEvents(prev => {
        const updated = [newEvent, ...prev].slice(0, 100);
        setStats(computeStats(updated));
        return updated;
      });
    };

    window.addEventListener('oddwebs-analytics-trigger', handleNewEvent);
    return () => window.removeEventListener('oddwebs-analytics-trigger', handleNewEvent);
  }, [computeStats]);

  // ─── Web Vitals rating helpers ───
  const getVitalRating = (metric, value) => {
    if (value === null) return { label: 'Measuring…', color: 'gray', percent: 0 };
    switch (metric) {
      case 'lcp':
        if (value <= 2500) return { label: 'Good', color: 'green', percent: Math.min(100, (1 - value / 4000) * 100) };
        if (value <= 4000) return { label: 'Needs Work', color: 'orange', percent: 50 };
        return { label: 'Poor', color: 'red', percent: 20 };
      case 'fcp':
        if (value <= 1800) return { label: 'Good', color: 'green', percent: Math.min(100, (1 - value / 3000) * 100) };
        if (value <= 3000) return { label: 'Needs Work', color: 'orange', percent: 50 };
        return { label: 'Poor', color: 'red', percent: 20 };
      case 'cls':
        if (value <= 0.1) return { label: 'Good', color: 'green', percent: Math.min(100, (1 - value / 0.25) * 100) };
        if (value <= 0.25) return { label: 'Needs Work', color: 'orange', percent: 50 };
        return { label: 'Poor', color: 'red', percent: 20 };
      case 'ttfb':
        if (value <= 800) return { label: 'Good', color: 'green', percent: Math.min(100, (1 - value / 1800) * 100) };
        if (value <= 1800) return { label: 'Needs Work', color: 'orange', percent: 50 };
        return { label: 'Poor', color: 'red', percent: 20 };
      default:
        return { label: '—', color: 'gray', percent: 0 };
    }
  };

  const formatMs = (ms) => {
    if (ms === null) return '—';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const renderParamValue = (val) => {
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  // ─── Funnel computed from real events ───
  const funnelSteps = [
    { name: '1. Page Views', count: stats.pageViews, icon: '📄' },
    { name: '2. CTA Clicks', count: stats.ctaClicks, icon: '🖱️' },
    { name: '3. Form Started', count: stats.formStarts, icon: '📝' },
    { name: '4. Calendar Opened', count: stats.calendarOpened, icon: '📅' },
    { name: '5. Date Selected', count: stats.dateSelected, icon: '📆' },
    { name: '6. Demo Confirmed', count: stats.bookings, icon: '✅' },
  ];
  const funnelMax = Math.max(1, funnelSteps[0].count);

  return (
    <div className="analytics-dashboard">
      {/* Dashboard Top Header */}
      <div className="analytics-header">
        <div>
          <h1 className="analytics-title">
            PRODUCT INTEL <span className="analytics-beta">LIVE DATA</span>
          </h1>
          <p className="analytics-subtitle">All metrics computed from real tracked events. No placeholders.</p>
        </div>
        <button className="analytics-close-btn" onClick={() => onViewChange('home')}>
          Return to Site &rarr;
        </button>
      </div>

      {/* Overview Cards — ALL REAL */}
      <div className="analytics-stats-grid">
        <div className="analytics-stat-card">
          <span className="stat-label">EVENTS TRACKED</span>
          <div className="stat-value-container">
            <span className="stat-value pulse-green">{stats.total}</span>
            <span className="stat-indicator green-blink"></span>
          </div>
          <span className="stat-trend text-green">● Live from this session</span>
        </div>

        <div className="analytics-stat-card">
          <span className="stat-label">PAGE VIEWS</span>
          <div className="stat-value">{stats.pageViews}</div>
          <span className="stat-trend text-orange">{stats.uniquePages} unique pages visited</span>
        </div>

        <div className="analytics-stat-card">
          <span className="stat-label">DEMO BOOKINGS</span>
          <div className="stat-value text-glow-orange">{stats.bookings}</div>
          <span className="stat-trend text-green">Conversion: {stats.conversionRate}%</span>
        </div>

        <div className="analytics-stat-card">
          <span className="stat-label">SESSION TIME</span>
          <div className="stat-value">{engagementTime}</div>
          <span className="stat-trend text-blue">● Live timer (this session)</span>
        </div>
      </div>

      {/* Row 2: Real Funnel + Real Web Vitals */}
      <div className="analytics-row">
        <div className="analytics-card flex-2">
          <h3 className="card-title">Conversion Funnel (Real Events)</h3>
          <div className="funnel-container">
            {funnelSteps.map((step, i) => {
              const pct = funnelMax > 0 ? ((step.count / funnelMax) * 100).toFixed(1) : 0;
              const prevCount = i > 0 ? funnelSteps[i - 1].count : step.count;
              const dropoff = prevCount > 0 && i > 0
                ? ((1 - step.count / prevCount) * 100).toFixed(0)
                : null;
              return (
                <div className="funnel-step" key={step.name}>
                  <div className="funnel-step-header">
                    <span className="funnel-step-name">{step.icon} {step.name}</span>
                    <span className="funnel-step-stats">
                      {step.count} {step.count === 1 ? 'event' : 'events'} ({pct}%)
                    </span>
                  </div>
                  <div className="funnel-progress-bg">
                    <div
                      className={i === funnelSteps.length - 1 ? 'funnel-progress-fill-booking' : 'funnel-progress-fill'}
                      style={{ width: `${Math.max(pct, step.count > 0 ? 2 : 0)}%` }}
                    />
                  </div>
                  {dropoff !== null && step.count < prevCount && (
                    <span className="funnel-drop-off">Dropoff: {dropoff}% lost</span>
                  )}
                </div>
              );
            })}
            {stats.total === 0 && (
              <div className="telemetry-empty" style={{ padding: '20px 0' }}>
                <span className="pulse-gray">No funnel data yet.</span>
                <p>Navigate the site to generate real funnel events.</p>
              </div>
            )}
          </div>
        </div>

        <div className="analytics-card flex-1">
          <h3 className="card-title">Core Web Vitals (Live Measurement)</h3>
          <div className="vitals-grid">
            {[
              { key: 'lcp', name: 'LCP (Largest Contentful Paint)', threshold: '< 2.5s', val: webVitals.lcp },
              { key: 'fcp', name: 'FCP (First Contentful Paint)', threshold: '< 1.8s', val: webVitals.fcp },
              { key: 'cls', name: 'CLS (Cumulative Layout Shift)', threshold: '< 0.1', val: webVitals.cls },
              { key: 'ttfb', name: 'TTFB (Time to First Byte)', threshold: '< 800ms', val: webVitals.ttfb },
            ].map(vital => {
              const rating = getVitalRating(vital.key, vital.val);
              return (
                <div className="vital-item" key={vital.key}>
                  <div className="vital-name">{vital.name}</div>
                  <div className="vital-bar-container">
                    <div
                      className={`vital-bar-fill ${rating.color}`}
                      style={{ width: `${vital.val !== null ? Math.max(rating.percent, 5) : 0}%` }}
                    />
                  </div>
                  <div className="vital-value-row">
                    <span className={`text-${rating.color}`}>
                      {vital.key === 'cls'
                        ? (vital.val !== null ? vital.val.toFixed(3) : '—')
                        : formatMs(vital.val)
                      } ({rating.label})
                    </span>
                    <span className="vital-threshold">Threshold: {vital.threshold}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="vitals-vibe-box">
            <div className="vibe-text">
              <strong>Measured Live</strong>: Values above come from your browser's PerformanceObserver API during this page load. They reflect real performance, not estimates.
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Real-Time Event Log + Scroll/Interaction Breakdown */}
      <div className="analytics-row">
        <div className="analytics-card flex-2">
          <h3 className="card-title live-logger-title">
            <span>Real-Time Event Stream</span>
            <span className="live-pill">LIVE FEED</span>
          </h3>
          <div className="telemetry-log-container">
            {liveEvents.length === 0 ? (
              <div className="telemetry-empty">
                <span className="pulse-gray">Waiting for user actions...</span>
                <p>Navigate the site — click CTAs, open booking, scroll pages — to see real events appear here.</p>
              </div>
            ) : (
              <table className="telemetry-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Event</th>
                    <th>Location</th>
                    <th>Parameters</th>
                  </tr>
                </thead>
                <tbody>
                  {liveEvents.map((evt) => (
                    <tr key={evt.id} className="telemetry-row-item">
                      <td className="tel-time">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="tel-name">
                        <code>{evt.name}</code>
                      </td>
                      <td className="tel-path">
                        {evt.params.path || evt.params.cta_id || 'Global'}
                      </td>
                      <td className="tel-params">
                        <div className="params-list">
                          {Object.keys(evt.params)
                            .filter(k => k !== 'path' && k !== 'url' && k !== 'screen' && k !== 'userAgent')
                            .map(key => (
                              <span key={key} className="param-tag">
                                <strong>{key}</strong>: {renderParamValue(evt.params[key])}
                              </span>
                            ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Real Interaction Summary */}
        <div className="analytics-card flex-1">
          <h3 className="card-title">Interaction Breakdown</h3>
          <div className="dropoff-stats">
            {[
              { label: 'CTA Clicks', value: stats.ctaClicks, color: 'green' },
              { label: 'CTA Hovers', value: stats.ctaHovers, color: 'green' },
              { label: 'Form Starts', value: stats.formStarts, color: 'green' },
              { label: 'Form Successes', value: stats.formSuccesses, color: 'green' },
              { label: 'Validation Errors', value: stats.formErrors, color: stats.formErrors > 0 ? 'red' : 'green' },
            ].map(item => (
              <div className="dropoff-item" key={item.label}>
                <div className="dropoff-info">
                  <span>{item.label}</span>
                  <span className={`dropoff-percent text-${item.color}`}>{item.value}</span>
                </div>
                <div className="dropoff-progress">
                  <div
                    className={`dropoff-fill ${item.color}`}
                    style={{ width: `${stats.total > 0 ? Math.max((item.value / stats.total) * 100, item.value > 0 ? 3 : 0) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="vitals-vibe-box mt-16">
            <h4 className="vitals-subtitle-small">Scroll Depth (This Session)</h4>
            <div className="channel-list">
              {Object.entries(stats.scrollDepths).map(([depth, count]) => (
                <div className="channel-row" key={depth}>
                  <span>Reached {depth}%</span>
                  <strong>{count}×</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="vitals-vibe-box mt-16">
            <h4 className="vitals-subtitle-small">Form Field Drop-off</h4>
            <div className="channel-list">
              {Object.keys(stats.fieldDropoff).length === 0 ? (
                <div className="channel-row">
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No form interactions yet</span>
                </div>
              ) : (
                Object.entries(stats.fieldDropoff).map(([field, data]) => (
                  <div className="channel-row" key={field}>
                    <span>{field}</span>
                    <strong>{data.completed}/{data.focused} completed</strong>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
