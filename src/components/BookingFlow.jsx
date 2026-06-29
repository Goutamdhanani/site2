import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { isLite } from '../utils/device';
import { handleBookingNotifications } from '../utils/booking';

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
  'UTC'
];

const AVAILABLE_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM'
];

export default function BookingFlow({ onViewChange }) {
  const [step, setStep] = useState(1);
  
  // Step 1: Services
  const [selectedServices, setSelectedServices] = useState([]);
  
  // Step 2: Description
  const [description, setDescription] = useState('');
  
  // Step 3: Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [company, setCompany] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [country, setCountry] = useState('United States');
  
  // Validation errors
  const [emailError, setEmailError] = useState('');
  const [whatsappError, setWhatsappError] = useState('');
  const [nameError, setNameError] = useState('');

  // Step 4: Schedule
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Step 5: Success Payload
  const [bookingResult, setBookingResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef(null);

  // Auto-detect timezone and country
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        setTimezone(tz);
        // Deduce country from timezone region
        const parts = tz.split('/');
        if (parts[0] === 'America') setCountry('United States');
        else if (parts[0] === 'Europe') setCountry('Europe');
        else if (parts[0] === 'Asia') {
          if (parts[1] === 'Kolkata') setCountry('India');
          else if (parts[1] === 'Tokyo') setCountry('Japan');
          else setCountry('Asia');
        } else if (parts[0] === 'Australia') setCountry('Australia');
        else setCountry(parts[0] || 'Global');
      }
    } catch (e) {
      console.warn('Geo-detection failed, using defaults');
    }
  }, []);

  // Entrance animations for steps
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.bf-step-container', 
        { opacity: 0, y: 30, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' }
      );
    }, containerRef.current);
    return () => ctx.revert();
  }, [step]);

  // Generate list of next 10 days (skipping weekends)
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    let current = 1;
    
    while (days.length < 10) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + current);
      const dayOfWeek = nextDate.getDay();
      
      // Skip Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days.push(nextDate);
      }
      current++;
    }
    return days;
  };

  const nextDays = getNextDays();

  const handleServiceToggle = (service) => {
    setSelectedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const validateEmail = (val) => {
    if (!val.trim()) {
      setEmailError('');
      return true;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val.trim())) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateWhatsapp = (val) => {
    if (!val.trim()) {
      setWhatsappError('WhatsApp Number is required.');
      return false;
    }
    const regex = /^\+?[0-9\s\-()]{7,20}$/;
    if (!regex.test(val.trim())) {
      setWhatsappError('Please enter a valid phone number (minimum 7 digits).');
      return false;
    }
    setWhatsappError('');
    return true;
  };

  const validateName = (val) => {
    if (!val.trim()) {
      setNameError('Full Name is required.');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    validateName(val);
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    validateEmail(val);
  };

  const handleWhatsappChange = (e) => {
    const val = e.target.value;
    setWhatsapp(val);
    validateWhatsapp(val);
  };

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleStep3Submit = (e) => {
    if (e) e.preventDefault();
    const isNameValid = validateName(name);
    const isWhatsappValid = validateWhatsapp(whatsapp);
    const isEmailValid = validateEmail(email);

    if (isNameValid && isWhatsappValid && isEmailValid) {
      setStep(4);
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) {
      return alert('Please pick a date and a time slot.');
    }

    setSubmitting(true);

    // 1. Capture Hidden Analytics Metadata
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = `OW-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const payload = {
      id: bookingId,
      timestamp: new Date().toISOString(),
      localTime: new Date().toLocaleTimeString(),
      services: selectedServices.length > 0 ? selectedServices : ['General Inquiry'],
      description: description || 'No project description provided.',
      details: {
        name,
        email: email || 'Not provided',
        whatsapp,
        company: company || 'Not provided',
        country,
        timezone
      },
      booking: {
        date: formattedDate,
        timeSlot: selectedSlot,
        timezone
      },
      metadata: {
        referralUrl: document.referrer || 'direct',
        landingPageUrl: window.location.origin + window.location.pathname,
        utmSource: urlParams.get('utm_source') || 'direct',
        utmMedium: urlParams.get('utm_medium') || 'none',
        utmCampaign: urlParams.get('utm_campaign') || 'none',
        browser: navigator.userAgent,
        deviceType: isLite ? 'mobile' : 'desktop',
        screenResolution: `${window.screen.width}x${window.screen.height}`
      }
    };

    // Save payload to localStorage so client maintains their booking locally
    try {
      localStorage.setItem('oddwebs_last_booking', JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save booking to localStorage:', e);
    }

    // 2. Output Simulated API payloads to Console
    console.log('========== SCHEDULER BACKEND RECORD ==========');
    console.log('LOCAL_STORAGE_SAVE:', payload);
    console.log('==============================================');

    // 3. Send actual notifications & update Sheet
    try {
      await handleBookingNotifications(payload);
    } catch (err) {
      console.error('Failed to dispatch notifications:', err);
    } finally {
      setSubmitting(false);
      setBookingResult(payload);
      setStep(5);
    }
  };
  return (
    <div id="demo" ref={containerRef} className="booking-flow-wrapper">
      <div className="section-glow-line" aria-hidden="true" />
      <div className="portfolio-bg-glow" style={{ '--active-color': 'var(--accent-ember)' }} />

      <div className="container booking-container">
        {step < 5 && (
          <>
            <div className="bf-back-home-wrap">
              <a 
                href="#home" 
                onClick={(e) => { e.preventDefault(); onViewChange('home'); }} 
                className="bf-back-home-link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back to Home
              </a>
            </div>
            <header className="booking-header">
              <span className="eyebrow" style={{ color: 'var(--accent-ember)' }}>Step 0{step} of 04</span>
              <h1 className="display-sm pt-title">Schedule Free Demo</h1>
              <p className="body-md pt-subtitle">
                Book a live product demo to review code scope, architecture, and timeline for your product.
              </p>
              
              {/* Progress Bar */}
              <div className="booking-progress-rail">
                <div 
                  className="booking-progress-bar" 
                  style={{ width: `${(step - 1) * 33.3}%` }} 
                />
              </div>
            </header>
          </>
        )}
        <div className="bf-step-container">
          {/* STEP 1: SERVICES NEEDED */}
          {step === 1 && (
            <div className="bf-step-content">
              <h3 className="bf-step-title">What do you need help with?</h3>
              <p className="body-md text-muted mb-4">Choose one or multiple categories that describe your project requirements.</p>
              
              <div className="bf-grid-chips">
                {['Website', 'Mobile App', 'AI Automation', 'UI/UX Design', 'Other'].map((service) => {
                  const active = selectedServices.includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => handleServiceToggle(service)}
                      className={`bf-chip-button ${active ? 'active' : ''}`}
                    >
                      <span className="chip-indicator" />
                      {service}
                    </button>
                  );
                })}
              </div>

              <div className="bf-actions-bar">
                <button 
                  type="button" 
                  onClick={handleNext} 
                  className="btn-primary magnetic"
                  disabled={selectedServices.length === 0}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PROJECT DESCRIPTION */}
          {step === 2 && (
            <div className="bf-step-content">
              <h3 className="bf-step-title">Tell us about your project</h3>
              <p className="body-md text-muted mb-4">Briefly describe what you're building, your timeline, or where you're currently stuck (Optional).</p>
              
              <div className="bf-input-group">
                <textarea
                  className="bf-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what you're building or what you need help with."
                  rows={6}
                />
              </div>

              <div className="bf-actions-bar">
                <button type="button" onClick={handlePrev} className="btn-ghost">
                  Back
                </button>
                <button type="button" onClick={handleNext} className="btn-primary magnetic">
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: USER DETAILS */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="bf-step-content">
              <h3 className="bf-step-title">Your Contact Details</h3>
              <p className="body-md text-muted mb-4">We will use this information to send the call invitation and invite you to the project dashboard.</p>
              
              <div className="bf-form-grid">
                <div className="bf-input-group">
                  <label className="bf-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className={`bf-input ${nameError ? 'has-error' : ''}`}
                    value={name}
                    onChange={handleNameChange}
                    placeholder="John Doe"
                  />
                  {nameError && <span className="bf-error-message">{nameError}</span>}
                </div>

                <div className="bf-input-group">
                  <label className="bf-label">Email Address (Optional)</label>
                  <input
                    type="email"
                    className={`bf-input ${emailError ? 'has-error' : ''}`}
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="john@example.com"
                  />
                  {emailError && <span className="bf-error-message">{emailError}</span>}
                </div>

                <div className="bf-input-group">
                  <label className="bf-label">WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    className={`bf-input ${whatsappError ? 'has-error' : ''}`}
                    value={whatsapp}
                    onChange={handleWhatsappChange}
                    placeholder="+1 (555) 019-2834"
                  />
                  {whatsappError && <span className="bf-error-message">{whatsappError}</span>}
                </div>

                <div className="bf-input-group">
                  <label className="bf-label">Company Name (Optional)</label>
                  <input
                    type="text"
                    className="bf-input"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                  />
                </div>

                <div className="bf-input-group">
                  <label className="bf-label">Detected Timezone</label>
                  <select
                    className="bf-select"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <div className="bf-input-group">
                  <label className="bf-label">Country (Auto-detected)</label>
                  <input
                    type="text"
                    readOnly
                    className="bf-input readonly"
                    value={country}
                  />
                </div>
              </div>

              <div className="bf-actions-bar">
                <button type="button" onClick={handlePrev} className="btn-ghost">
                  Back
                </button>
                <button 
                  type="submit" 
                  className="btn-primary magnetic"
                  disabled={!name.trim() || !whatsapp.trim() || !!emailError || !!whatsappError || !!nameError}
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: CALENDAR & SLOTS */}
          {step === 4 && (
            <div className="bf-step-content">
              <h3 className="bf-step-title">Select Date &amp; Time</h3>
              <p className="body-md text-muted mb-4">Choose from available business hours slots below in your timezone ({timezone}).</p>

              <div className="bf-calendar-layout">
                {/* Dates carousel grid */}
                <div className="bf-calendar-dates">
                  <p className="bf-inner-label">Available Dates</p>
                  <div className="bf-dates-grid">
                    {nextDays.map((dateObj, idx) => {
                      const isSelected = selectedDate && selectedDate.toDateString() === dateObj.toDateString();
                      const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                      const day = dateObj.getDate();
                      const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
                      
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { setSelectedDate(dateObj); setSelectedSlot(null); }}
                          className={`bf-date-card ${isSelected ? 'active' : ''}`}
                        >
                          <span className="bf-date-weekday">{weekday}</span>
                          <span className="bf-date-day">{day}</span>
                          <span className="bf-date-month">{month}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Available time slots */}
                <div className="bf-calendar-slots">
                  <p className="bf-inner-label">Available Slots</p>
                  {selectedDate ? (
                    <div className="bf-slots-container">
                      <div className="bf-slots-section">
                        <span className="bf-slots-section-title">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-color"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                          Morning
                        </span>
                        <div className="bf-slots-grid">
                          {AVAILABLE_SLOTS.filter(slot => slot.includes('AM')).map((slot) => {
                            const isSelected = selectedSlot === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedSlot(slot)}
                                className={`bf-slot-card ${isSelected ? 'active' : ''}`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bf-slots-section mt-4">
                        <span className="bf-slots-section-title">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-ember-color"><path d="M17 18a5 5 0 0 0-10 0M12 2v7M4.22 10.22l1.42 1.42M1 18h2M21 18h2M18.36 11.64l1.42-1.42M23 22H1M8 12a4 4 0 0 1 8 0"/></svg>
                          Afternoon
                        </span>
                        <div className="bf-slots-grid">
                          {AVAILABLE_SLOTS.filter(slot => slot.includes('PM')).map((slot) => {
                            const isSelected = selectedSlot === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedSlot(slot)}
                                className={`bf-slot-card ${isSelected ? 'active' : ''}`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bf-slots-empty">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-2 text-muted">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      <span>Please select a date to view available meeting slots.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bf-actions-bar">
                <button type="button" onClick={handlePrev} className="btn-ghost" disabled={submitting}>
                  Back
                </button>
                <button 
                  type="button" 
                  onClick={handleSubmit} 
                  className="btn-primary magnetic"
                  disabled={!selectedDate || !selectedSlot || submitting}
                >
                  {submitting ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <svg className="bf-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      Scheduling...
                    </span>
                  ) : (
                    'Schedule Free Demo'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS PAGE & DEMO PASS */}
          {step === 5 && bookingResult && (
            <div className="bf-success-layout">
              <div className="bf-success-heading text-center">
                <div className="bf-success-icon-wrap mb-3">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent-ember)' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="display-sm pt-details-title mb-2">Demo Scheduled Successfully</h2>
                <p className="body-md text-muted max-ch">
                  Thanks! We've received your request. You'll receive a confirmation email shortly, and we'll review your project before the demo.
                </p>
              </div>

              {/* Holographic Agency Demo Pass */}
              <div className="bf-pass-card">
                <div className="bf-pass-holo" />
                <div className="hud-corner tl" />
                <div className="hud-corner tr" />
                <div className="hud-corner bl" />
                <div className="hud-corner br" />

                <div className="bf-pass-header">
                  <div className="bf-pass-logo">
                    <span className="logo-mark">OW</span>
                    <span className="logo-name">oddwebs</span>
                  </div>
                  <span className="bf-pass-badge">AGENCY DEMO PASS</span>
                </div>

                <div className="bf-pass-body">
                  <div className="bf-pass-row">
                    <div className="bf-pass-col">
                      <span className="pass-lbl">VISITOR</span>
                      <span className="pass-val">{bookingResult.details.name}</span>
                    </div>
                    <div className="bf-pass-col text-right">
                      <span className="pass-lbl">REFERENCE</span>
                      <span className="pass-val text-accent-color">{bookingResult.id}</span>
                    </div>
                  </div>

                  <div className="bf-pass-row mt-3">
                    <div className="bf-pass-col">
                      <span className="pass-lbl">MEETING DATE</span>
                      <span className="pass-val">{bookingResult.booking.date}</span>
                    </div>
                  </div>

                  <div className="bf-pass-row mt-3">
                    <div className="bf-pass-col">
                      <span className="pass-lbl">TIME SLOT</span>
                      <span className="pass-val">{bookingResult.booking.timeSlot}</span>
                    </div>
                    <div className="bf-pass-col text-right">
                      <span className="pass-lbl">TIMEZONE</span>
                      <span className="pass-val truncate-tz">{bookingResult.booking.timezone}</span>
                    </div>
                  </div>

                  <div className="bf-pass-row mt-3">
                    <div className="bf-pass-col">
                      <span className="pass-lbl">SERVICES</span>
                      <span className="pass-val text-sm font-mono">{bookingResult.services.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="bf-pass-footer">
                  <div className="bf-barcode" aria-hidden="true">
                    {[1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2].map((width, i) => (
                      <span key={i} style={{ width: `${width}px` }} />
                    ))}
                  </div>
                  <span className="bf-pass-system-ref">SYSTEM ACTIVE // SECURE ACCESS</span>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="bf-success-actions">
                <a 
                  href="#home" 
                  onClick={(e) => { e.preventDefault(); onViewChange('home'); }} 
                  className="btn-primary magnetic"
                  style={{ minWidth: '160px', justifyContent: 'center' }}
                >
                  Back to Home
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
