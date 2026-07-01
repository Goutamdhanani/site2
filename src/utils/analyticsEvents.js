export const ANALYTICS_EVENTS = {
  // Page / Session Lifecycle
  SITE_LOADED: 'site_loaded',
  PAGE_VIEW: 'page_view',
  USER_ENGAGEMENT: 'user_engagement',
  SCROLL_DEPTH: 'scroll_depth', // 25%, 50%, 75%, 100%

  // Navigation and General CTAs
  CTA_IMPRESSION: 'cta_impression',
  CTA_HOVER: 'cta_hover',
  CTA_CLICK: 'cta_click',

  // Form Interaction (General)
  FORM_START: 'form_start',
  FORM_FIELD_FOCUS: 'form_field_focus',
  FORM_FIELD_COMPLETED: 'form_field_completed',
  FORM_VALIDATION_ERROR: 'form_validation_error',
  FORM_ABANDON: 'form_abandon',
  FORM_SUCCESS: 'form_success',

  // Appointment Flow Specific
  CALENDAR_OPENED: 'calendar_opened',
  DATE_SELECTED: 'date_selected',
  TIME_SELECTED: 'time_selected',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_RESCHEDULED: 'booking_rescheduled',

  // Performance Telemetry
  CORE_WEB_VITAL: 'core_web_vital',
  JS_ERROR: 'js_error',
  API_FAILURE: 'api_failure',
};

export const CTA_LOCATIONS = {
  HERO: 'hero',
  NAVBAR: 'navbar',
  FOOTER: 'footer',
  SERVICES: 'services',
  PORTFOLIO: 'portfolio',
  FINAL_CTA: 'final_cta',
  METRICS: 'metrics',
  STICKY: 'sticky',
};
