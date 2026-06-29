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
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'hello@oddwebs.com';

  // Inject admin email into payload so the Apps Script knows where to send notifications
  const requestPayload = {
    ...payload,
    adminEmail: adminEmail
  };

  if (googleSheetsWebhook && !googleSheetsWebhook.includes('YOUR_GOOGLE_APPS_SCRIPT')) {
    try {
      const response = await fetch(googleSheetsWebhook, {
        method: 'POST',
        mode: 'no-cors', // standard for Google Apps Scripts macros to prevent CORS errors
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });
      console.log('Booking request dispatched to Google Apps Script Webhook.');
      return { success: true };
    } catch (error) {
      console.error('Error dispatching booking to Google Apps Script:', error);
      return { success: false };
    }
  } else {
    console.warn('Google Sheets Webhook not configured or placeholder used. Running in simulation mode.');
    // Simulated delay for testing
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  }
}

/**
 * Google Apps Script Webhook Template.
 * Copy and paste this code into your Google Sheets Apps Script editor (Extensions -> Apps Script).
 * It automatically logs submissions and sends beautifully formatted HTML emails for free.
 */
export const googleAppsScriptTemplate = `
function doPost(e) {
  try {
    var jsonString = e.postData.contents;
    var data = JSON.parse(jsonString);
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Booking ID", "Timestamp", "Name", "Email", "WhatsApp", 
        "Company", "Country", "Timezone", "Meeting Date", "Meeting Time", 
        "Services", "Description", "Referral URL", "UTM Source", 
        "UTM Medium", "UTM Campaign", "Browser", "Device Type"
      ]);
    }
    
    // Append booking row
    sheet.appendRow([
      data.id,
      data.timestamp,
      data.details.name,
      data.details.email,
      data.details.whatsapp,
      data.details.company,
      data.details.country,
      data.details.timezone,
      data.booking.date,
      data.booking.timeSlot,
      data.services.join(', '),
      data.description,
      data.metadata.referralUrl,
      data.metadata.utmSource,
      data.metadata.utmMedium,
      data.metadata.utmCampaign,
      data.metadata.browser,
      data.metadata.deviceType
    ]);
    
    // ----------------------------------------------------
    // SEND EMAILS (Client Confirmation & Admin Notification)
    // ----------------------------------------------------
    var adminEmail = data.adminEmail || "hello@oddwebs.com";
    var clientEmail = data.details.email;
    var servicesList = data.services.join(', ');
    
    // 1. Admin Lead Notification Email
    var adminSubject = "[New Lead] oddwebs Booking " + data.id + " - " + data.details.name;
    var adminBodyHtml = 
      "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #fcfcfc;'>" +
        "<h2 style='color: #f95738; margin-top: 0;'>New Lead Demo Request</h2>" +
        "<p>A new demo has been scheduled. Details below:</p>" +
        "<table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>" +
          "<tr><td style='padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;'>Booking ID</td><td style='padding: 8px 0; border-bottom: 1px solid #eee;'>" + data.id + "</td></tr>" +
          "<tr><td style='padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;'>Name</td><td style='padding: 8px 0; border-bottom: 1px solid #eee;'>" + data.details.name + "</td></tr>" +
          "<tr><td style='padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;'>Email</td><td style='padding: 8px 0; border-bottom: 1px solid #eee;'>" + data.details.email + "</td></tr>" +
          "<tr><td style='padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;'>WhatsApp</td><td style='padding: 8px 0; border-bottom: 1px solid #eee;'>" + data.details.whatsapp + "</td></tr>" +
          "<tr><td style='padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;'>Company</td><td style='padding: 8px 0; border-bottom: 1px solid #eee;'>" + data.details.company + "</td></tr>" +
          "<tr><td style='padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;'>Country / TZ</td><td style='padding: 8px 0; border-bottom: 1px solid #eee;'>" + data.details.country + " (" + data.details.timezone + ")</td></tr>" +
          "<tr><td style='padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;'>Meeting Date</td><td style='padding: 8px 0; border-bottom: 1px solid #eee;'>" + data.booking.date + "</td></tr>" +
          "<tr><td style='padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;'>Meeting Time</td><td style='padding: 8px 0; border-bottom: 1px solid #eee;'>" + data.booking.timeSlot + "</td></tr>" +
          "<tr><td style='padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;'>Services</td><td style='padding: 8px 0; border-bottom: 1px solid #eee;'>" + servicesList + "</td></tr>" +
          "<tr><td style='padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;'>Description</td><td style='padding: 8px 0; border-bottom: 1px solid #eee;'>" + data.description + "</td></tr>" +
        "</table>" +
        "<h3 style='color: #ee9b00; margin-top: 20px;'>Analytics Metadata</h3>" +
        "<table style='width: 100%; border-collapse: collapse; font-size: 12px; color: #666;'>" +
          "<tr><td style='padding: 4px 0; width: 150px;'>Referral URL</td><td>" + data.metadata.referralUrl + "</td></tr>" +
          "<tr><td style='padding: 4px 0;'>UTM Campaign</td><td>" + data.metadata.utmSource + " / " + data.metadata.utmMedium + " / " + data.metadata.utmCampaign + "</td></tr>" +
          "<tr><td style='padding: 4px 0;'>Device / Screen</td><td>" + data.metadata.deviceType + " (" + data.metadata.screenResolution + ")</td></tr>" +
        "</table>" +
      "</div>";
      
    MailApp.sendEmail({
      to: adminEmail,
      subject: adminSubject,
      htmlBody: adminBodyHtml
    });
    
    // 2. Client Confirmation Receipt Email (only if email was provided)
    if (clientEmail && clientEmail.trim() !== "" && clientEmail !== "Not provided") {
      var clientSubject = "Your Demo Booking is Confirmed — oddwebs";
      var clientBodyHtml = 
        "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c;'>" +
          "<div style='text-align: center; margin-bottom: 25px;'>" +
            "<div style='font-size: 28px; font-weight: 800; letter-spacing: -0.02em; color: #0f172a;'>odd<span style='color: #f95738;'>webs</span></div>" +
            "<p style='color: #64748b; font-size: 14px; margin-top: 4px;'>We Build Digital Powerhouses</p>" +
          "</div>" +
          "<h2 style='color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0; text-align: center;'>Your Demo is Confirmed!</h2>" +
          "<p style='font-size: 15px; line-height: 1.6; color: #475569;'>Hi " + data.details.name + ",</p>" +
          "<p style='font-size: 15px; line-height: 1.6; color: #475569;'>Thanks for scheduling a free demo with us! We have reserved your slot, and our team will analyze your project description and requirements to prepare an initial technical scope proposal beforehand.</p>" +
          "<div style='background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;'>" +
            "<h3 style='margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;'>Booking Pass</h3>" +
            "<table style='width: 100%; border-collapse: collapse; font-size: 14px;'>" +
              "<tr><td style='padding: 6px 0; color: #64748b; width: 120px;'>Reference</td><td style='padding: 6px 0; font-weight: bold; color: #f95738;'>" + data.id + "</td></tr>" +
              "<tr><td style='padding: 6px 0; color: #64748b;'>Date</td><td style='padding: 6px 0; font-weight: bold; color: #0f172a;'>" + data.booking.date + "</td></tr>" +
              "<tr><td style='padding: 6px 0; color: #64748b;'>Time Slot</td><td style='padding: 6px 0; font-weight: bold; color: #0f172a;'>" + data.booking.timeSlot + " (" + data.booking.timezone + ")</td></tr>" +
              "<tr><td style='padding: 6px 0; color: #64748b;'>Services</td><td style='padding: 6px 0; color: #334155; font-family: monospace;'>" + servicesList + "</td></tr>" +
            "</table>" +
          "</div>" +
          "<p style='font-size: 15px; line-height: 1.6; color: #475569;'>We will send you a calendar invite and a meeting link on your email and WhatsApp shortly.</p>" +
          "<p style='font-size: 15px; line-height: 1.6; color: #475569;'>If you have any questions or additional files/documents to share, feel free to reply directly to this email or ping us on WhatsApp.</p>" +
          "<hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;' />" +
          "<div style='text-align: center; color: #94a3b8; font-size: 12px;'>" +
            "&copy; " + new Date().getFullYear() + " oddwebs. All rights reserved.<br/>" +
            "Web Design, App Development & AI Automation Agency" +
          "</div>" +
        "</div>";
        
      MailApp.sendEmail({
        to: clientEmail,
        subject: clientSubject,
        htmlBody: clientBodyHtml
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
