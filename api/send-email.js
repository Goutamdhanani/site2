import { Resend } from 'resend';

// Helper to sanitize HTML input
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured in environment variables.');
    return res.status(500).json({ 
      error: 'Resend API key is missing. Please set RESEND_API_KEY in your hosting environment.' 
    });
  }

  const resend = new Resend(apiKey);
  const data = req.body;

  if (!data || !data.id || !data.details || !data.details.name) {
    return res.status(400).json({ error: 'Invalid payload: missing booking details.' });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'oddwebs <onboarding@resend.dev>';
  const adminEmail = process.env.VITE_ADMIN_EMAIL || 'hello@oddwebs.com';
  const clientEmail = data.details?.email;
  const servicesList = Array.isArray(data.services) ? data.services.join(', ') : 'General Inquiry';
  
  const whatsappNumber = data.details?.whatsapp || '';
  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, '');
  const bookingDate = data.booking?.date || 'Not scheduled';
  const bookingSlot = data.booking?.timeSlot || 'Not scheduled';
  const bookingTimezone = data.booking?.timezone || data.details?.timezone || 'UTC';

  try {
    // ----------------------------------------------------
    // 1. ADMIN EMAIL: Alert admin of new lead
    // ----------------------------------------------------
    const adminSubject = `[New Lead] oddwebs Booking ${data.id} - ${data.details?.name}`;
    const adminHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fafafa;">
        <h2 style="color: #f95738; margin-top: 0; font-size: 22px; font-weight: 800;">New Lead Demo Request</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.5;">A new design/dev roadmap request has been compiled. Lead details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569; width: 140px;">Booking ID</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${escapeHtml(data.id)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Lead Name</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600;">${escapeHtml(data.details?.name)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Email</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a;">
              <a href="mailto:${clientEmail}" style="color: #f95738; text-decoration: none;">${escapeHtml(clientEmail || 'Not provided')}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">WhatsApp</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a;">
              <a href="https://wa.me/${cleanWhatsapp}" style="color: #f95738; text-decoration: none;">${escapeHtml(whatsappNumber || 'Not provided')}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Company</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${escapeHtml(data.details?.company || 'Not provided')}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Website</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${escapeHtml(data.details?.website || 'None')}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Industry</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${escapeHtml(data.details?.industry || 'Other')}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Business Size</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${escapeHtml(data.details?.businessSize || '1-10 employees')}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Budget</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #15803d; font-weight: bold;">${escapeHtml(data.details?.budget || 'Under $5,000')}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Timeline</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${escapeHtml(data.details?.timeline || 'Flexible')}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Location & TZ</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${escapeHtml(data.details?.country || 'Unknown')} (${escapeHtml(data.details?.timezone || 'Unknown')})</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Meeting Target</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600;">${escapeHtml(bookingDate)} @ ${escapeHtml(bookingSlot)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Services Stack</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #ee9b00; font-family: monospace;">${escapeHtml(servicesList)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569; vertical-align: top;">Project Brief</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #334155; line-height: 1.4;">${escapeHtml(data.description || 'None provided.')}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569; vertical-align: top;">Additional Notes</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #334155; line-height: 1.4;">${escapeHtml(data.details?.additionalNotes || 'None provided.')}</td>
          </tr>
        </table>

        <h3 style="color: #ee9b00; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 24px; margin-bottom: 8px;">Marketing Metadata</h3>
        <table style="width: 100%; font-size: 12px; color: #64748b;">
          <tr>
            <td style="width: 140px; padding: 4px 0;">Referral Source</td>
            <td>${escapeHtml(data.metadata?.referralUrl || 'direct')}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">UTM Stack</td>
            <td>Source: ${escapeHtml(data.metadata?.utmSource || 'direct')} | Med: ${escapeHtml(data.metadata?.utmMedium || 'none')} | Camp: ${escapeHtml(data.metadata?.utmCampaign || 'none')}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">Device Profiler</td>
            <td>${escapeHtml(data.metadata?.deviceType || 'unknown')} (${escapeHtml(data.metadata?.screenResolution || 'unknown')})</td>
          </tr>
        </table>
      </div>
    `;

    // Send admin notification
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: adminSubject,
      html: adminHtml,
    });

    // ----------------------------------------------------
    // 2. CLIENT EMAIL: Send booking confirmation receipt
    // ----------------------------------------------------
    let clientStatus = 'No email provided';
    if (clientEmail && clientEmail.trim() !== '' && clientEmail !== 'Not provided') {
      const clientSubject = 'Your Demo Booking is Confirmed — oddwebs';
      const clientHtml = `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0806; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <tr>
            <td align="center" style="padding: 40px 16px;">
              <!-- Main Ticket Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; width: 100%; background-color: #0e0a08; border: 1px solid #2d1f1b; border-top: 4px solid #f95738; border-radius: 20px; text-align: left;">
                <tr>
                  <td style="padding: 36px 28px;">
                    
                    <!-- Header -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                      <tr>
                        <td>
                          <span style="font-size: 26px; font-weight: 900; letter-spacing: -0.03em; color: #ffffff;">odd<span style="color: #f95738;">webs</span></span>
                          <div style="color: #7f6c65; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px;">We Build Digital Powerhouses</div>
                        </td>
                        <td style="text-align: right; vertical-align: top;">
                          <span style="font-family: monospace; font-size: 9px; font-weight: 700; color: #ee9b00; background: rgba(238, 155, 0, 0.1); border: 1px solid rgba(238, 155, 0, 0.25); padding: 4px 10px; border-radius: 100px; letter-spacing: 0.05em; display: inline-block;">APPOINTMENT PASS</span>
                        </td>
                      </tr>
                    </table>

                    <div style="color: #eae5e2; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                      Hi ${escapeHtml(data.details?.name)},
                    </div>
                    <div style="color: #eae5e2; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                      Your free live demo call is confirmed! Our engineering team is currently reviewing your project details to prepare your custom technical roadmap proposal.
                    </div>

                    <!-- Tear-off dashed divider -->
                    <div style="margin: 24px 0; border-top: 1px dashed #3d2d27; font-size: 0; line-height: 0;"></div>

                    <!-- Ticket details -->
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top; width: 50%;">
                          <div style="font-family: monospace; font-size: 9px; color: #7f6c65; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;">VISITOR</div>
                          <div style="font-size: 14px; font-weight: 700; color: #eae5e2;">${escapeHtml(data.details?.name)}</div>
                        </td>
                        <td style="padding: 8px 0; vertical-align: top; width: 50%; text-align: right;">
                          <div style="font-family: monospace; font-size: 9px; color: #7f6c65; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;">REFERENCE</div>
                          <div style="font-size: 14px; font-weight: 700; color: #f95738; font-family: monospace;">${escapeHtml(data.id)}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0 8px 0; vertical-align: top;" colspan="2">
                          <div style="font-family: monospace; font-size: 9px; color: #7f6c65; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;">MEETING TARGET</div>
                          <div style="font-size: 14px; font-weight: 700; color: #eae5e2;">${escapeHtml(bookingDate)}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; vertical-align: top;">
                          <div style="font-family: monospace; font-size: 9px; color: #7f6c65; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;">TIME SLOT</div>
                          <div style="font-size: 14px; font-weight: 700; color: #eae5e2;">${escapeHtml(bookingSlot)}</div>
                        </td>
                        <td style="padding: 8px 0; vertical-align: top; text-align: right;">
                          <div style="font-family: monospace; font-size: 9px; color: #7f6c65; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;">TIMEZONE</div>
                          <div style="font-size: 13px; font-weight: 600; color: #eae5e2;">${escapeHtml(bookingTimezone)}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0 0 0; vertical-align: top;" colspan="2">
                          <div style="font-family: monospace; font-size: 9px; color: #7f6c65; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;">REQUESTED STACK</div>
                          <div style="font-family: monospace; font-size: 13px; font-weight: 700; color: #ee9b00;">${escapeHtml(servicesList)}</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Tear-off dashed divider -->
                    <div style="margin: 28px 0; border-top: 1px dashed #3d2d27; font-size: 0; line-height: 0;"></div>

                    <!-- Barcode -->
                    <div style="text-align: center; margin-bottom: 24px;">
                      <div style="display: inline-block; height: 24px; background: transparent; letter-spacing: 0; font-size: 0; line-height: 0;">
                        <span style="display: inline-block; width: 2px; height: 24px; background-color: #7f6c65; margin-right: 1px;"></span>
                        <span style="display: inline-block; width: 1px; height: 24px; background-color: #7f6c65; margin-right: 2px;"></span>
                        <span style="display: inline-block; width: 3px; height: 24px; background-color: #7f6c65; margin-right: 1px;"></span>
                        <span style="display: inline-block; width: 1px; height: 24px; background-color: #7f6c65; margin-right: 2px;"></span>
                        <span style="display: inline-block; width: 4px; height: 24px; background-color: #7f6c65; margin-right: 1px;"></span>
                        <span style="display: inline-block; width: 2px; height: 24px; background-color: #7f6c65; margin-right: 2px;"></span>
                        <span style="display: inline-block; width: 1px; height: 24px; background-color: #7f6c65; margin-right: 1px;"></span>
                        <span style="display: inline-block; width: 3px; height: 24px; background-color: #7f6c65; margin-right: 2px;"></span>
                        <span style="display: inline-block; width: 1px; height: 24px; background-color: #7f6c65; margin-right: 1px;"></span>
                        <span style="display: inline-block; width: 2px; height: 24px; background-color: #7f6c65; margin-right: 2px;"></span>
                        <span style="display: inline-block; width: 4px; height: 24px; background-color: #7f6c65; margin-right: 1px;"></span>
                        <span style="display: inline-block; width: 2px; height: 24px; background-color: #7f6c65; margin-right: 2px;"></span>
                        <span style="display: inline-block; width: 1px; height: 24px; background-color: #7f6c65;"></span>
                      </div>
                      <div style="font-family: monospace; font-size: 8px; color: #7f6c65; letter-spacing: 0.15em; margin-top: 6px; text-transform: uppercase;">SECURE ACCESS // ACTIVE ENTRY TICKET</div>
                    </div>

                    <div style="text-align: center; color: #eae5e2; font-size: 13px; font-weight: 600; line-height: 1.5; margin-bottom: 8px;">
                      Your video meeting invitation link will be sent shortly.
                    </div>
                    <div style="text-align: center; color: #7f6c65; font-size: 11px; line-height: 1.5;">
                      If you have any questions or files to upload beforehand, reply directly to this mail.
                    </div>

                    <hr style="border: 0; border-top: 1px solid #1f1613; margin: 28px 0;" />

                    <div style="text-align: center; color: #7f6c65; font-size: 10px; line-height: 1.4;">
                      &copy; ${new Date().getFullYear()} oddwebs. All rights reserved.<br/>
                      Next.js web builds, mobile apps, & AI workflow automation.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;

      try {
        await resend.emails.send({
          from: fromEmail,
          to: clientEmail,
          subject: clientSubject,
          html: clientHtml,
        });
        clientStatus = 'Sent successfully';
      } catch (clientErr) {
        console.error('Error sending confirmation email to client:', clientErr);
        clientStatus = `Failed: ${clientErr.message}`;
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Lead processed successfully.', 
      clientEmailStatus: clientStatus 
    });

  } catch (error) {
    console.error('Error dispatching emails via Resend:', error);
    return res.status(500).json({ 
      error: `Resend Dispatch Failure: ${error.message}. Make sure your sender domain is verified if sending to third-party clients.` 
    });
  }
}
