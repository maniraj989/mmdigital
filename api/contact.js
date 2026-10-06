/**
 * Vercel Serverless Function: /api/contact
 * Handles contact form submissions for MM Digital Garage via Resend Email API.
 */

const { Resend } = require('resend');

// Helper to escape HTML characters to prevent HTML injection in emails
function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Helper to validate email format
function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim()) && email.length <= 254;
}

module.exports = async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({
            success: false,
            message: `Method ${req.method} not allowed. Please use POST.`
        });
    }

    try {
        // Parse request body
        let body = req.body;
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (parseErr) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid JSON payload received.'
                });
            }
        }

        if (!body || typeof body !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Empty or invalid request body.'
            });
        }

        // Spam protection: check honeypot fields
        if (body._gotcha || body.website) {
            // Silently succeed for bots without actually sending email
            return res.status(200).json({
                success: true,
                message: 'Your inquiry has been received.'
            });
        }

        const formType = body.formType === 'proposal' ? 'proposal' : 'inquiry';

        // Extract and sanitize fields based on form type
        let customerName = '';
        let customerEmail = '';
        let customerPhone = '';
        let customerServices = '';
        let customerDetails = '';

        if (formType === 'proposal') {
            const firstName = (body.firstName || '').trim();
            const lastName = (body.lastName || '').trim();

            if (!firstName || !lastName) {
                return res.status(400).json({
                    success: false,
                    message: 'First name and last name are required.'
                });
            }

            customerName = `${firstName} ${lastName}`;
            customerEmail = (body.email || '').trim();
            customerPhone = (body.phone || '').trim();

            // Services can be an array or string
            if (Array.isArray(body.services)) {
                customerServices = body.services.join(', ');
            } else if (body.services) {
                customerServices = String(body.services).trim();
            } else {
                customerServices = 'None specified';
            }

            customerDetails = (body.notes || body.details || '').trim();
        } else {
            // Project Inquiry form (from CTA section)
            customerName = (body.name || '').trim();
            customerEmail = (body.email || '').trim();
            customerPhone = (body.phone || '').trim();
            customerServices = (body.service || '').trim();
            customerDetails = (body.details || '').trim();

            if (!customerName) {
                return res.status(400).json({
                    success: false,
                    message: 'Full name is required.'
                });
            }

            if (!customerServices) {
                return res.status(400).json({
                    success: false,
                    message: 'Please select a required service.'
                });
            }
        }

        // Validate email
        if (!isValidEmail(customerEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid business email address.'
            });
        }

        // Truncate overly long inputs for safety
        customerName = customerName.substring(0, 150);
        customerEmail = customerEmail.substring(0, 254);
        customerPhone = customerPhone.substring(0, 40);
        customerServices = customerServices.substring(0, 300);
        customerDetails = customerDetails.substring(0, 4000);

        // Check Resend API configuration
        const apiKey = process.env.RESEND_API_KEY;
        const toEmail = process.env.CONTACT_TO_EMAIL || 'mmdigitagarage@gmail.com';
        const fromEmail = process.env.CONTACT_FROM_EMAIL || 'MM Digital Garage <onboarding@resend.dev>';

        if (!apiKey) {
            console.error('Error: RESEND_API_KEY environment variable is not defined.');
            return res.status(500).json({
                success: false,
                message: 'Email service configuration is pending. Please configure RESEND_API_KEY in Vercel settings.'
            });
        }

        // Prepare email subject and badges
        const isProposal = formType === 'proposal';
        const formTitle = isProposal ? 'Proposal Request' : 'Project Inquiry';
        const emailSubject = `[${formTitle}] ${customerName} ${customerServices ? `— ${customerServices}` : ''}`;

        // Get submission metadata
        const now = new Date();
        const dateString = now.toLocaleString('en-US', {
            timeZone: 'Asia/Kathmandu',
            dateStyle: 'full',
            timeStyle: 'medium'
        });

        // Safe escaped values for HTML email
        const safeName = escapeHtml(customerName);
        const safeEmail = escapeHtml(customerEmail);
        const safePhone = customerPhone ? escapeHtml(customerPhone) : 'Not provided';
        const safeServices = escapeHtml(customerServices);
        const safeDetails = customerDetails
            ? escapeHtml(customerDetails).replace(/\n/g, '<br>')
            : '<em>No additional details provided.</em>';

        // Build HTML Email template matching MM Digital brand aesthetic
        const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F7F3; margin: 0; padding: 24px; color: #111820; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E3E3DF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
    .header { background: #0A1013; padding: 28px 32px; color: #FFFFFF; }
    .badge { display: inline-block; background: #174FAE; color: #FFFFFF; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 4px; margin-bottom: 10px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.01em; color: #FFFFFF; }
    .content { padding: 32px; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .data-table tr { border-bottom: 1px solid #EBEBE7; }
    .data-table th { text-align: left; padding: 12px 0; font-size: 13px; font-weight: 600; color: #737982; text-transform: uppercase; letter-spacing: 0.04em; width: 140px; vertical-align: top; }
    .data-table td { padding: 12px 0; font-size: 15px; color: #111820; }
    .details-box { background: #F8F7F3; border: 1px solid #E3E3DF; border-radius: 6px; padding: 18px 20px; font-size: 14px; color: #111820; margin-top: 8px; }
    .reply-btn { display: inline-block; background: #174FAE; color: #FFFFFF !important; text-decoration: none; padding: 12px 24px; font-weight: 600; font-size: 14px; border-radius: 6px; margin-top: 16px; }
    .footer { background: #F2F1EC; padding: 18px 32px; font-size: 12px; color: #737982; border-top: 1px solid #E3E3DF; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">${formTitle}</div>
      <h1>MM Digital Garage Inbound Lead</h1>
    </div>
    <div class="content">
      <table class="data-table">
        <tr>
          <th>Client Name</th>
          <td><strong>${safeName}</strong></td>
        </tr>
        <tr>
          <th>Email Address</th>
          <td><a href="mailto:${safeEmail}" style="color: #174FAE; font-weight: 600;">${safeEmail}</a></td>
        </tr>
        <tr>
          <th>Phone Number</th>
          <td>${customerPhone ? `<a href="tel:${safePhone}" style="color: #111820;">${safePhone}</a>` : 'Not provided'}</td>
        </tr>
        <tr>
          <th>${isProposal ? 'Capabilities Needed' : 'Service Required'}</th>
          <td><strong>${safeServices}</strong></td>
        </tr>
        <tr>
          <th>Submission Time</th>
          <td>${dateString} (Nepal Time)</td>
        </tr>
      </table>

      <h3 style="font-size: 15px; font-weight: 700; margin: 20px 0 8px; color: #111820;">Project Details / Client Goals:</h3>
      <div class="details-box">
        ${safeDetails}
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="mailto:${safeEmail}?subject=Re:%20MM%20Digital%20Garage%20—%20${encodeURIComponent(formTitle)}" class="reply-btn">
          Reply Directly to ${safeName} &rarr;
        </a>
      </div>
    </div>
    <div class="footer">
      Sent from MM Digital Garage Website contact engine &bull; Reply-To is set to client email (${safeEmail})
    </div>
  </div>
</body>
</html>
        `.trim();

        // Plain text fallback
        const plainText = `
=== MM DIGITAL GARAGE — ${formTitle.toUpperCase()} ===

Full Name: ${customerName}
Email: ${customerEmail}
Phone: ${customerPhone || 'Not provided'}
${isProposal ? 'Capabilities' : 'Service'}: ${customerServices}
Submitted At: ${dateString} (Nepal Time)

--- PROJECT DETAILS / GOALS ---
${customerDetails || 'No additional details provided.'}

---------------------------------------------------
Reply directly to this email to contact ${customerName} (${customerEmail}).
        `.trim();

        // Initialize Resend SDK and send email
        const resend = new Resend(apiKey);

        const sendResult = await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            reply_to: customerEmail,
            replyTo: customerEmail,
            subject: emailSubject,
            html: emailHtml,
            text: plainText
        });

        if (sendResult.error) {
            console.error('Resend API returned error:', sendResult.error);
            return res.status(500).json({
                success: false,
                message: sendResult.error.message || 'Failed to dispatch email via Resend. Please check your domain and API key.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Thank you! Your inquiry has been sent successfully. Our team will contact you shortly.',
            id: sendResult.data ? sendResult.data.id : undefined
        });

    } catch (err) {
        console.error('Unhandled server error in /api/contact:', err);
        return res.status(500).json({
            success: false,
            message: 'An unexpected server error occurred while processing your request. Please try again later.'
        });
    }
};
