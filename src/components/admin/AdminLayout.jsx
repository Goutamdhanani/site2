import React, { useState } from 'react';
import DashboardHome from './DashboardHome';
import LeadTable from './LeadTable';
import LeadDrawer from './LeadDrawer';

export default function AdminLayout({ adminUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLead, setSelectedLead] = useState(null);
  const [tableRefreshKey, setTableRefreshKey] = useState(0);

  const handleLogoutClick = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        onLogout();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleLeadUpdated = () => {
    // Increment refresh key to trigger tables reload
    setTableRefreshKey(prev => prev + 1);
  };

  return (
    <div className="crm-admin-layout">
      {/* Sidebar Navigation */}
      <aside className="crm-sidebar">
        <div className="sidebar-brand">
          odd<span style={{ color: 'var(--accent-ember)' }}>webs</span> CRM
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setSelectedLead(null); }}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          
          <button
            className={`nav-item ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => { setActiveTab('leads'); setSelectedLead(null); }}
          >
            <span className="nav-icon">💼</span>
            Leads Management
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <div className="admin-meta">
              <span className="admin-email">{adminUser?.email}</span>
              <span className="admin-role">Owner / Administrator</span>
            </div>
          </div>
          <button onClick={handleLogoutClick} className="btn-logout">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '8px' }}
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="crm-workspace">
        {/* Top bar header */}
        <header className="crm-topbar">
          <div className="crm-topbar-breadcrumb">
            <span className="text-muted">oddwebs Admin</span>
            <span style={{ margin: '0 8px', opacity: 0.3 }}>/</span>
            <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{activeTab}</span>
          </div>

          <button
            onClick={() => window.location.hash = ''}
            className="btn-ghost-small"
          >
            Return to Site &rarr;
          </button>
        </header>

        {/* Page Views Switch */}
        <div className="crm-page-container">
          {activeTab === 'dashboard' && (
            <DashboardHome />
          )}

          {activeTab === 'leads' && (
            <LeadTable
              key={tableRefreshKey}
              onSelectLead={setSelectedLead}
            />
          )}
        </div>
      </main>

      {/* Lead details drawer panel overlay */}
      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onLeadUpdated={handleLeadUpdated}
        />
      )}
    </div>
  );
}
