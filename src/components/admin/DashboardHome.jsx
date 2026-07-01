import React, { useState, useEffect } from 'react';
import KPICard from './KPICard';

export default function DashboardHome({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/leads/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="crm-dashboard-home">
      <div className="crm-section-header">
        <h2 className="crm-section-title">Business Command Center</h2>
        <p className="crm-section-subtitle">Real-time operational KPIs and performance parameters.</p>
      </div>

      <div className="crm-kpi-grid">
        <KPICard
          label="Total Leads"
          value={loading ? '...' : stats?.total}
          icon="📊"
          trend={loading ? null : `${stats?.thisMonth} this month`}
          trendType="neutral"
          loading={loading}
        />
        <KPICard
          label="Estimated Revenue"
          value={loading ? '...' : formatCurrency(stats?.revenuePipeline || 0)}
          icon="💰"
          trend={loading ? null : "Weighted pipeline"}
          trendType="positive"
          loading={loading}
        />
        <KPICard
          label="Conversion Rate"
          value={loading ? '...' : `${stats?.conversionRate}%`}
          icon="📈"
          trend={loading ? null : "Won / Total leads"}
          trendType="positive"
          loading={loading}
        />
        <KPICard
          label="Avg Lead Score"
          value={loading ? '...' : stats?.avgLeadScore}
          icon="⚡"
          trend={loading ? null : "Target priority rating"}
          trendType="positive"
          loading={loading}
        />
      </div>

      <div className="crm-kpi-grid" style={{ marginTop: '16px' }}>
        <KPICard
          label="Today's Leads"
          value={loading ? '...' : stats?.today}
          icon="📅"
          trend={loading ? null : "Leads last 24h"}
          trendType={stats?.today > 0 ? 'positive' : 'neutral'}
          loading={loading}
        />
        <KPICard
          label="Meetings Booked"
          value={loading ? '...' : stats?.meetingsScheduled}
          icon="📆"
          trend={loading ? null : "Pending call links"}
          trendType="neutral"
          loading={loading}
        />
        <KPICard
          label="Total Visitors"
          value={loading ? '...' : stats?.totalVisitors}
          icon="👤"
          trend={loading ? null : `${stats?.returningVisitors} returning`}
          trendType="neutral"
          loading={loading}
        />
        <KPICard
          label="Filtered Spam"
          value={loading ? '...' : stats?.spamLeads}
          icon="🛡️"
          trend={loading ? null : "Spam index > 60"}
          trendType={stats?.spamLeads > 0 ? 'negative' : 'neutral'}
          loading={loading}
        />
      </div>

      <div className="crm-analytics-row" style={{ marginTop: '24px' }}>
        {/* Services & Countries */}
        <div className="crm-analytics-card">
          <h3 className="crm-card-title">Services &amp; Locations</h3>
          <div className="crm-card-grid">
            <div>
              <h4 className="crm-subtitle-small">Requested Services</h4>
              {loading ? (
                <div className="skeleton-line mb-8"></div>
              ) : stats?.topServices?.length === 0 ? (
                <p className="text-muted text-xs">No services tracked yet</p>
              ) : (
                <div className="crm-distribution-list">
                  {stats?.topServices?.map((item) => (
                    <div key={item.name} className="crm-distribution-row">
                      <span className="dist-label">{item.name}</span>
                      <span className="dist-value">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h4 className="crm-subtitle-small">Top Country Demographics</h4>
              {loading ? (
                <div className="skeleton-line mb-8"></div>
              ) : stats?.topCountries?.length === 0 ? (
                <p className="text-muted text-xs">No locations captured yet</p>
              ) : (
                <div className="crm-distribution-list">
                  {stats?.topCountries?.map((item) => (
                    <div key={item.name} className="crm-distribution-row">
                      <span className="dist-label">{item.name}</span>
                      <span className="dist-value">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Traffic Channels & Devices */}
        <div className="crm-analytics-card">
          <h3 className="crm-card-title">Attribution &amp; Technology</h3>
          <div className="crm-card-grid">
            <div>
              <h4 className="crm-subtitle-small">Campaign / Traffic Sources</h4>
              {loading ? (
                <div className="skeleton-line mb-8"></div>
              ) : stats?.topSources?.length === 0 ? (
                <p className="text-muted text-xs">No source tags captured</p>
              ) : (
                <div className="crm-distribution-list">
                  {stats?.topSources?.map((item) => (
                    <div key={item.name} className="crm-distribution-row">
                      <span className="dist-label">{item.name}</span>
                      <span className="dist-value">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h4 className="crm-subtitle-small">Hardware Devices</h4>
              {loading ? (
                <div className="skeleton-line mb-8"></div>
              ) : !stats?.deviceBreakdown || Object.keys(stats.deviceBreakdown).length === 0 ? (
                <p className="text-muted text-xs">No client device reports</p>
              ) : (
                <div className="crm-distribution-list">
                  {Object.entries(stats.deviceBreakdown).map(([device, count]) => (
                    <div key={device} className="crm-distribution-row">
                      <span className="dist-label" style={{ textTransform: 'capitalize' }}>{device}</span>
                      <span className="dist-value">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
