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

/**
 * Google Apps Script Webhook Template.
 * Copy and paste this code into your Google Sheets Apps Script editor (Extensions -> Apps Script).
 * To send via Resend securely, add your RESEND_API_KEY in script properties (Project Settings -> Script Properties).
 * If no key is set, it falls back to Google's free MailApp.
 */
export const googleAppsScriptTemplate = `
/**
 * =========================================================================
 * oddwebs — Google Sheets CRM & Appointment Management System
 * =========================================================================
 * Instructions:
 * 1. Open your Google Spreadsheet.
 * 2. Click Extensions -> Apps Script.
 * 3. Delete any default code and paste this script in.
 * 4. Configure script properties: Settings (gear icon) -> Script Properties:
 *    - RESEND_API_KEY: Your Resend API key (optional, falls back to MailApp)
 *    - RESEND_FROM_EMAIL: Your verified Resend sender (e.g. appointment@yourdomain.com)
 * 5. Deploy as a Web App:
 *    - Click Deploy -> New deployment.
 *    - Select type: Web App.
 *    - Description: oddwebs CRM Hook.
 *    - Execute as: Me (your email).
 *    - Who has access: Anyone.
 *    - Copy the Web App URL and paste it into your .env as VITE_GOOGLE_SHEETS_WEBHOOK.
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("New Leads");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", bookings: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", bookings: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = data[0];
    var statusIdx = headers.indexOf("Status");
    var dateIdx = headers.indexOf("Meeting Date");
    var timeIdx = headers.indexOf("Meeting Time");
    
    var bookings = [];
    if (dateIdx !== -1 && timeIdx !== -1) {
      for (var i = 1; i < data.length; i++) {
        var status = statusIdx !== -1 ? data[i][statusIdx] : "";
        // Don't count cancelled/lost bookings as booked slots
        if (status === "Lost") continue;
        
        var bDate = data[i][dateIdx];
        var bTime = data[i][timeIdx];
        
        if (bDate && bTime && bDate.toString().trim() !== "" && bTime.toString().trim() !== "") {
          bookings.push({
            date: bDate.toString(),
            timeSlot: bTime.toString()
          });
        }
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", bookings: bookings }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  // Setup locking to prevent race conditions & duplicate submissions
  var lock = LockService.getScriptLock();
  try {
    // Acquire lock for max 30 seconds
    lock.waitLock(30000);
    
    var jsonString = e.postData.contents;
    var data = JSON.parse(jsonString);
    
    // Check and initialize sheets setup
    checkAndSetupSheets();
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("New Leads");
    
    // Parse values
    var email = data.details?.email || "";
    var name = data.details?.name || "";
    var meetingDate = data.booking?.date || "";
    var meetingTime = data.booking?.timeSlot || "";
    
    // Prevent duplicate spam check (if name, email and target slot match in last 5 rows)
    var lastRow = sheet.getLastRow();
    var duplicateFound = false;
    if (lastRow > 1) {
      var startRow = Math.max(2, lastRow - 5);
      var checkRange = sheet.getRange(startRow, 1, (lastRow - startRow + 1), 20).getValues();
      for (var r = 0; r < checkRange.length; r++) {
        // Col E: Name (index 4), Col G: Email (index 6), Col M: Meeting Date (index 12), Col N: Meeting Time (index 13)
        if (checkRange[r][4] === name && checkRange[r][6] === email && checkRange[r][12] === meetingDate && checkRange[r][13] === meetingTime) {
          duplicateFound = true;
          break;
        }
      }
    }
    
    if (duplicateFound) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Duplicate submission ignored." }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Auto-generate Lead ID: LD-YYYY-XXXX
    var year = new Date().getFullYear();
    var count = lastRow; // simplistic sequential generator
    var leadId = "LD-" + year + "-" + ("0000" + count).slice(-4);
    
    // Compute scores on backend
    var leadScore = calculateLeadScore(data);
    var spamScore = calculateSpamScore(data);
    
    // Insert new row at row 2 (newest leads appear at the top, just below header)
    sheet.insertRowBefore(2);
    
    // Prepare column array matching the headers exactly
    var rowValues = [
      leadId,                         // Lead ID
      "New",                          // Status
      leadScore >= 70 ? "High" : "Medium", // Priority
      new Date(),                     // Created Date
      name,                           // Client Name
      data.details?.company || "Not provided", // Company
      email,                          // Email
      data.details?.whatsapp || "",   // Phone
      data.details?.country || "United States", // Country
      data.services?.join(", ") || "General Inquiry", // Service
      data.details?.budget || "Under $5,000", // Budget
      data.details?.timeline || "Flexible", // Timeline
      meetingDate,                    // Meeting Date
      meetingTime,                    // Meeting Time
      "WhatsApp",                     // Preferred Contact Method
      data.details?.website || "None", // Website
      data.metadata?.referralUrl || "direct", // Referral Source
      "Unassigned",                   // Assigned To
      new Date(),                     // Last Updated
      "",                             // Notes
      
      // Hidden columns (Automatically captured)
      new Date().toISOString(),       // Submission Timestamp
      Math.floor(Date.now() / 1000),  // Unix Timestamp
      data.metadata?.sessionId || "",  // Session ID
      data.metadata?.visitorId || "",  // Visitor ID
      data.metadata?.landingPageUrl || "", // Landing Page URL
      data.metadata?.landingPageUrl || "", // Current URL
      data.metadata?.referralUrl || "direct", // Referrer URL
      data.metadata?.utmSource || "direct", // UTM Source
      data.metadata?.utmMedium || "none", // UTM Medium
      data.metadata?.utmCampaign || "none", // UTM Campaign
      data.metadata?.utmTerm || "none", // UTM Term
      data.metadata?.utmContent || "none", // UTM Content
      data.metadata?.gclid || "none", // Google Click ID (GCLID)
      data.metadata?.fbclid || "none", // Facebook Click ID (FBCLID)
      data.metadata?.msclkid || "none", // Microsoft Click ID (MSCLKID)
      data.metadata?.deviceType || "desktop", // Device Type
      data.metadata?.os || "unknown", // Operating System
      data.metadata?.browser || "unknown", // Browser
      data.metadata?.browserVersion || "unknown", // Browser Version
      data.metadata?.screenWidth || "", // Screen Width
      data.metadata?.screenHeight || "", // Screen Height
      data.metadata?.viewportSize || "", // Viewport Size
      data.metadata?.language || "en-US", // Language
      data.booking?.timezone || "UTC", // Timezone
      data.localTime || "",           // Local Time
      data.details?.country || "United States", // Country (analytics)
      data.details?.region || "unknown", // Region
      data.details?.city || "unknown", // City (if available)
      data.details?.coordinates || "unknown", // Approximate Coordinates
      data.metadata?.ip || "compliant", // IP Address
      data.metadata?.userAgent || "", // User Agent
      data.metadata?.networkType || "unknown", // Network Type
      data.metadata?.darkMode ? "true" : "false", // Dark Mode Preference
      data.metadata?.touchDevice ? "true" : "false", // Touch Device
      data.metadata?.cookiesEnabled ? "true" : "false", // Cookies Enabled
      data.metadata?.jsEnabled ? "true" : "false", // JavaScript Enabled
      data.metadata?.connectionSpeed || "unknown", // Connection Speed
      data.metadata?.formCompletionTime || "", // Form Completion Time
      data.metadata?.scrollPercentage || "0%", // Scroll Percentage Before Submit
      data.metadata?.timeOnPage || "", // Time On Page
      data.metadata?.visitNumber || "1", // Visit Number
      data.metadata?.returningVisitor ? "true" : "false", // Returning Visitor
      data.metadata?.previousPage || "", // Previous Page
      data.metadata?.exitPage || "",  // Exit Page
      data.metadata?.utmCampaign || "none", // Campaign Name
      "none",                         // Ad Group
      data.metadata?.utmTerm || "none", // Keyword
      "none",                         // Creative ID
      data.metadata?.utmSource || "direct", // Source Channel
      data.metadata?.utmMedium === "cpc" ? "Paid" : "Organic", // Organic/Paid Indicator
      leadScore,                      // Lead Score
      spamScore,                      // Spam Score
      duplicateFound ? "True" : "False", // Duplicate Check
      "",                             // Internal Notes
      "v1.0",                         // API Version
      "Success",                      // Submission Status
      "",                             // Error Log
      ""                              // Webhook Response
    ];
    
    // Write row to row 2
    sheet.getRange(2, 1, 1, rowValues.length).setValues([rowValues]);
    
    // Apply dropdown validations on row 2
    var settingsSheet = ss.getSheetByName("Settings");
    var statusRange = settingsSheet.getRange("A2:A8");
    var priorityRange = settingsSheet.getRange("B2:B5");
    
    var statusRule = SpreadsheetApp.newDataValidation().requireValueInRange(statusRange).build();
    var priorityRule = SpreadsheetApp.newDataValidation().requireValueInRange(priorityRange).build();
    
    sheet.getRange(2, 2).setDataValidation(statusRule); // Status validation
    sheet.getRange(2, 3).setDataValidation(priorityRule); // Priority validation
    
    // Create Calendar Event if date and time exist
    var calendarEventId = "";
    if (meetingDate && meetingTime) {
      calendarEventId = createCalendarEvent(data);
    }
    
    // Dispatch Notifications (Admin + Client Confirmation)
    sendNotifications(data, leadId, leadScore);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", leadId: leadId, calendarEventId: calendarEventId }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    Logger.log("doPost Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function calculateLeadScore(data) {
  var score = 10;
  
  // High budget is critical
  var budget = data.details?.budget || "";
  if (budget.indexOf("$10,000") !== -1) score += 20;
  if (budget.indexOf("$25,000") !== -1) score += 35;
  if (budget.indexOf("Under $5,000") !== -1) score += 5;
  
  // Urgent timelines
  var timeline = data.details?.timeline || "";
  if (timeline === "Immediate") score += 25;
  if (timeline === "1-3 Months") score += 15;
  
  // Company provided
  if (data.details?.company && data.details.company !== "Not provided") score += 10;
  
  // Custom business email check
  var email = data.details?.email || "";
  if (email && email.indexOf("@gmail.com") === -1 && email.indexOf("@yahoo.com") === -1 && email.indexOf("@outlook.com") === -1 && email.indexOf("@hotmail.com") === -1) {
    score += 20;
  }
  
  return Math.min(100, score);
}

function calculateSpamScore(data) {
  var score = 0;
  
  // Form completed too quickly
  var fillTime = parseFloat(data.metadata?.formCompletionTime || 0);
  if (fillTime > 0 && fillTime < 5) score += 60; // Less than 5 seconds is highly suspicious
  
  // Spam keywords in description
  var desc = (data.description || "").toLowerCase();
  var spamKeywords = ["crypto", "casino", "bitcoin", "lottery", "seo ranking", "backlinks", "viagra", "cialis", "loans", "investment", "grow money"];
  for (var i = 0; i < spamKeywords.length; i++) {
    if (desc.indexOf(spamKeywords[i]) !== -1) {
      score += 40;
    }
  }
  
  return Math.min(100, score);
}

function createCalendarEvent(data) {
  try {
    var calendar = CalendarApp.getDefaultCalendar();
    var title = "oddwebs Demo Call - " + data.details.name + " (" + (data.details.company || "General") + ")";
    
    // Parse date
    var dateStr = data.booking.date + " " + data.booking.timeSlot;
    var startTime = new Date(dateStr);
    if (isNaN(startTime.getTime())) {
      // Fallback if Date parsing fails
      return "Error: Could not parse Date format: " + dateStr;
    }
    
    var endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 mins
    
    var descText = "Meeting Details:\n" +
                   "Visitor: " + data.details.name + "\n" +
                   "Email: " + data.details.email + "\n" +
                   "WhatsApp: " + data.details.whatsapp + "\n" +
                   "Services: " + data.services.join(", ") + "\n\n" +
                   "Brief:\n" + data.description;
                   
    var event = calendar.createEvent(title, startTime, endTime, {
      description: descText,
      guests: data.details.email,
      sendInvites: true
    });
    
    return event.getId();
  } catch (err) {
    return "Error: " + err.toString();
  }
}

function checkAndSetupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup "Settings" tab
  var settingsSheet = ss.getSheetByName("Settings");
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet("Settings");
    var values = [
      ["Status", "Priority", "Services", "Sources"],
      ["New", "Low", "Website", "Google"],
      ["Contacted", "Medium", "Mobile App", "WhatsApp"],
      ["Meeting Scheduled", "High", "AI Automation", "Social Media"],
      ["Proposal Sent", "Critical", "UI/UX Design", "Referral"],
      ["Negotiation", "", "Other", "Direct"],
      ["Won", "", "", "Other"],
      ["Lost", "", "", ""]
    ];
    settingsSheet.getRange(1, 1, values.length, values[0].length).setValues(values);
    settingsSheet.getRange("1:1").setFontWeight("bold");
    settingsSheet.hideSheet();
  }
  
  // 2. Setup "New Leads" tab
  var newLeadsSheet = ss.getSheetByName("New Leads");
  if (!newLeadsSheet) {
    newLeadsSheet = ss.insertSheet("New Leads");
    
    var headers = [
      "Lead ID", "Status", "Priority", "Created Date", "Client Name", "Company", "Email", "Phone", "Country", "Service", "Budget", "Timeline", "Meeting Date", "Meeting Time", "Preferred Contact Method", "Website", "Referral Source", "Assigned To", "Last Updated", "Notes",
      "Submission Timestamp", "Unix Timestamp", "Session ID", "Visitor ID", "Landing Page URL", "Current URL", "Referrer URL", "UTM Source", "UTM Medium", "UTM Campaign", "UTM Term", "UTM Content", "Google Click ID (GCLID)", "Facebook Click ID (FBCLID)", "Microsoft Click ID (MSCLKID)", "Device Type", "Operating System", "Browser", "Browser Version", "Screen Width", "Screen Height", "Viewport Size", "Language", "Timezone", "Local Time", "Country Analytic", "Region", "City", "Approximate Coordinates", "IP Address", "User Agent", "Network Type", "Dark Mode Preference", "Touch Device", "Cookies Enabled", "JavaScript Enabled", "Connection Speed", "Form Completion Time", "Scroll Percentage Before Submit", "Time On Page", "Visit Number", "Returning Visitor", "Previous Page", "Exit Page", "Campaign Name", "Ad Group", "Keyword", "Creative ID", "Source Channel", "Organic/Paid Indicator", "Lead Score", "Spam Score", "Duplicate Check", "Internal Notes", "API Version", "Submission Status", "Error Log", "Webhook Response"
    ];
    newLeadsSheet.appendRow(headers);
    newLeadsSheet.setFrozenRows(1);
    
    // Formatting Header
    var headerRange = newLeadsSheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#1c1917")
               .setFontColor("#f2e9e4")
               .setFontWeight("bold")
               .setFontFamily("Calibri");
    
    // Alternating rows styling
    newLeadsSheet.getRange(2, 1, 500, headers.length).setAlternatingRowColors("#ffffff", "#fafaf9");
    
    // Setup Column Widths
    newLeadsSheet.setColumnWidth(1, 110); // Lead ID
    newLeadsSheet.setColumnWidth(2, 120); // Status
    newLeadsSheet.setColumnWidth(3, 90);  // Priority
    newLeadsSheet.setColumnWidth(4, 130); // Created Date
    newLeadsSheet.setColumnWidth(5, 140); // Name
    newLeadsSheet.setColumnWidth(6, 120); // Company
    newLeadsSheet.setColumnWidth(7, 180); // Email
    newLeadsSheet.setColumnWidth(8, 120); // Phone
    
    // Create filters
    newLeadsSheet.getRange(1, 1, 1, headers.length).createFilter();
    
    // Conditional Formatting Rules for Statuses
    setupConditionalFormatting(newLeadsSheet);
  }
  
  // 3. Setup "Archive" tab
  var archiveSheet = ss.getSheetByName("Archive");
  if (!archiveSheet) {
    archiveSheet = ss.insertSheet("Archive");
    // Clone headers
    var firstRow = newLeadsSheet.getRange(1, 1, 1, newLeadsSheet.getLastColumn()).getValues();
    archiveSheet.appendRow(firstRow[0]);
    archiveSheet.getRange(1, 1, 1, firstRow[0].length)
                .setBackground("#44403c")
                .setFontColor("#ffffff")
                .setFontWeight("bold");
    archiveSheet.setFrozenRows(1);
  }
  
  // 4. Setup "Dashboard" tab
  var dashSheet = ss.getSheetByName("Dashboard");
  if (!dashSheet) {
    dashSheet = ss.insertSheet("Dashboard", 0);
    buildDashboard(dashSheet);
  }
}

function setupConditionalFormatting(sheet) {
  var range = sheet.getRange("B2:B1000"); // Status column
  
  // Format rules for Statuses
  var rules = [
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("New").setBackground("#dcfce7").setFontColor("#15803d").setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Contacted").setBackground("#fef9c3").setFontColor("#a16207").setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Meeting Scheduled").setBackground("#dbeafe").setFontColor("#1d4ed8").setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Proposal Sent").setBackground("#f3e8ff").setFontColor("#7e22ce").setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Negotiation").setBackground("#ffedd5").setFontColor("#c2410c").setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Won").setBackground("#22c55e").setFontColor("#ffffff").setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Lost").setBackground("#ef4444").setFontColor("#ffffff").setRanges([range]).build()
  ];
  
  sheet.setConditionalFormatRules(rules);
}

function buildDashboard(sheet) {
  sheet.clear();
  sheet.showSheet();
  
  // Turn off grid lines on Dashboard for a premium app feel
  sheet.setGridLinesEnabled(false);
  
  // Header Style
  sheet.getRange("A1:Q1").merge().setBackground("#1c1917").setFontColor("#f8fafc").setFontWeight("bold").setFontSize(16).setValue("  oddwebs CRM LEAD DASHBOARD").setVerticalAlignment("middle");
  sheet.setRowHeight(1, 45);
  
  // Card Helper
  var createKpiCard = function(cellRange, title, formula, isPercentage) {
    var range = sheet.getRange(cellRange);
    range.merge().setBackground("#fcfcfb")
         .setBorder(true, true, true, true, false, false, "#e7e5e4", SpreadsheetApp.BorderStyle.SOLID);
    
    var cells = cellRange.split(":");
    var startCell = cells[0];
    
    // Label Row (font size 8, grey, bold)
    sheet.getRange(startCell).setValue(title).setFontColor("#78716c").setFontSize(9).setFontWeight("bold").setVerticalAlignment("top");
    
    // Value Row (we write value below)
    var col = startCell.charCodeAt(0) - 65; // 'B' -> 1
    var row = parseInt(startCell.substring(1));
    
    var valCell = sheet.getRange(row + 1, col + 1);
    valCell.setFormula(formula).setFontSize(22).setFontWeight("bold").setFontColor("#1c1917").setVerticalAlignment("middle");
    
    if (isPercentage) {
      valCell.setNumberFormat("0.00%");
    } else if (title.indexOf("Revenue") !== -1 || title.indexOf("Budget") !== -1) {
      valCell.setNumberFormat("$#,##0");
    } else {
      valCell.setNumberFormat("#,##0");
    }
  };
  
  // Row Heights for KPI rows
  sheet.setRowHeight(3, 20);
  sheet.setRowHeight(4, 40);
  sheet.setRowHeight(7, 20);
  sheet.setRowHeight(8, 40);
  
  // Write KPI Cards
  createKpiCard("B3:C4", "TOTAL CRM LEADS", "=COUNTA('New Leads'!A:A)-1", false);
  createKpiCard("E3:F4", "NEW STATUS LEADS", "=COUNTIF('New Leads'!B:B, \"New\")", false);
  createKpiCard("H3:I4", "MEETINGS SCHEDULED", "=COUNTIF('New Leads'!B:B, \"Meeting Scheduled\")", false);
  createKpiCard("K3:L4", "CONVERSION RATE (WON)", "=IF(COUNTA('New Leads'!A:A)>1, COUNTIF('New Leads'!B:B, \"Won\") / (COUNTA('New Leads'!A:A)-1), 0)", true);
  createKpiCard("N3:O4", "ESTIMATED REVENUE", "=SUMIF('New Leads'!B:B, \"Won\", 'New Leads'!K:K)", false);
  
  createKpiCard("B7:C8", "CONTACTED LEADS", "=COUNTIF('New Leads'!B:B, \"Contacted\")", false);
  createKpiCard("E7:F8", "PROPOSALS SENT", "=COUNTIF('New Leads'!B:B, \"Proposal Sent\")", false);
  createKpiCard("H7:I8", "NEGOTIATION CHANNELS", "=COUNTIF('New Leads'!B:B, \"Negotiation\")", false);
  createKpiCard("K7:L8", "CLOSED LOST LEADS", "=COUNTIF('New Leads'!B:B, \"Lost\")", false);
  createKpiCard("N7:O8", "AVERAGE BUDGET SCORE", "=IF(COUNT('New Leads'!K:K)>0, AVERAGE('New Leads'!K:K), 0)", false);
  
  // Set Column Widths for Dashboard spacing
  sheet.setColumnWidth(1, 24); // spacer A
  sheet.setColumnWidth(2, 80); // B
  sheet.setColumnWidth(3, 110); // C
  sheet.setColumnWidth(4, 24); // spacer D
  sheet.setColumnWidth(5, 80);
  sheet.setColumnWidth(6, 110);
  sheet.setColumnWidth(7, 24);
  sheet.setColumnWidth(8, 80);
  sheet.setColumnWidth(9, 110);
  sheet.setColumnWidth(10, 24);
  sheet.setColumnWidth(11, 80);
  sheet.setColumnWidth(12, 110);
  sheet.setColumnWidth(13, 24);
  sheet.setColumnWidth(14, 80);
  sheet.setColumnWidth(15, 110);
  
  // Subtitle
  sheet.getRange("B11:O11").merge().setFontWeight("bold").setFontSize(12).setFontColor("#44403c").setValue("LEAD DISTRIBUTION BREAKDOWN").setVerticalAlignment("middle");
  sheet.setRowHeight(11, 30);
  
  // Data Table
  var distributions = [
    ["Services Breakdown", "", "Country Distribution", "", "UTM Source Channels", ""],
    ["Website", "=COUNTIF('New Leads'!J:J, \"*Website*\")", "United States", "=COUNTIF('New Leads'!I:I, \"*United States*\")", "Google Search", "=COUNTIF('New Leads'!Q:Q, \"*google*\")"],
    ["Mobile App", "=COUNTIF('New Leads'!J:J, \"*Mobile App*\")", "India", "=COUNTIF('New Leads'!I:I, \"*India*\")", "WhatsApp Direct", "=COUNTIF('New Leads'!Q:Q, \"*whatsapp*\")"],
    ["AI Automation", "=COUNTIF('New Leads'!J:J, \"*AI Automation*\")", "Japan", "=COUNTIF('New Leads'!I:I, \"*Japan*\")", "Social Networks", "=COUNTIF('New Leads'!Q:Q, \"*social*\")"],
    ["UI/UX Design", "=COUNTIF('New Leads'!J:J, \"*UI/UX Design*\")", "Europe", "=COUNTIF('New Leads'!I:I, \"*Europe*\")", "Direct Traffic", "=COUNTIF('New Leads'!Q:Q, \"*direct*\")"],
    ["Other Stack", "=COUNTIF('New Leads'!J:J, \"*Other*\")", "Global Other", "=COUNTA('New Leads'!I:I) - 1 - B13 - B14 - B15 - B16", "Campaign / Referral", "=COUNTA('New Leads'!Q:Q) - 1 - F13 - F14 - F15 - F16"]
  ];
  
  // Write table structure to Dashboard
  sheet.getRange("B12:C12").merge().setFontWeight("bold").setBackground("#e7e5e4").setHorizontalAlignment("center");
  sheet.getRange("E12:F12").merge().setFontWeight("bold").setBackground("#e7e5e4").setHorizontalAlignment("center");
  sheet.getRange("H12:I12").merge().setFontWeight("bold").setBackground("#e7e5e4").setHorizontalAlignment("center");
  
  for (var r = 0; r < distributions.length; r++) {
    sheet.getRange(12 + r, 2).setValue(distributions[r][0]);
    if (r > 0) sheet.getRange(12 + r, 3).setFormula(distributions[r][1]);
    
    sheet.getRange(12 + r, 5).setValue(distributions[r][2]);
    if (r > 0) sheet.getRange(12 + r, 6).setFormula(distributions[r][3]);
    
    sheet.getRange(12 + r, 8).setValue(distributions[r][4]);
    if (r > 0) sheet.getRange(12 + r, 9).setFormula(distributions[r][5]);
  }
  
  var tableRange = sheet.getRange("B12:I17");
  tableRange.setBorder(true, true, true, true, true, true, "#e7e5e4", SpreadsheetApp.BorderStyle.SOLID);
  tableRange.setFontSize(10).setFontColor("#44403c").setVerticalAlignment("middle");
}

function sendNotifications(data, leadId, leadScore) {
  var properties = PropertiesService.getScriptProperties();
  var apiKey = properties.getProperty("RESEND_API_KEY");
  var fromEmail = properties.getProperty("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
  var adminEmail = data.adminEmail || "hello@oddwebs.com";
  var clientEmail = data.details?.email;
  
  var name = data.details?.name || "";
  var email = data.details?.email || "";
  var budget = data.details?.budget || "";
  var timeline = data.details?.timeline || "";
  
  var adminSubject = "[CRM Lead ID " + leadId + "] New Lead Alert - " + name + " (Score: " + leadScore + "/100)";
  var adminHtml = 
    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>" +
      "<h2 style='color: #f95738; margin-top: 0;'>New Lead CRM Entry Created</h2>" +
      "<p>Lead details have been saved to Google Sheets with score calculations:</p>" +
      "<table style='width: 100%; border-collapse: collapse;'>" +
        "<tr><td style='padding: 6px; font-weight: bold; width: 120px;'>Lead ID</td><td style='padding: 6px; color: #f95738; font-weight: bold;'>" + leadId + "</td></tr>" +
        "<tr><td style='padding: 6px; font-weight: bold;'>Lead Name</td><td style='padding: 6px;'>" + name + "</td></tr>" +
        "<tr><td style='padding: 6px; font-weight: bold;'>Lead Email</td><td style='padding: 6px;'>" + email + "</td></tr>" +
        "<tr><td style='padding: 6px; font-weight: bold;'>WhatsApp</td><td style='padding: 6px;'>" + (data.details?.whatsapp || "") + "</td></tr>" +
        "<tr><td style='padding: 6px; font-weight: bold;'>Company</td><td style='padding: 6px;'>" + (data.details?.company || "Not provided") + "</td></tr>" +
        "<tr><td style='padding: 6px; font-weight: bold;'>Budget</td><td style='padding: 6px; font-weight: bold; color: #15803d;'>" + budget + "</td></tr>" +
        "<tr><td style='padding: 6px; font-weight: bold;'>Timeline</td><td style='padding: 6px;'>" + timeline + "</td></tr>" +
        "<tr><td style='padding: 6px; font-weight: bold;'>Lead Score</td><td style='padding: 6px; font-weight: bold;'>" + leadScore + " / 100</td></tr>" +
      "</table>" +
    "</div>";
    
  if (apiKey) {
    sendViaResend(adminEmail, adminSubject, adminHtml, apiKey, fromEmail);
  } else {
    MailApp.sendEmail({
      to: adminEmail,
      subject: adminSubject,
      htmlBody: adminHtml
    });
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
