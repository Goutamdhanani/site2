import { useState, useEffect } from 'react';
import { getConsentState, setConsentState, initializeThirdParties } from '../utils/analytics';

export default function ComplianceBanner() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    googleAnalytics: true,
    claritySessionRecord: true
  });

  useEffect(() => {
    // Check if user has already made a decision
    const currentConsent = getConsentState();
    if (currentConsent === 'undecided') {
      // Delay showing the banner slightly for a smooth animated enter
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (currentConsent === 'accepted') {
      // Initialize immediately if consent already exists
      initializeThirdParties();
    }
  }, []);

  const handleAcceptAll = () => {
    setConsentState('accepted');
    setVisible(false);
  };

  const handleDeclineAll = () => {
    setConsentState('declined');
    setVisible(false);
  };

  const handleSavePreferences = () => {
    if (preferences.googleAnalytics || preferences.claritySessionRecord) {
      setConsentState('accepted');
    } else {
      setConsentState('declined');
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="compliance-banner-overlay">
      <div className="compliance-banner-container">
        <div className="compliance-banner-glow" />
        
        <div className="compliance-banner-content">
          <div className="compliance-banner-body">
            <h4 className="compliance-banner-title">
              PRIVACY SETTINGS <span className="compliance-banner-badge">SECURE</span>
            </h4>
            <p className="compliance-banner-text">
              We use privacy-first product analytics (IP Anonymized) to analyze page flows, optimize loads, and improve user experience. No personal message contents or passwords are ever captured.
            </p>
          </div>

          <div className="compliance-banner-actions">
            <button className="compliance-btn compliance-btn-link" onClick={handleDeclineAll}>
              Decline
            </button>
            <button className="compliance-btn compliance-btn-sec" onClick={() => setShowPreferences(!showPreferences)}>
              Preferences
            </button>
            <button className="compliance-btn compliance-btn-pri" onClick={handleAcceptAll}>
              Accept All
            </button>
          </div>
        </div>

        {showPreferences && (
          <div className="compliance-preferences-dropdown">
            <div className="compliance-pref-item">
              <label className="compliance-checkbox-container">
                <input
                  type="checkbox"
                  checked={preferences.googleAnalytics}
                  onChange={(e) => setPreferences({ ...preferences, googleAnalytics: e.target.checked })}
                />
                <span className="compliance-checkmark" />
                <span className="compliance-pref-label">Google Analytics 4</span>
                <span className="compliance-pref-desc">(Page Views, Funnels, and Performance)</span>
              </label>
            </div>
            
            <div className="compliance-pref-item">
              <label className="compliance-checkbox-container">
                <input
                  type="checkbox"
                  checked={preferences.claritySessionRecord}
                  onChange={(e) => setPreferences({ ...preferences, claritySessionRecord: e.target.checked })}
                />
                <span className="compliance-checkmark" />
                <span className="compliance-pref-label">Microsoft Clarity</span>
                <span className="compliance-pref-desc">(Session Heatmaps & Scroll Maps - Masked)</span>
              </label>
            </div>

            <div className="compliance-pref-footer">
              <button className="compliance-btn-save" onClick={handleSavePreferences}>
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
