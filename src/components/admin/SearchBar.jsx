import React, { useState, useEffect, useRef } from 'react';

export default function SearchBar({ onSearch, placeholder }) {
  const [term, setTerm] = useState('');
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Clear any active timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Set debounce delay
    timeoutRef.current = setTimeout(() => {
      onSearch(term);
    }, 350);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [term, onSearch]);

  return (
    <div className="crm-search-container">
      <svg
        className="crm-search-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input
        type="text"
        className="crm-search-input"
        placeholder={placeholder || "Search name, email, company..."}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      {term && (
        <button
          type="button"
          className="crm-search-clear"
          onClick={() => setTerm('')}
        >
          &times;
        </button>
      )}
    </div>
  );
}
