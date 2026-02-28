import nodemailer from "nodemailer";


/* =====================================================
   SMTP CONFIGURATION (GMAIL)
===================================================== */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER, // e.g. bhavanabaria13@gmail.com
    pass: process.env.SMTP_PASSWORD, // Gmail App Password
  },
});

/* Optional SMTP verification */
transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP configuration error:", error);
  } else {
    console.log("✅ SMTP server is ready");
  }
});

/* =====================================================
   APPROVAL EMAIL
===================================================== */

export async function sendApprovalEmail(
  to: string,
  name: string,
  password: string,
): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"EtherAuthority Internships" <${process.env.SMTP_USER}>`,
      to,
      subject: "🎉 Your Internship Application Has Been Approved!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px; }
            .content { padding: 40px 30px; background-color: #ffffff; }
            .greeting { color: #1f2937; font-size: 22px; font-weight: 600; margin-bottom: 20px; }
            .message { color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px; }
            .credentials-box { background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: #ffffff; padding: 25px; border-radius: 8px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .credentials-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; text-align: center; }
            .credential-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
            .credential-row:last-child { border-bottom: none; }
            .credential-label { color: #9ca3af; font-size: 14px; }
            .credential-value { font-size: 18px; font-weight: 700; letter-spacing: 1px; font-family: 'Courier New', monospace; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 25px 0; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3); }
            .cta-button:hover { box-shadow: 0 6px 8px rgba(16, 185, 129, 0.4); }
            .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 25px 0; }
            .warning-text { color: #92400e; font-size: 14px; margin: 0; }
            .footer { background-color: #1f2937; padding: 30px; text-align: center; }
            .footer-text { color: #9ca3af; font-size: 14px; margin: 5px 0; }
            .footer-link { color: #10b981; text-decoration: none; }
            .footer-link:hover { color: #34d399; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
            </div>
            <div class="content">
              <div class="greeting">Hello ${name},</div>
              <p class="message">
                We are thrilled to inform you that your internship application has been <strong>approved</strong>! Welcome to the EtherAuthority team!
              </p>
              <p class="message">
                You can now access your intern dashboard using the credentials below:
              </p>
              <div class="credentials-box">
                <div class="credentials-title">Your Login Credentials</div>
                <div class="credential-row">
                  <span class="credential-label">Email:</span>
                  <span class="credential-value">${to}</span>
                </div>
                <div class="credential-row">
                  <span class="credential-label">Password:</span>
                  <span class="credential-value">${password}</span>
                </div>
              </div>
              <div class="warning">
                <p class="warning-text">
                  ⚠️ <strong>Important:</strong> Please change your password after your first login for security reasons.
                </p>
              </div>
              <div style="text-align: center;">
                <a href="${process.env.APP_URL || "http://localhost:5000"}/intern/login" class="cta-button">
                  Login to Dashboard
                </a>
              </div>
              <p class="message" style="margin-top: 40px;">
                We're excited to have you on board and look forward to working with you!
              </p>
              <p class="message">
                Best regards,<br>
                <strong>The EtherAuthority Team</strong>
              </p>
            </div>
            <div class="footer">
              <p class="footer-text">EtherAuthority - Leading Blockchain Solutions</p>
              <p class="footer-text">
                <a href="https://etherauthority.io" class="footer-link">etherauthority.io</a>
              </p>
              <p class="footer-text" style="margin-top: 15px; font-size: 12px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log("Approval email sent to:", to);
  } catch (error) {
    console.error("Failed to send approval email:", error);
  }
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  tempPassword: string,
): Promise<void> {
  try {
    await transporter.sendMail({
       from: `"EtherAuthority Internships" <${process.env.SMTP_USER}>`,
      to,
      subject: "Password Reset - EtherAuthority Internship Portal",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px; }
            .content { padding: 40px 30px; background-color: #ffffff; }
            .greeting { color: #1f2937; font-size: 22px; font-weight: 600; margin-bottom: 20px; }
            .message { color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px; }
            .password-box { background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: #ffffff; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .password { font-size: 32px; font-weight: 700; letter-spacing: 2px; font-family: 'Courier New', monospace; }
            .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 25px 0; }
            .warning-text { color: #92400e; font-size: 14px; margin: 0; }
            .footer { background-color: #1f2937; padding: 30px; text-align: center; }
            .footer-text { color: #9ca3af; font-size: 14px; margin: 5px 0; }
            .footer-link { color: #8b5cf6; text-decoration: none; }
            .footer-link:hover { color: #a78bfa; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <div class="greeting">Hello ${name},</div>
              <p class="message">
                We received a request to reset your password for your EtherAuthority Internship Portal account.
              </p>
              <p class="message">
                Your temporary password is:
              </p>
              <div class="password-box">
                <div class="password">${tempPassword}</div>
              </div>
              <div class="warning">
                <p class="warning-text">
                  ⚠️ <strong>Important:</strong> For security reasons, please log in with this temporary password and change it immediately from your dashboard.
                </p>
              </div>
              <p class="message">
                If you did not request this password reset, please contact our support team immediately.
              </p>
              <p class="message" style="margin-top: 40px;">
                Best regards,<br>
                <strong>The EtherAuthority Team</strong>
              </p>
            </div>
            <div class="footer">
              <p class="footer-text">EtherAuthority - Leading Blockchain Solutions</p>
              <p class="footer-text">
                <a href="https://etherauthority.io" class="footer-link">etherauthority.io</a>
              </p>
              <p class="footer-text" style="margin-top: 15px; font-size: 12px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log("Password reset email sent to:", to);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
}

export async function sendThankYouEmail(
  to: string,
  name: string,
): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.log("Email not configured, skipping thank you email to:", to);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"EtherAuthority Internships" <${process.env.SMTP_USER}>`,
      to,
      subject: "Thank You for Your Application - EtherAuthority",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px; }
            .content { padding: 40px 30px; background-color: #ffffff; }
            .greeting { color: #1f2937; font-size: 22px; font-weight: 600; margin-bottom: 20px; }
            .message { color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
            .highlight-box { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 25px 0; }
            .highlight-text { color: #1e40af; font-size: 16px; font-weight: 600; margin: 0; }
            .timeline { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0; }
            .timeline-item { display: flex; align-items: flex-start; margin-bottom: 15px; }
            .timeline-icon { color: #8b5cf6; font-size: 20px; margin-right: 12px; }
            .timeline-text { color: #4b5563; font-size: 15px; line-height: 1.5; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 25px 0; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3); }
            .cta-button:hover { box-shadow: 0 6px 8px rgba(139, 92, 246, 0.4); }
            .footer { background-color: #1f2937; padding: 30px; text-align: center; }
            .footer-text { color: #9ca3af; font-size: 14px; margin: 5px 0; }
            .footer-link { color: #8b5cf6; text-decoration: none; }
            .footer-link:hover { color: #a78bfa; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Application Received!</h1>
            </div>
            <div class="content">
              <div class="greeting">Thank You, ${name}!</div>
              <p class="message">
                We are thrilled to receive your internship application at EtherAuthority. Your interest in joining our team means a lot to us!
              </p>
              <div class="highlight-box">
                <p class="highlight-text">
                  ✓ Your application has been successfully submitted and is now under review
                </p>
              </div>
              <div class="timeline">
                <div style="color: #1f2937; font-size: 18px; font-weight: 600; margin-bottom: 15px;">What happens next?</div>
                <div class="timeline-item">
                  <span class="timeline-icon">📋</span>
                  <span class="timeline-text">Our team will carefully review your application and credentials</span>
                </div>
                <div class="timeline-item">
                  <span class="timeline-icon">📧</span>
                  <span class="timeline-text">We'll reach out within 5-7 business days with an update</span>
                </div>
                <div class="timeline-item">
                  <span class="timeline-icon">🎯</span>
                  <span class="timeline-text">If selected, we'll schedule an interview to discuss the opportunity</span>
                </div>
              </div>
              <p class="message">
                In the meantime, we encourage you to explore our innovative blockchain solutions and learn more about what we do:
              </p>
              <div style="text-align: center;">
                <a href="https://etherauthority.io" class="cta-button">Visit Our Website</a>
              </div>
              <p class="message" style="margin-top: 40px;">
                We appreciate your patience and look forward to potentially having you on our team!
              </p>
              <p class="message">
                Best regards,<br>
                <strong>The EtherAuthority Recruitment Team</strong>
              </p>
            </div>
            <div class="footer">
              <p class="footer-text">EtherAuthority - Leading Blockchain Solutions</p>
              <p class="footer-text">
                <a href="https://etherauthority.io" class="footer-link">etherauthority.io</a> | 
                <a href="mailto:contact@etherauthority.io" class="footer-link">contact@etherauthority.io</a>
              </p>
              <p class="footer-text" style="margin-top: 15px; font-size: 12px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log("Thank you email sent to:", to);
  } catch (error) {
    console.error("Failed to send thank you email:", error);
  }
}

export async function sendAdminNotification(
  internName: string,
  internEmail: string,
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!process.env.SMTP_USER || !adminEmail) {
    console.log("Email not configured, skipping admin notification");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"EtherAuthority Internships" <${process.env.SMTP_USER}>`,
      to: "bhavnan@etherauthority.io",
      subject: `🎓 New Internship Application - ${internName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px; }
            .content { padding: 40px 30px; background-color: #ffffff; }
            .section-title { color: #1f2937; font-size: 20px; font-weight: 600; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            .info-row { display: flex; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
            .info-label { color: #6b7280; font-weight: 600; width: 120px; font-size: 15px; }
            .info-value { color: #1f2937; font-size: 15px; flex: 1; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 25px 0; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3); }
            .cta-button:hover { box-shadow: 0 6px 8px rgba(139, 92, 246, 0.4); }
            .footer { background-color: #1f2937; padding: 30px; text-align: center; }
            .footer-text { color: #9ca3af; font-size: 14px; margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 New Application Alert</h1>
            </div>
            <div class="content">
              <div class="section-title">Application Details</div>
              <div class="info-row">
                <span class="info-label">Applicant:</span>
                <span class="info-value"><strong>${internName}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${internEmail}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Submitted:</span>
                <span class="info-value">${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</span>
              </div>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.APP_URL || "http://localhost:5000"}" class="cta-button">
                  View in Admin Dashboard
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
                Log in to the admin dashboard to review the complete application and take action.
              </p>
            </div>
            <div class="footer">
              <p class="footer-text">EtherAuthority Internship Portal</p>
              <p class="footer-text" style="font-size: 12px; margin-top: 10px;">
                This is an automated notification from the internship application system
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log("Admin notification sent for:", internName);
  } catch (error) {
    console.error("Failed to send admin notification:", error);
  }
}

export async function sendContactNotificationEmail(
  firstName: string,
  lastName: string,
  email: string,
  subject: string,
  message: string
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@etherauthority.io";
  const emailSubject = `New Contact Form Submission: ${subject}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${message}</p>
      <hr>
      <p>This message was sent from the EtherAuthority Contact Us page.</p>
    </div>
  `;

  await transporter.sendMail({
     from: `"EtherAuthority Internships" <${process.env.SMTP_USER}>`,
    to: 'bhavnan@etherauthority.io',
    subject: emailSubject,
    html: html,
  });
  console.log("Contact notification email sent to:", adminEmail);
}