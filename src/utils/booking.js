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

  let resendSuccess = false;
  let sheetsSuccess = false;

  // 1. Try sending via the Resend Serverless API Route
  const useResend = import.meta.env.VITE_USE_RESEND === 'true' || !!import.meta.env.VITE_RESEND_API_URL;

  if (useResend || resendApiUrl === '/api/send-email') {
    try {
      const response = await fetch(resendApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });
      if (response.ok) {
        console.log('Booking notifications sent successfully via Resend API.');
        resendSuccess = true;
      } else {
        const errorData = await response.json();
        console.warn('Resend API returned an error:', errorData.error || response.statusText);
      }
    } catch (error) {
      console.warn('Could not connect to /api/send-email serverless route (normal for static clients without Vercel). Falling back.', error);
    }
  }

  // 2. Try sending/logging via Google Sheets Webhook
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
      console.log('Booking request dispatched to Google Sheets Webhook.');
      sheetsSuccess = true;
    } catch (error) {
      console.error('Error logging to Google Sheets:', error);
    }
  }

  if (resendSuccess || sheetsSuccess) {
    return { success: true };
  }

  // If no backend is active, fall back to dev simulation mode
  if (!useResend && (!googleSheetsWebhook || googleSheetsWebhook.includes('YOUR_GOOGLE_APPS_SCRIPT'))) {
    console.log('No backend webhooks configured. Running in simulated mode.');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  }

  return { success: false };
}

