import React from 'react';

const STATUS_CONFIGS = {
  'New': { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' },
  'Contacted': { bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.2)', color: '#eab308' },
  'Meeting Scheduled': { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' },
  'Proposal Sent': { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' },
  'Negotiation': { bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.2)', color: '#f97316' },
  'Won': { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', color: '#10b981' },
  'Lost': { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', color: '#ef4468' },
  'Archived': { bg: 'rgba(156, 163, 175, 0.1)', border: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af' }
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIGS[status] || { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' };

  return (
    <span
      className="crm-badge"
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        padding: '4px 8px',
        borderRadius: '100px',
        fontSize: '11px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        letterSpacing: '0.03em'
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: config.color,
          marginRight: '6px',
          display: 'inline-block'
        }}
      />
      {status}
    </span>
  );
}
