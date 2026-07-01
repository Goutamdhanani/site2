import React from 'react';

export default function KPICard({ label, value, icon, trend, trendType, loading }) {
  if (loading) {
    return (
      <div className="crm-kpi-card skeleton-card">
        <div className="skeleton-line short mb-12"></div>
        <div className="skeleton-line tall mb-8"></div>
        <div className="skeleton-line medium"></div>
      </div>
    );
  }

  const isPositive = trendType === 'positive';
  const isNegative = trendType === 'negative';
  const trendColor = isPositive ? '#22c55e' : isNegative ? '#ef4444' : 'var(--text-muted)';

  return (
    <div className="crm-kpi-card">
      <div className="kpi-card-header">
        <span className="kpi-label">{label}</span>
        <span className="kpi-icon">{icon}</span>
      </div>
      <div className="kpi-value">{value}</div>
      {trend && (
        <div className="kpi-trend" style={{ color: trendColor }}>
          <span style={{ marginRight: '4px' }}>
            {isPositive ? '↑' : isNegative ? '↓' : '●'}
          </span>
          {trend}
        </div>
      )}
    </div>
  );
}
