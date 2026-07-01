import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { isLite } from '../utils/device';
import { handleBookingNotifications } from '../utils/booking';
import { trackEvent, trackForm, trackAppointment } from '../utils/analytics';

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
  const [selectedServices, setSelectedServices] = useState(() => {
    try {
      const stored = sessionStorage.getItem('preferred_services');
      if (stored) {
        sessionStorage.removeItem('preferred_services');
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  });
  
  // Step 2: Description
  const [description, setDescription] = useState('');
  
  // Step 3: Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [company, setCompany] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [country, setCountry] = useState('United States');
  
  // New CRM Fields States
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [businessSize, setBusinessSize] = useState('');
  const [consent, setConsent] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const startTimeRef = useRef(performance.now());
  const [visitNumber, setVisitNumber] = useState(1);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    try {
      let visId = localStorage.getItem('ow_visitor_id');
      if (visId) {
        setIsReturning(true);
        let visits = parseInt(localStorage.getItem('ow_visit_count') || '1') + 1;
        localStorage.setItem('ow_visit_count', visits.toString());
        setVisitNumber(visits);
      } else {
        localStorage.setItem('ow_visitor_id', 'vis-' + Math.random().toString(36).substring(2, 15));
        localStorage.setItem('ow_visit_count', '1');
        setVisitNumber(1);
        setIsReturning(false);
      }
    } catch(e) {
      console.warn(e);
    }
  }, []);
  
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

  const [toast, setToast] = useState(null);
  const [savedBooking, setSavedBooking] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('oddwebs_last_booking');
      if (stored) {
        setSavedBooking(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse saved booking:', e);
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const downloadReceiptAsPNG = () => {
    if (!bookingResult) return;
    
    showToast('Generating high-resolution pass...');

    const visitorName = bookingResult.details?.name || 'Visitor';
    const referenceId = bookingResult.id || 'OW-DEMO-0000';
    const bookingDateText = bookingResult.booking?.date || 'Not Scheduled';
    const bookingSlotText = bookingResult.booking?.timeSlot || 'Not Scheduled';
    const bookingTimezoneText = bookingResult.booking?.timezone || bookingResult.details?.timezone || 'UTC';
    const servicesArray = Array.isArray(bookingResult.services) ? bookingResult.services : ['General Inquiry'];

    // 1. Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set dimensions for high-resolution export (2.5x scale for 1080x1450 resolution)
    const scale = 2.5;
    const width = 440 * scale;
    const height = 580 * scale;
    canvas.width = width;
    canvas.height = height;
    
    // 2. Draw card background (dark gradients)
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0e0a08');
    grad.addColorStop(1, '#050302');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    
    // Draw orange top border
    ctx.fillStyle = '#f95738';
    ctx.fillRect(0, 0, width, 8 * scale);
    
    // Draw borders
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(0, 0, width, height);
    
    // Draw decorative HUD corner lines
    const cornerLen = 12 * scale;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5 * scale;
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(16 * scale, (16 + cornerLen) * scale);
    ctx.lineTo(16 * scale, 16 * scale);
    ctx.lineTo((16 + cornerLen) * scale, 16 * scale);
    ctx.stroke();
    
    // Top-right
    ctx.beginPath();
    ctx.moveTo((width / scale - 16 - cornerLen) * scale, 16 * scale);
    ctx.lineTo((width / scale - 16) * scale, 16 * scale);
    ctx.lineTo((width / scale - 16) * scale, (16 + cornerLen) * scale);
    ctx.stroke();
    
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(16 * scale, (height / scale - 16 - cornerLen) * scale);
    ctx.lineTo(16 * scale, (height / scale - 16) * scale);
    ctx.lineTo((16 + cornerLen) * scale, (height / scale - 16) * scale);
    ctx.stroke();
    
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo((width / scale - 16 - cornerLen) * scale, (height / scale - 16) * scale);
    ctx.lineTo((width / scale - 16) * scale, (height / scale - 16) * scale);
    ctx.lineTo((width / scale - 16) * scale, (height / scale - 16 - cornerLen) * scale);
    ctx.stroke();

    // Helper for text drawing
    const drawText = (text, x, y, font, color, align = 'left') => {
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.fillText(text, x * scale, y * scale);
    };

    // 3. Header Logo & Badge
    // Logo mark box
    ctx.fillStyle = '#f95738';
    ctx.fillRect(32 * scale, 34 * scale, 28 * scale, 20 * scale);
    drawText('OW', 46, 49, `bold ${12 * scale}px sans-serif`, '#eae5e2', 'center');
    
    // Logo name
    drawText('oddwebs', 68, 49, `bold ${16 * scale}px sans-serif`, '#ffffff');
    
    // Badge
    const badgeText = 'AGENCY DEMO PASS';
    ctx.font = `bold ${8 * scale}px monospace`;
    const badgeWidth = ctx.measureText(badgeText).width / scale + 16;
    ctx.fillStyle = 'rgba(238, 155, 0, 0.1)';
    ctx.fillRect((408 - badgeWidth) * scale, 34 * scale, badgeWidth * scale, 20 * scale);
    ctx.strokeStyle = 'rgba(238, 155, 0, 0.2)';
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect((408 - badgeWidth) * scale, 34 * scale, badgeWidth * scale, 20 * scale);
    drawText(badgeText, 408 - badgeWidth / 2, 47, `bold ${8 * scale}px monospace`, '#ee9b00', 'center');

    // Tear-off dashed divider at y = 76
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.beginPath();
    ctx.moveTo(0, 76 * scale);
    ctx.lineTo(width, 76 * scale);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Draw side punch holes (half circles)
    ctx.fillStyle = '#050302'; // Match body/container bg
    ctx.beginPath();
    ctx.arc(0, 76 * scale, 8 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width, 76 * scale, 8 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 4. Ticket Details
    // Visitor Row
    drawText('VISITOR', 32, 115, `bold ${9 * scale}px monospace`, '#7f6c65');
    drawText(visitorName, 32, 135, `bold ${15 * scale}px sans-serif`, '#eae5e2');
    
    // Reference Row
    drawText('REFERENCE', 408, 115, `bold ${9 * scale}px monospace`, '#7f6c65', 'right');
    drawText(referenceId, 408, 135, `bold ${15 * scale}px monospace`, '#f95738', 'right');
    
    // Meeting Date Row
    drawText('MEETING DATE', 32, 185, `bold ${9 * scale}px monospace`, '#7f6c65');
    drawText(bookingDateText, 32, 205, `bold ${15 * scale}px sans-serif`, '#eae5e2');
    
    // Time Slot
    drawText('TIME SLOT', 32, 255, `bold ${9 * scale}px monospace`, '#7f6c65');
    drawText(bookingSlotText, 32, 275, `bold ${15 * scale}px sans-serif`, '#eae5e2');
    
    // Timezone
    drawText('TIMEZONE', 408, 255, `bold ${9 * scale}px monospace`, '#7f6c65', 'right');
    const tzText = bookingTimezoneText.length > 20 
      ? bookingTimezoneText.substring(0, 18) + '...' 
      : bookingTimezoneText;
    drawText(tzText, 408, 275, `bold ${13 * scale}px sans-serif`, '#eae5e2', 'right');
    
    // Services
    drawText('SERVICES', 32, 325, `bold ${9 * scale}px monospace`, '#7f6c65');
    const servicesJoined = servicesArray.join(', ');
    drawText(servicesJoined, 32, 345, `bold ${12 * scale}px monospace`, '#ee9b00');

    // Tear-off dashed divider at y = 410
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.beginPath();
    ctx.moveTo(32 * scale, 410 * scale);
    ctx.lineTo(408 * scale, 410 * scale);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // 5. Barcode & Footer
    // Draw barcode lines
    const barcodeX = 32 * scale;
    const barcodeY = 445 * scale;
    const barcodeH = 24 * scale;
    const pattern = [1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 1, 2, 4];
    let currentX = barcodeX;
    
    ctx.fillStyle = 'rgba(240, 240, 245, 0.4)';
    pattern.forEach((w) => {
      ctx.fillRect(currentX, barcodeY, w * 1.5 * scale, barcodeH);
      currentX += (w * 1.5 + 2) * scale;
    });
    
    // Footer ref text
    drawText('SYSTEM ACTIVE // SECURE ACCESS', 408, 460, `bold ${8 * scale}px monospace`, '#7f6c65', 'right');
    
    // Date stamp or system info
    drawText(`ISSUED: ${new Date(bookingResult.timestamp).toLocaleDateString()}`, 32, 515, `bold ${8 * scale}px monospace`, '#7f6c65');
    drawText('NEXT.JS BUILDS // AI AUTOMATION', 408, 515, `bold ${8 * scale}px monospace`, '#7f6c65', 'right');

    // 6. Trigger download
    try {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `oddwebs-demo-pass-${referenceId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Pass image downloaded successfully!');
    } catch (err) {
      console.error('Failed to export canvas:', err);
      showToast('Failed to export pass image. Try printing as PDF.', 'error');
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Booking details copied to clipboard!');
    }).catch((err) => {
      console.error('Clipboard copy failed:', err);
      showToast('Failed to copy. Please print the pass.', 'error');
    });
  };

  const shareReceipt = async () => {
    if (!bookingResult) return;
    
    const visitorName = bookingResult.details?.name || 'Visitor';
    const referenceId = bookingResult.id || 'OW-DEMO-0000';
    const bookingDateText = bookingResult.booking?.date || 'Not Scheduled';
    const bookingSlotText = bookingResult.booking?.timeSlot || 'Not Scheduled';
    const bookingTimezoneText = bookingResult.booking?.timezone || bookingResult.details?.timezone || 'UTC';
    
    const shareText = `My free live product demo with oddwebs is scheduled!\n👤 Visitor: ${visitorName}\n📅 Date: ${bookingDateText}\n⏰ Time: ${bookingSlotText} (${bookingTimezoneText})\n🔖 Reference: ${referenceId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'oddwebs Demo Pass',
          text: shareText,
          url: window.location.origin
        });
        showToast('Receipt shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

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

  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const webhook = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK;
      if (webhook && !webhook.includes('YOUR_GOOGLE_APPS_SCRIPT')) {
        try {
          const response = await fetch(webhook);
          if (response.ok) {
            const resData = await response.json();
            if (resData.status === 'success' && Array.isArray(resData.bookings)) {
              setBookedSlots(resData.bookings);
              return;
            }
          }
        } catch (e) {
          console.warn('Could not fetch bookings from Apps Script:', e);
        }
      }
      
      // Fallback: load from localStorage
      try {
        const storedLocal = localStorage.getItem('oddwebs_local_bookings');
        if (storedLocal) {
          setBookedSlots(JSON.parse(storedLocal));
        } else {
          // Pre-populate some dummy booked slots for demonstration if no webhook
          const demoBookings = [
            { date: nextDays[0]?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), timeSlot: '10:00 AM' },
            { date: nextDays[0]?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), timeSlot: '02:00 PM' },
            { date: nextDays[1]?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), timeSlot: '11:00 AM' }
          ];
          setBookedSlots(demoBookings);
        }
      } catch (e) {
        console.warn(e);
      }
    };
    fetchBookings();
  }, []);

  const isSlotBooked = (date, slot) => {
    if (!date) return false;
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return bookedSlots.some(b => {
      // Direct string comparison or parse Date to compare
      try {
        return b.date === formattedDate && b.timeSlot === slot;
      } catch (e) {
        return false;
      }
    });
  };

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
    setStep(prev => {
      const nextStep = prev + 1;
      if (nextStep === 3) {
        trackForm('booking_form', 'start');
      }
      return nextStep;
    });
  };

  const handleStep3Submit = (e) => {
    if (e) e.preventDefault();
    const isNameValid = validateName(name);
    const isWhatsappValid = validateWhatsapp(whatsapp);
    const isEmailValid = validateEmail(email);

    if (!isNameValid) {
      trackForm('booking_form', 'validation_error', { field_name: 'name', error_message: 'Name is required' });
    }
    if (!isEmailValid) {
      trackForm('booking_form', 'validation_error', { field_name: 'email', error_message: 'Valid email is required' });
    }
    if (!isWhatsappValid) {
      trackForm('booking_form', 'validation_error', { field_name: 'whatsapp', error_message: 'Valid WhatsApp is required' });
    }

    if (isNameValid && isWhatsappValid && isEmailValid) {
      setStep(4);
      trackAppointment('calendar_opened', { timezone });
    }
  };

  const handlePrev = () => {
    setStep(prev => {
      const prevStep = Math.max(1, prev - 1);
      if (prev === 3 && prevStep === 2) {
        trackEvent('booking_flow_abandoned_at_fields');
      }
      return prevStep;
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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

    let sessId = sessionStorage.getItem('ow_session_id');
    if (!sessId) {
      sessId = 'sess-' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('ow_session_id', sessId);
    }
    const visitorId = localStorage.getItem('ow_visitor_id') || 'unknown';

    // Simple OS/Browser parsers
    const ua = navigator.userAgent;
    let os = 'unknown';
    if (ua.indexOf('Win') !== -1) os = 'Windows';
    else if (ua.indexOf('Mac') !== -1) os = 'MacOS';
    else if (ua.indexOf('Linux') !== -1) os = 'Linux';
    else if (ua.indexOf('Android') !== -1) os = 'Android';
    else if (ua.indexOf('like Mac') !== -1) os = 'iOS';

    let browser = 'unknown';
    let browserVer = 'unknown';
    if (ua.indexOf('Chrome') !== -1) { browser = 'Chrome'; const parts = ua.split('Chrome/'); browserVer = parts[1]?.split(' ')[0] || ''; }
    else if (ua.indexOf('Safari') !== -1) { browser = 'Safari'; const parts = ua.split('Version/'); browserVer = parts[1]?.split(' ')[0] || ''; }
    else if (ua.indexOf('Firefox') !== -1) { browser = 'Firefox'; const parts = ua.split('Firefox/'); browserVer = parts[1]?.split(' ')[0] || ''; }
    else if (ua.indexOf('Edge') !== -1) { browser = 'Edge'; const parts = ua.split('Edge/'); browserVer = parts[1]?.split(' ')[0] || ''; }

    const scrollPercentage = (() => {
      const h = document.documentElement;
      const b = document.body;
      const st = 'scrollTop';
      const sh = 'scrollHeight';
      return Math.round(((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100) || 0;
    })();

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
        website: 'None',
        industry: 'Other',
        businessSize: '1-10 employees',
        budget: 'Under $5,000',
        timeline: 'Flexible',
        additionalNotes: 'None',
        consent: 'Yes (Implicit)',
        country,
        timezone
      },
      booking: {
        date: formattedDate,
        timeSlot: selectedSlot,
        timezone
      },
      metadata: {
        sessionId: sessId,
        visitorId: visitorId,
        landingPageUrl: window.location.origin + window.location.pathname,
        currentUrl: window.location.href,
        referralUrl: document.referrer || 'direct',
        utmSource: urlParams.get('utm_source') || 'direct',
        utmMedium: urlParams.get('utm_medium') || 'none',
        utmCampaign: urlParams.get('utm_campaign') || 'none',
        utmTerm: urlParams.get('utm_term') || 'none',
        utmContent: urlParams.get('utm_content') || 'none',
        gclid: urlParams.get('gclid') || 'none',
        fbclid: urlParams.get('fbclid') || 'none',
        msclkid: urlParams.get('msclkid') || 'none',
        deviceType: ('ontouchstart' in window || navigator.maxTouchPoints > 0) ? 'mobile' : 'desktop',
        os: os,
        browser: browser,
        browserVersion: browserVer,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language || 'en-US',
        ip: 'compliant',
        userAgent: ua,
        networkType: navigator.connection?.effectiveType || 'unknown',
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        touchDevice: ('ontouchstart' in window || navigator.maxTouchPoints > 0),
        cookiesEnabled: navigator.cookieEnabled,
        jsEnabled: true,
        connectionSpeed: navigator.connection?.downlink ? navigator.connection.downlink + 'Mbps' : 'unknown',
        formCompletionTime: ((performance.now() - startTimeRef.current) / 1000).toFixed(1),
        scrollPercentage: `${scrollPercentage}%`,
        timeOnPage: Math.round(performance.now() / 1000),
        visitNumber: visitNumber,
        returningVisitor: isReturning,
        previousPage: document.referrer || 'none',
        exitPage: window.location.pathname
      }
    };

    // Save payload to localStorage so client maintains their booking locally
    try {
      localStorage.setItem('oddwebs_last_booking', JSON.stringify(payload));
      
      // Update local booked slots
      const currentBooked = [...bookedSlots, { date: formattedDate, timeSlot: selectedSlot }];
      setBookedSlots(currentBooked);
      localStorage.setItem('oddwebs_local_bookings', JSON.stringify(currentBooked));
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
      trackAppointment('confirmed', {
        booking_id: bookingId,
        date: formattedDate,
        time_slot: selectedSlot,
        timezone: timezone,
        services: selectedServices
      });
      trackForm('booking_form', 'success');
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

            {savedBooking && (
              <div className="bf-saved-booking-banner">
                <span className="bf-saved-booking-text">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px', color: 'var(--accent-amber)', verticalAlign: 'middle', display: 'inline-block' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  You have a scheduled demo: <strong style={{ color: '#ffffff' }}>{savedBooking.booking.date} @ {savedBooking.booking.timeSlot}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setBookingResult(savedBooking);
                    setStep(5);
                  }}
                  className="bf-saved-booking-btn"
                >
                  View Pass
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>
            )}

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
                  onFocus={() => trackForm('booking_form', 'field_focus', { field_name: 'description' })}
                  onBlur={(e) => { if (e.target.value.trim()) trackForm('booking_form', 'field_completed', { field_name: 'description' }); }}
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
                    onFocus={() => trackForm('booking_form', 'field_focus', { field_name: 'name' })}
                    onBlur={(e) => { if (e.target.value.trim()) trackForm('booking_form', 'field_completed', { field_name: 'name' }); }}
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
                    onFocus={() => trackForm('booking_form', 'field_focus', { field_name: 'email' })}
                    onBlur={(e) => { if (e.target.value.trim()) trackForm('booking_form', 'field_completed', { field_name: 'email' }); }}
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
                    onFocus={() => trackForm('booking_form', 'field_focus', { field_name: 'whatsapp' })}
                    onBlur={(e) => { if (e.target.value.trim()) trackForm('booking_form', 'field_completed', { field_name: 'whatsapp' }); }}
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
                    onFocus={() => trackForm('booking_form', 'field_focus', { field_name: 'company' })}
                    onBlur={(e) => { if (e.target.value.trim()) trackForm('booking_form', 'field_completed', { field_name: 'company' }); }}
                    placeholder="Acme Corp"
                  />
                </div>

                <div className="bf-input-group">
                  <label className="bf-label">Detected Timezone</label>
                  <select
                    className="bf-select"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    onFocus={() => trackForm('booking_form', 'field_focus', { field_name: 'timezone' })}
                    onBlur={(e) => { if (e.target.value.trim()) trackForm('booking_form', 'field_completed', { field_name: 'timezone' }); }}
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
                          onClick={() => {
                            setSelectedDate(dateObj);
                            setSelectedSlot(null);
                            trackAppointment('date_selected', { date: dateObj.toDateString() });
                          }}
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
                            const isBooked = isSlotBooked(selectedDate, slot);
                            const isSelected = selectedSlot === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={isBooked}
                                onClick={() => {
                                  if (!isBooked) {
                                    setSelectedSlot(slot);
                                    trackAppointment('time_selected', { time_slot: slot });
                                  }
                                }}
                                className={`bf-slot-card ${isSelected ? 'active' : ''} ${isBooked ? 'booked' : ''}`}
                              >
                                {isBooked ? 'Booked' : slot}
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
                            const isBooked = isSlotBooked(selectedDate, slot);
                            const isSelected = selectedSlot === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={isBooked}
                                onClick={() => {
                                  if (!isBooked) {
                                    setSelectedSlot(slot);
                                    trackAppointment('time_selected', { time_slot: slot });
                                  }
                                }}
                                className={`bf-slot-card ${isSelected ? 'active' : ''} ${isBooked ? 'booked' : ''}`}
                              >
                                {isBooked ? 'Booked' : slot}
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

              {/* Receipt Actions */}
              <div className="bf-receipt-actions">
                <button 
                  type="button" 
                  onClick={downloadReceiptAsPNG} 
                  className="bf-action-btn btn-secondary magnetic"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  Download Pass
                </button>
                <button 
                  type="button" 
                  onClick={printReceipt} 
                  className="bf-action-btn btn-secondary magnetic"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print / PDF
                </button>
                <button 
                  type="button" 
                  onClick={shareReceipt} 
                  className="bf-action-btn btn-secondary magnetic"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Share Pass
                </button>
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
      {toast && (
        <div className={`bf-toast bf-toast-${toast.type}`}>
          <span className="bf-toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
          <span className="bf-toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
