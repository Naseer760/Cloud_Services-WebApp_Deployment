const nodemailer = require('nodemailer');

let transporter = null;

const initTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('[EmailService] SMTP transporter configured.');
  } else {
    // Graceful fallback for development/demo
    transporter = null;
    console.log('[EmailService] SMTP not configured. Live email notifications will be previewed in console.');
  }
};

const sendMatchAlertEmail = async ({ toEmail, recipientName, itemTitle, matchTitle, score, reasons, matchUrl }) => {
  if (!transporter) {
    console.log(`[EmailPreview] To: ${toEmail} | Subject: Potential Match Alert (${score}% Match): ${itemTitle}`);
    console.log(`[EmailPreview] Body: Hello ${recipientName}, a newly reported item "${matchTitle}" closely matches your report "${itemTitle}" (${score}% match score). Reasons: ${reasons.join(', ')}`);
    return { success: true, simulated: true };
  }

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a;">Campus Lost &amp; Found Portal</h2>
        <p>Hello <strong>${recipientName}</strong>,</p>
        <p>Our intelligent matching system has detected a potential match for your report: <strong>${itemTitle}</strong>.</p>
        
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 15px; margin: 15px 0;">
          <h3 style="color: #166534; margin-top: 0;">Match Score: ${score}%</h3>
          <p><strong>Matched Item:</strong> ${matchTitle}</p>
          <p><strong>Matching Factors:</strong></p>
          <ul>
            ${reasons.map((r) => `<li>${r}</li>`).join('')}
          </ul>
        </div>
        
        <p>Click below to inspect the details and coordinate safely:</p>
        <p><a href="${matchUrl}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">View Matched Report</a></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Campus Lost &amp; Found Live Alert System. Never share sensitive private credentials or ID numbers publicly.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Campus Lost & Found" <noreply@campuslostfound.edu>',
      to: toEmail,
      subject: `[Potential Match: ${score}%] "${itemTitle}" on Campus Lost & Found`,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EmailService] Error sending email:', error.message);
    return { success: false, error: error.message };
  }
};

initTransporter();

module.exports = {
  sendMatchAlertEmail,
};
