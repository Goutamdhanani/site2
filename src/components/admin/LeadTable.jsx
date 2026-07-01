import React, { useState, useEffect, useCallback } from 'react';
import StatusBadge from './StatusBadge';
import SearchBar from './SearchBar';
import ExportButton from './ExportButton';

export default function LeadTable({ onSelectLead }) {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Filters and Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortDir
      });

      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (search) params.append('search', search);

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.data || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, priority, search, sortBy, sortDir]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearch = (term) => {
    setSearch(term);
    setPage(1); // Reset page to first
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="crm-leads-table-container">
      <div className="crm-filters-bar">
        <SearchBar onSearch={handleSearch} />
        
        <div className="crm-filter-selectors">
          <select
            className="crm-select-filter"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Meeting Scheduled">Meeting Scheduled</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>

          <select
            className="crm-select-filter"
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <ExportButton filters={{ status, priority, search }} />
        </div>
      </div>

      <div className="crm-table-wrapper">
        <table className="crm-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('lead_id')} className="sortable">
                Lead ID {sortBy === 'lead_id' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => handleSort('name')} className="sortable">
                Client {sortBy === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => handleSort('company')} className="sortable">
                Company {sortBy === 'company' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => handleSort('status')} className="sortable">
                Status {sortBy === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => handleSort('priority')} className="sortable">
                Priority {sortBy === 'priority' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => handleSort('lead_score')} className="sortable">
                Score {sortBy === 'lead_score' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => handleSort('meeting_date')} className="sortable">
                Meeting {sortBy === 'meeting_date' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => handleSort('created_at')} className="sortable">
                Created {sortBy === 'created_at' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td colSpan="9"><div className="skeleton-line"></div></td>
                </tr>
              ))
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                  No lead records found matching current query criteria.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="crm-table-row">
                  <td><strong style={{ fontFamily: 'monospace' }}>{lead.lead_id}</strong></td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{lead.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lead.email}</div>
                  </td>
                  <td>{lead.company || '—'}</td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td>
                    <span className={`priority-tag ${lead.priority?.toLowerCase()}`}>
                      {lead.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`score-badge ${lead.lead_score >= 70 ? 'high' : lead.lead_score >= 40 ? 'med' : 'low'}`}>
                      {lead.lead_score}
                    </span>
                  </td>
                  <td>
                    {lead.meeting_date && lead.meeting_date !== 'Not scheduled' ? (
                      <div>
                        <div style={{ fontWeight: '500' }}>{lead.meeting_date}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lead.meeting_time}</div>
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>{formatDate(lead.created_at)}</td>
                  <td>
                    <button
                      className="btn-action-small"
                      onClick={() => onSelectLead(lead)}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="crm-pagination-bar">
          <span className="pagination-info">
            Showing <strong>{leads.length}</strong> of <strong>{total}</strong> leads
          </span>
          <div className="pagination-controls">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-page-nav"
            >
              Previous
            </button>
            <span className="page-indicator">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-page-nav"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
