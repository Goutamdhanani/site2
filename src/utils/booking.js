/**
 * Sends booking details to the Google Sheets Webhook (Google Apps Script).
 * The Google Apps Script handles both logging to Google Sheets and sending emails
 * (client confirmation + admin notification) securely server-side.
 * 
 * @param {Object} payload The booking payload containing all details.
 * @returns {Promise<{success: boolean}>}
 */
export async function handleBookingNotifications(payload) {
  const googleSheetsWebhook = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK;
  const resendApiUrl = import.meta.env.VITE_RESEND_API_URL || '/api/send-email';
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'hello@oddwebs.com';

  const requestPayload = {
    ...payload,
    adminEmail: adminEmail
  };

  let apiSuccess = false;

  try {
    const response = await fetch(resendApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });
    
    if (response.ok) {
      const resData = await response.json();
      console.log('API Route processed lead successfully:', resData);
      apiSuccess = resData.success || (resData.sheetsStatus && resData.sheetsStatus.includes('Success'));
    } else {
      console.warn('API Route returned an error:', response.statusText);
    }
  } catch (error) {
    console.warn('Could not connect to backend API route. Falling back to local sheets direct dispatcher.', error);
    // Dev fallback: Direct post from client to sheets webhook if backend is unavailable (e.g. static preview/dev)
    if (googleSheetsWebhook && !googleSheetsWebhook.includes('YOUR_GOOGLE_APPS_SCRIPT')) {
      try {
        await fetch(googleSheetsWebhook, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestPayload)
        });
        console.log('Booking request dispatched directly to Google Sheets Webhook.');
        apiSuccess = true;
      } catch (err) {
        console.error('Direct Google Sheets post failed:', err);
      }
    }
  }

  if (apiSuccess) {
    return { success: true };
  }

  // Pure developer simulation mode if nothing configured
  if ((!googleSheetsWebhook || googleSheetsWebhook.includes('YOUR_GOOGLE_APPS_SCRIPT')) && import.meta.env.VITE_USE_RESEND !== 'true') {
    console.log('No webhook backend configured. Running in simulated mode.');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  }

  return { success: false };
}