/**
 * Google Apps Script Webhook Template.
 * Copy and paste this code into your Google Sheets Apps Script editor (Extensions -> Apps Script).
 * To send via Resend securely, add your RESEND_API_KEY in script properties (Project Settings -> Script Properties).
 * If no key is set, it falls back to Google's free MailApp.
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
      
    // 2. Client Confirmation Receipt Email (only if email was provided)
    var clientSubject = "Your Demo Booking is Confirmed — oddwebs";
    var clientBodyHtml = 
      "<table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: #0b0806; width: 100%; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>" +
        "<tr>" +
          "<td align='center' style='padding: 40px 16px;'>" +
            "<table width='100%' border='0' cellspacing='0' cellpadding='0' style='max-width: 500px; width: 100%; background-color: #0e0a08; border: 1px solid #2d1f1b; border-top: 4px solid #f95738; border-radius: 20px; text-align: left;'>" +
              "<tr>" +
                "<td style='padding: 36px 28px;'>" +
                  "<table style='width: 100%; border-collapse: collapse; margin-bottom: 24px;'>" +
                    "<tr>" +
                      "<td>" +
                        "<span style='font-size: 26px; font-weight: 900; letter-spacing: -0.03em; color: #ffffff;'>odd<span style='color: #f95738;'>webs</span></span>" +
                        "<div style='color: #7f6c65; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px;'>We Build Digital Powerhouses</div>" +
                      "</td>" +
                      "<td style='text-align: right; vertical-align: top;'>" +
                        "<span style='font-family: monospace; font-size: 9px; font-weight: 700; color: #ee9b00; background: rgba(238, 155, 0, 0.1); border: 1px solid rgba(238, 155, 0, 0.25); padding: 4px 10px; border-radius: 100px; letter-spacing: 0.05em; display: inline-block;'>APPOINTMENT PASS</span>" +
                      "</td>" +
                    "</tr>" +
                  "</table>" +
                  "<div style='color: #eae5e2; font-size: 15px; line-height: 1.6; margin-bottom: 20px;'>Hi " + data.details.name + ",</div>" +
                  "<div style='color: #eae5e2; font-size: 14px; line-height: 1.6; margin-bottom: 24px;'>Your free live demo call is confirmed! Our engineering team is currently reviewing your project details to prepare your custom technical roadmap proposal.</div>" +
                  "<div style='margin: 24px 0; border-top: 1px dashed #3d2d27; font-size: 0; line-height: 0;'></div>" +
                  "<table style='width: 100%; border-collapse: collapse;'>" +
                    "<tr>" +
                      "<td style='padding: 8px 0; vertical-align: top; width: 50%;'>" +
                        "<div style='font-family: monospace; font-size: 9px; color: #7f6c65; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;'>VISITOR</div>" +
                        "<div style='font-size: 14px; font-weight: 700; color: #eae5e2;'>" + data.details.name + "</div>" +
                      "</td>" +
                      "<td style='padding: 8px 0; vertical-align: top; width: 50%; text-align: right;'>" +
                        "<div style='font-family: monospace; font-size: 9px; color: #7f6c65; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;'>REFERENCE</div>" +
                        "<div style='font-size: 14px; font-weight: 700; color: #f95738; font-family: monospace;'>" + data.id + "</div>" +
                      "</td>" +
                    "</tr>" +
                    "<tr>" +
                      "<td style='padding: 12px 0 8px 0; vertical-align: top;' colspan='2'>" +
                        "<div style='font-family: monospace; font-size: 9px; color: #7f6c65; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;'>MEETING TARGET</div>" +
                        "<div style='font-size: 14px; font-weight: 700; color: #eae5e2;'>" + data.booking.date + "</div>" +
                      "</td>" +
                    "</tr>" +
                    "<tr>" +
                      "<td style='padding: 8px 0; vertical-align: top;'>" +
                        "<div style='font-family: monospace; font-size: 9px; color: #7f6c65; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;'>TIME SLOT</div>" +
                        "<div style='font-size: 14px; font-weight: 700; color: #eae5e2;'>" + data.booking.timeSlot + "</div>" +
                      "</td>" +
                      "<td style='padding: 8px 0; vertical-align: top; text-align: right;'>" +
                        "<div style='font-family: monospace; font-size: 9px; color: #7f6c65; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;'>TIMEZONE</div>" +
                        "<div style='font-size: 13px; font-weight: 600; color: #eae5e2;'>" + data.booking.timezone + "</div>" +
                      "</td>" +
                    "</tr>" +
                    "<tr>" +
                      "<td style='padding: 12px 0 0 0; vertical-align: top;' colspan='2'>" +
                        "<div style='font-family: monospace; font-size: 9px; color: #7f6c65; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;'>REQUESTED STACK</div>" +
                        "<div style='font-family: monospace; font-size: 13px; font-weight: 700; color: #ee9b00;'>" + servicesList + "</div>" +
                      "</td>" +
                    "</tr>" +
                  "</table>" +
                  "<div style='margin: 28px 0; border-top: 1px dashed #3d2d27; font-size: 0; line-height: 0;'></div>" +
                  "<div style='text-align: center; margin-bottom: 24px;'>" +
                    "<div style='display: inline-block; height: 24px; background: transparent; letter-spacing: 0; font-size: 0; line-height: 0;'>" +
                      "<span style='display: inline-block; width: 2px; height: 24px; background-color: #7f6c65; margin-right: 1px;'></span>" +
                      "<span style='display: inline-block; width: 1px; height: 24px; background-color: #7f6c65; margin-right: 2px;'></span>" +
                      "<span style='display: inline-block; width: 3px; height: 24px; background-color: #7f6c65; margin-right: 1px;'></span>" +
                      "<span style='display: inline-block; width: 1px; height: 24px; background-color: #7f6c65; margin-right: 2px;'></span>" +
                      "<span style='display: inline-block; width: 4px; height: 24px; background-color: #7f6c65; margin-right: 1px;'></span>" +
                      "<span style='display: inline-block; width: 2px; height: 24px; background-color: #7f6c65; margin-right: 2px;'></span>" +
                      "<span style='display: inline-block; width: 1px; height: 24px; background-color: #7f6c65; margin-right: 1px;'></span>" +
                      "<span style='display: inline-block; width: 3px; height: 24px; background-color: #7f6c65; margin-right: 2px;'></span>" +
                      "<span style='display: inline-block; width: 1px; height: 24px; background-color: #7f6c65; margin-right: 1px;'></span>" +
                      "<span style='display: inline-block; width: 2px; height: 24px; background-color: #7f6c65; margin-right: 2px;'></span>" +
                      "<span style='display: inline-block; width: 4px; height: 24px; background-color: #7f6c65; margin-right: 1px;'></span>" +
                      "<span style='display: inline-block; width: 2px; height: 24px; background-color: #7f6c65; margin-right: 2px;'></span>" +
                      "<span style='display: inline-block; width: 1px; height: 24px; background-color: #7f6c65;'></span>" +
                    "</div>" +
                    "<div style='font-family: monospace; font-size: 8px; color: #7f6c65; letter-spacing: 0.15em; margin-top: 6px; text-transform: uppercase;'>SECURE ACCESS // ACTIVE ENTRY TICKET</div>" +
                  "</div>" +
                  "<div style='text-align: center; color: #eae5e2; font-size: 13px; font-weight: 600; line-height: 1.5; margin-bottom: 8px;'>Your video meeting invitation link will be sent shortly.</div>" +
                  "<div style='text-align: center; color: #7f6c65; font-size: 11px; line-height: 1.5;'>If you have any questions or files to upload beforehand, reply directly to this mail.</div>" +
                  "<hr style='border: 0; border-top: 1px solid #1f1613; margin: 28px 0;' />" +
                  "<div style='text-align: center; color: #7f6c65; font-size: 10px; line-height: 1.4;'>&copy; " + new Date().getFullYear() + " oddwebs. All rights reserved.<br/>Next.js web builds, mobile apps, & AI workflow automation.</div>" +
                "</td>" +
              "</tr>" +
            "</table>" +
          "</td>" +
        "</tr>" +
      "</table>";

    // Dispatching Emails securely
    var resendApiKey = PropertiesService.getScriptProperties().getProperty("RESEND_API_KEY");
    if (resendApiKey) {
      var fromAddress = PropertiesService.getScriptProperties().getProperty("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
      sendViaResend(adminEmail, adminSubject, adminBodyHtml, resendApiKey, fromAddress);
      
      if (clientEmail && clientEmail.trim() !== "" && clientEmail !== "Not provided") {
        sendViaResend(clientEmail, clientSubject, clientBodyHtml, resendApiKey, fromAddress);
      }
    } else {
      // Fallback to standard Google MailApp
      MailApp.sendEmail({
        to: adminEmail,
        subject: adminSubject,
        htmlBody: adminBodyHtml
      });
      
      if (clientEmail && clientEmail.trim() !== "" && clientEmail !== "Not provided") {
        MailApp.sendEmail({
          to: clientEmail,
          subject: clientSubject,
          htmlBody: clientBodyHtml
        });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendViaResend(toEmail, subject, bodyHtml, apiKey, fromAddress) {
  var url = "https://api.resend.com/emails";
  var payload = {
    "from": fromAddress,
    "to": [toEmail],
    "subject": subject,
    "html": bodyHtml
  };
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "headers": {
      "Authorization": "Bearer " + apiKey
    },
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  return response.getResponseCode() === 200 || response.getResponseCode() === 201;
}
`;
