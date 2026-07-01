// Use native fetch

const webhook = 'https://script.google.com/macros/s/AKfycbyjfu_Z9-C6i5pl8pBdIqzvNzaq2pc8irdqI8z7LL-24UVEiYIdd9YhPtvMJVKjmAILBA/exec';

const payload = {
  id: 'OW-TEST-9999',
  timestamp: new Date().toISOString(),
  localTime: new Date().toLocaleTimeString(),
  services: ['Website'],
  description: 'Test description from local debugger',
  details: {
    name: 'Test Debugger',
    email: 'test@oddwebs.com',
    whatsapp: '+15555555555',
    company: 'Test Company',
    website: 'None',
    industry: 'Other',
    businessSize: '1-10 employees',
    budget: 'Under $5,000',
    timeline: 'Flexible',
    additionalNotes: 'None',
    consent: 'Yes (Implicit)',
    country: 'United States',
    timezone: 'America/New_York'
  },
  booking: {
    date: 'Thursday, July 9, 2026',
    timeSlot: '11:00 AM',
    timezone: 'America/New_York'
  },
  metadata: {
    referralUrl: 'direct',
    landingPageUrl: 'https://oddwebs.com/',
    utmSource: 'test'
  }
};

async function run() {
  try {
    console.log('Sending payload to webhook...');
    const response = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);
    const text = await response.text();
    console.log('Response Text:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

run();
