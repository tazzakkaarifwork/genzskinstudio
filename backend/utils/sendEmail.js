import nodemailer from 'nodemailer';
import crypto from 'crypto';

let cachedTransporter = null;

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    console.log('No SMTP email credentials in .env. Creating Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    cachedTransporter.isEthereal = true;
  }

  return cachedTransporter;
};

export const sendEmail = async ({ to, subject, html, text, isMarketing = false }) => {
  try {
    const fromName = process.env.EMAIL_FROM_NAME || 'GenZ Skin Studio';
    const domain = 'genzskinstudio.com';
    const uniqueId = crypto.randomBytes(12).toString('hex');

    const transporter = await getTransporter();
    const isEthereal = transporter.isEthereal;

    // Dynamically align Message-ID domain with authenticated sender address domain to prevent spam filters
    let emailDomain = domain;
    if (!isEthereal && process.env.EMAIL_USER && process.env.EMAIL_USER.includes('@')) {
      emailDomain = process.env.EMAIL_USER.split('@')[1];
    }

    const mailOptions = {
      from: isEthereal 
        ? `"${fromName}" <newsletter@${domain}>`
        : `"${fromName}" <${process.env.EMAIL_USER}>`,
      replyTo: isEthereal
        ? `"${fromName}" <newsletter@${domain}>`
        : `"${fromName}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      headers: {
        'X-Mailer': 'GenZSkinStudio/1.0',
        'X-Priority': '3',
        'Message-ID': `<${uniqueId}@${emailDomain}>`,
        ...(isMarketing && !isEthereal ? {
          'Precedence': 'bulk',
          'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`,
        } : {}),
      },
    };

    const info = await transporter.sendMail(mailOptions);

    if (isEthereal) {
      const testUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[TEST EMAIL SENT] To: ${to}`);
      console.log(`[TEST EMAIL PREVIEW URL] ${testUrl}`);
      return { ...info, previewUrl: testUrl };
    } else {
      console.log(`[EMAIL SENT] Message ID: ${info.messageId} to ${to}`);
      return info;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    // Return mock sent status to prevent backend from crashing on local dev email errors
    return { error: error.message, mockSent: true };
  }
};

