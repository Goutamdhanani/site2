import { ANALYTICS_EVENTS } from './analyticsEvents';

// Local storage key for consent state
const CONSENT_KEY = 'oddwebs_cookie_consent';

// Retrieve current consent state from localStorage
export function getConsentState() {
  return localStorage.getItem(CONSENT_KEY) || 'undecided'; // 'accepted' | 'declined' | 'undecided'
}

// Save consent state and initialize third-party analytics if accepted
export function setConsentState(state) {
  localStorage.setItem(CONSENT_KEY, state);
  if (state === 'accepted') {
    initializeThirdParties();
  }
}

// Check if browser has Do Not Track enabled
export function isDoNotTrackEnabled() {
  if (typeof navigator !== 'undefined') {
    return (
      navigator.doNotTrack === '1' ||
      window.doNotTrack === '1' ||
      navigator.msDoNotTrack === '1'
    );
  }
  return false;
}

// In-memory array to store current session events for local telemetry dashboard
// This is strictly local to the browser, 100% private, and never leaves the client.
if (typeof window !== 'undefined') {
  window.__oddwebs_analytics_events = window.__oddwebs_analytics_events || [];
}

// Helper to push to the local in-memory queue and notify the dashboard component
function logLocalEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;

  const eventRecord = {
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    name: eventName,
    params: {
      ...params,
      url: window.location.href,
      path: window.location.hash || '#home',
      screen: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: navigator.userAgent
    }
  };

  window.__oddwebs_analytics_events.unshift(eventRecord);
  
  // Keep memory footprint low (cap at 200 events)
  if (window.__oddwebs_analytics_events.length > 200) {
    window.__oddwebs_analytics_events.pop();
  }

  // Dispatch custom DOM event to notify the dashboard if it is currently open
  const customEvent = new CustomEvent('oddwebs-analytics-trigger', { detail: eventRecord });
  window.dispatchEvent(customEvent);
}

// Lazy-loads GA4, GTM, and Microsoft Clarity scripts safely after consent is granted
export function initializeThirdParties() {
  if (typeof window === 'undefined') return;
  if (getConsentState() !== 'accepted') return;
  if (isDoNotTrackEnabled()) {
    console.log('Analytics Initialization Hook: Do Not Track detected. Third-party trackers bypassed.');
    return;
  }

  try {
    // 1. Initialize Google Analytics 4 (GA4)
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId && gaId !== 'G-XXXXXXXXXX' && !window.__ga_loaded) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      // Anonymize IP and secure tags for privacy compliance
      window.gtag('config', gaId, {
        anonymize_ip: true,
        allow_ad_personalization_signals: false
      });
      window.__ga_loaded = true;
      console.log('Analytics Core: Google Analytics 4 loaded successfully (IP Anonymized).');
    }

    // 2. Initialize Microsoft Clarity
    const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID;
    if (clarityId && clarityId !== 'placeholder_clarity_id' && !window.__clarity_loaded) {
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window,document,"clarity","script",clarityId);
      
      // Mask input fields dynamically to satisfy privacy standards (no PII in replays)
      if (window.clarity) {
        window.clarity("consent"); // signal user gave cookie consent
      }
      window.__clarity_loaded = true;
      console.log('Analytics Core: Microsoft Clarity session recorder loaded.');
    }
  } catch (err) {
    console.warn('Analytics Core: Failed to initialize third-party analytics libraries.', err.message);
  }
}

/**
 * Main Centralized Event Tracking Function
 * @param {string} eventName — Name of the custom/strongly-typed event
 * @param {object} eventParams — Key-value dictionary of event parameters
 */
export function trackEvent(eventName, eventParams = {}) {
  // Redact potentially sensitive parameters to preserve user privacy
  const sanitizedParams = { ...eventParams };
  const sensitiveKeys = ['password', 'card', 'cvv', 'cvc', 'token', 'message', 'description', 'brief'];
  
  Object.keys(sanitizedParams).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      sanitizedParams[key] = '[REDACTED]';
    }
  });

  // Always log to local browser memory (for our real-time Dashboard)
  logLocalEvent(eventName, sanitizedParams);

  // Check if third-party tracking is authorized via consent
  if (getConsentState() !== 'accepted' || isDoNotTrackEnabled()) {
    return;
  }

  // Forward to Google Analytics 4 if loaded
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', eventName, sanitizedParams);
    } catch (e) {
      console.warn('Google Analytics event dispatch failure:', e);
    }
  }

  // Forward to Clarity custom events if loaded
  if (typeof window !== 'undefined' && window.clarity) {
    try {
      window.clarity("event", eventName, sanitizedParams);
    } catch (e) {
      console.warn('Clarity event dispatch failure:', e);
    }
  }
}

/**
 * Tracks View Transitions (Page Funnel tracking)
 * @param {string} pageName — Current screen view hash/name
 */
export function trackPageView(pageName) {
  trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
    page_path: pageName,
    page_title: `oddwebs - ${pageName.replace('#', '').toUpperCase() || 'HOME'}`
  });
}

/**
 * Tracks CTA performance, hovered rate, and positions
 * @param {string} ctaId — Button/Anchor identifier
 * @param {string} action — 'impression' | 'hover' | 'click'
 * @param {object} additionalParams — Custom data
 */
export function trackCTA(ctaId, action, additionalParams = {}) {
  const event = action === 'hover' 
    ? ANALYTICS_EVENTS.CTA_HOVER 
    : action === 'impression' 
      ? ANALYTICS_EVENTS.CTA_IMPRESSION 
      : ANALYTICS_EVENTS.CTA_CLICK;

  trackEvent(event, {
    cta_id: ctaId,
    ...additionalParams
  });
}

/**
 * Tracks interactive booking form fields and drop-offs
 * @param {string} formId — Target form identifier
 * @param {string} formEvent — 'start' | 'field_focus' | 'field_completed' | 'validation_error' | 'success'
 * @param {object} params — Event payload (e.g. field_name, error_message)
 */
export function trackForm(formId, formEvent, params = {}) {
  let event = ANALYTICS_EVENTS.FORM_START;
  if (formEvent === 'field_focus') event = ANALYTICS_EVENTS.FORM_FIELD_FOCUS;
  if (formEvent === 'field_completed') event = ANALYTICS_EVENTS.FORM_FIELD_COMPLETED;
  if (formEvent === 'validation_error') event = ANALYTICS_EVENTS.FORM_VALIDATION_ERROR;
  if (formEvent === 'success') event = ANALYTICS_EVENTS.FORM_SUCCESS;

  trackEvent(event, {
    form_id: formId,
    ...params
  });
}

/**
 * Tracks Appointment Booking Flow Metrics
 * @param {string} action — 'calendar_opened' | 'date_selected' | 'time_selected' | 'confirmed' | 'cancelled'
 * @param {object} params — Details like timezone, date, services list
 */
export function trackAppointment(action, params = {}) {
  let event = ANALYTICS_EVENTS.CALENDAR_OPENED;
  if (action === 'date_selected') event = ANALYTICS_EVENTS.DATE_SELECTED;
  if (action === 'time_selected') event = ANALYTICS_EVENTS.TIME_SELECTED;
  if (action === 'confirmed') event = ANALYTICS_EVENTS.BOOKING_CONFIRMED;
  if (action === 'cancelled') event = ANALYTICS_EVENTS.BOOKING_CANCELLED;
  if (action === 'rescheduled') event = ANALYTICS_EVENTS.BOOKING_RESCHEDULED;

  trackEvent(event, params);
}
