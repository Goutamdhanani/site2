import React, { useState } from 'react';

export default function ExportButton({ filters }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Build query string matching current table state
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const url = `/api/leads/export?${params.toString()}`;
      
      // Open hidden frame or trigger native browser download via link click
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Export download triggered error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="btn-export"
      title="Export all records matching current filters to CSV"
    >
      {exporting ? (
        <>
          <span className="spinner-border spinner-border-sm" style={{ marginRight: '8px' }}></span>
          Exporting...
        </>
      ) : (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: '6px' }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export CSV
        </>
      )}
    </button>
  );
}
