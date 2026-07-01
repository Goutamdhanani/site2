import React, { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';

export default function LeadDrawer({ lead, onClose, onLeadUpdated }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Status/Priority local editable states
  const [status, setStatus] = useState(lead.status);
  const [priority, setPriority] = useState(lead.priority);
  const [assignedTo, setAssignedTo] = useState(lead.assigned_to || 'Unassigned');
  
  // Notes states
  const [notes, setNotes] = useState(() => {
    try {
      return typeof lead.internal_notes === 'string' 
        ? JSON.parse(lead.internal_notes) 
        : (lead.internal_notes || []);
    } catch {
      return [];
    }
  });
  const [newNoteText, setNewNoteText] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setStatus(lead.status);
    setPriority(lead.priority);
    setAssignedTo(lead.assigned_to || 'Unassigned');
    try {
      setNotes(typeof lead.internal_notes === 'string' 
        ? JSON.parse(lead.internal_notes) 
        : (lead.internal_notes || []));
    } catch {
      setNotes([]);
    }
  }, [lead]);

  const handleUpdate = async (field, value) => {
    try {
      setUpdating(true);
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lead_id: lead.lead_id,
          [field]: value
        })
      });

      if (res.ok) {
        const data = await res.json();
        onLeadUpdated();
      }
    } catch (err) {
      console.error('Error updating lead property:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const note = {
      id: Math.random().toString(36).substring(2, 9),
      text: newNoteText.trim(),
      timestamp: new Date().toISOString(),
      author: 'Admin'
    };

    const updatedNotes = [...notes, note];

    try {
      setUpdating(true);
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lead_id: lead.lead_id,
          internal_notes: updatedNotes
        })
      });

      if (res.ok) {
        setNotes(updatedNotes);
        setNewNoteText('');
        onLeadUpdated();
      }
    } catch (err) {
      console.error('Error adding note to CRM record:', err);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="crm-drawer-backdrop" onClick={onClose}>
      <div className="crm-drawer" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="crm-drawer-header">
          <div>
            <div className="crm-drawer-id">{lead.lead_id}</div>
            <h3 className="crm-drawer-title">{lead.name}</h3>
          </div>
          <button className="crm-drawer-close" onClick={onClose}>&times;</button>
        </div>

        {/* Quick controls bar */}
        <div className="crm-drawer-controls">
          <div className="crm-control-item">
            <label className="crm-control-label">Status</label>
            <select
              className="crm-select-control"
              value={status}
              onChange={(e) => { setStatus(e.target.value); handleUpdate('status', e.target.value); }}
              disabled={updating}
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Meeting Scheduled">Meeting Scheduled</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div className="crm-control-item">
            <label className="crm-control-label">Priority</label>
            <select
              className="crm-select-control"
              value={priority}
              onChange={(e) => { setPriority(e.target.value); handleUpdate('priority', e.target.value); }}
              disabled={updating}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="crm-control-item">
            <label className="crm-control-label">Owner</label>
            <select
              className="crm-select-control"
              value={assignedTo}
              onChange={(e) => { setAssignedTo(e.target.value); handleUpdate('assigned_to', e.target.value); }}
              disabled={updating}
            >
              <option value="Unassigned">Unassigned</option>
              <option value="Goutam Dhanani">Goutam Dhanani</option>
              <option value="Sales Team">Sales Team</option>
            </select>
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="crm-drawer-tabs">
          <button
            className={`crm-drawer-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`crm-drawer-tab ${activeTab === 'attribution' ? 'active' : ''}`}
            onClick={() => setActiveTab('attribution')}
          >
            Attribution
          </button>
          <button
            className={`crm-drawer-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Telemetry
          </button>
          <button
            className={`crm-drawer-tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Notes ({notes.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="crm-drawer-content">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="crm-drawer-tab-content">
              <div className="crm-detail-section">
                <h4 className="crm-detail-sec-title">Contact &amp; Corporate</h4>
                <div className="crm-detail-grid">
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Email Address</span>
                    <span className="crm-detail-val">
                      {lead.email ? <a href={`mailto:${lead.email}`} className="text-link">{lead.email}</a> : '—'}
                    </span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">WhatsApp / Phone</span>
                    <span className="crm-detail-val">
                      {lead.phone ? <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-link">{lead.phone}</a> : '—'}
                    </span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Company Name</span>
                    <span className="crm-detail-val">{lead.company || '—'}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Client Timezone</span>
                    <span className="crm-detail-val">{lead.timezone || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="crm-detail-section">
                <h4 className="crm-detail-sec-title">Services &amp; Calendar target</h4>
                <div className="crm-detail-grid">
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Requested Service</span>
                    <span className="crm-detail-val" style={{ color: 'var(--accent-ember)', fontWeight: '600' }}>
                      {Array.isArray(lead.services) ? lead.services.join(', ') : lead.services || 'General Inquiry'}
                    </span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Scheduled Date</span>
                    <span className="crm-detail-val">{lead.meeting_date || 'Not scheduled'}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Scheduled Time</span>
                    <span className="crm-detail-val">{lead.meeting_time || 'Not scheduled'}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Budget Range</span>
                    <span className="crm-detail-val" style={{ color: '#22c55e', fontWeight: 'bold' }}>{lead.budget || 'Under $5,000'}</span>
                  </div>
                </div>
              </div>

              <div className="crm-detail-section">
                <h4 className="crm-detail-sec-title">Project description brief</h4>
                <div className="crm-description-box">
                  {lead.description || 'No description provided.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTRIBUTION */}
          {activeTab === 'attribution' && (
            <div className="crm-drawer-tab-content">
              <div className="crm-detail-section">
                <h4 className="crm-detail-sec-title">Traffic Source Attribution</h4>
                <div className="crm-detail-grid full-width">
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Attribution Channel</span>
                    <span className="crm-detail-val" style={{ textTransform: 'capitalize' }}>{lead.source || 'direct'}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Referral URL</span>
                    <span className="crm-detail-val text-xs text-truncate" title={lead.referral_url}>
                      {lead.referral_url || 'direct (no referrer)'}
                    </span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Landing Page URL</span>
                    <span className="crm-detail-val text-xs text-truncate" title={lead.landing_page}>
                      {lead.landing_page || '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="crm-detail-section">
                <h4 className="crm-detail-sec-title">Campaign UTM parameters</h4>
                <div className="crm-detail-grid">
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">UTM Source</span>
                    <span className="crm-detail-val">{lead.utm_source || '—'}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">UTM Medium</span>
                    <span className="crm-detail-val">{lead.utm_medium || '—'}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">UTM Campaign</span>
                    <span className="crm-detail-val">{lead.utm_campaign || '—'}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">UTM Term / Keyword</span>
                    <span className="crm-detail-val">{lead.utm_term || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TELEMETRY */}
          {activeTab === 'analytics' && (
            <div className="crm-drawer-tab-content">
              <div className="crm-detail-section">
                <h4 className="crm-detail-sec-title">System &amp; Device profiling</h4>
                <div className="crm-detail-grid">
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Device Category</span>
                    <span className="crm-detail-val" style={{ textTransform: 'capitalize' }}>{lead.device_type}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Operating System</span>
                    <span className="crm-detail-val">{lead.os || 'unknown'}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Browser Engine</span>
                    <span className="crm-detail-val">{lead.browser} {lead.browser_version}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Screen Dimensions</span>
                    <span className="crm-detail-val">{lead.screen_size || 'unknown'}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Viewport Size</span>
                    <span className="crm-detail-val">{lead.viewport_size || 'unknown'}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Browser Language</span>
                    <span className="crm-detail-val">{lead.language || 'en-US'}</span>
                  </div>
                </div>
              </div>

              <div className="crm-detail-section">
                <h4 className="crm-detail-sec-title">Location parameters</h4>
                <div className="crm-detail-grid">
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Country</span>
                    <span className="crm-detail-val">{lead.country || 'Unknown'}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Region / State</span>
                    <span className="crm-detail-val">{lead.region || 'Unknown'}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">City</span>
                    <span className="crm-detail-val">{lead.city || 'Unknown'}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Session ID</span>
                    <span className="crm-detail-val text-xs text-truncate" style={{ fontFamily: 'monospace' }}>{lead.session_id || 'unknown'}</span>
                  </div>
                </div>
              </div>

              <div className="crm-detail-section">
                <h4 className="crm-detail-sec-title">Behavioural metrics</h4>
                <div className="crm-detail-grid">
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Scroll Depth Reached</span>
                    <span className="crm-detail-val">{lead.scroll_percentage || '0%'}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Form filling duration</span>
                    <span className="crm-detail-val">{lead.form_completion_time ? `${lead.form_completion_time}s` : 'unknown'}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Time Spent on Page</span>
                    <span className="crm-detail-val">{lead.time_on_page || 'unknown'}</span>
                  </div>
                  <div className="crm-detail-item">
                    <span className="crm-detail-label">Visit Number</span>
                    <span className="crm-detail-val">#{lead.visit_number || '1'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTES */}
          {activeTab === 'notes' && (
            <div className="crm-drawer-tab-content">
              <div className="crm-notes-list">
                {notes.length === 0 ? (
                  <p className="text-muted text-xs" style={{ fontStyle: 'italic', padding: '12px 0' }}>
                    No internal notes left on this lead yet.
                  </p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="crm-note-item">
                      <div className="crm-note-header">
                        <span className="crm-note-author">{note.author}</span>
                        <span className="crm-note-time">{formatDate(note.timestamp)}</span>
                      </div>
                      <p className="crm-note-text">{note.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddNote} className="crm-note-form">
                <textarea
                  className="crm-textarea"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add an internal follow-up comment or status detail..."
                  rows={3}
                  required
                />
                <button type="submit" className="btn-primary btn-note-submit magnetic">
                  Add comment
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
