import React, { useState } from 'react';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryAfter, setRetryAfter] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data);
      } else {
        setError(data.error || 'Authentication failed. Please check credentials.');
        if (data.retryAfter) {
          setRetryAfter(data.retryAfter);
          // Auto countdown
          const timer = setInterval(() => {
            setRetryAfter((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection failed. Verify API routes are active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crm-login-wrapper">
      <div className="crm-login-card">
        <div className="crm-login-logo">
          odd<span style={{ color: 'var(--accent-ember)' }}>webs</span> CRM
        </div>
        <p className="crm-login-subtitle">
          Secure Administrative Portal Access
        </p>

        {error && (
          <div className="crm-login-error">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '6px', flexShrink: 0, marginTop: '2px' }}
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="crm-input-group">
            <label className="crm-label">Admin Email</label>
            <input
              type="email"
              className="crm-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@oddwebs.com"
              required
              disabled={loading || retryAfter > 0}
            />
          </div>

          <div className="crm-input-group">
            <label className="crm-label">Password</label>
            <input
              type="password"
              className="crm-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              disabled={loading || retryAfter > 0}
            />
          </div>

          <button
            type="submit"
            className="btn-primary crm-login-btn magnetic"
            disabled={loading || retryAfter > 0}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" style={{ marginRight: '8px' }}></span>
                Verifying...
              </>
            ) : retryAfter > 0 ? (
              `Locked (${retryAfter}s)`
            ) : (
              'Enter CRM Command Centre'
            )}
          </button>
        </form>

        <div className="crm-login-footer">
          <a href="#" className="text-link">Back to Website</a>
          <span>&middot;</span>
          <span style={{ color: 'var(--text-muted)' }}>SSL Secured // HttpOnly JWT</span>
        </div>
      </div>
    </div>
  );
}
