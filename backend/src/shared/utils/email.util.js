/**
 * email.util.js
 * -----------------------------------------
 * Email delivery utility via Nodemailer. If SMTP is not configured
 * (no SMTP_HOST in environment), falls back to logging the email
 * content instead of sending — this is a deliberate graceful-degradation
 * pattern (same philosophy as the AI-optional architecture) so the
 * platform remains fully runnable without a mail provider configured,
 * particularly in local development.
 */

const nodemailer = require('nodemailer');
const env = require('../../config/env.config');
const logger = require('../../config/logger.config');

const isSmtpConfigured = Boolean(process.env.SMTP_HOST);

let transporter = null;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        }
      : undefined,
  });
}

/**
 * Sends an email, or logs it if SMTP isn't configured.
 * @param {{ to: string, subject: string, html: string, text?: string }} options
 */
async function sendEmail({ to, subject, html, text }) {
  if (!isSmtpConfigured) {
    logger.warn(
      `📧 SMTP not configured — email NOT sent. Logging instead:\n` +
        `   To: ${to}\n   Subject: ${subject}\n   Body: ${text || html}`
    );
    return { delivered: false, reason: 'SMTP_NOT_CONFIGURED' };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@careerplatform.com',
      to,
      subject,
      html,
      text,
    });
    return { delivered: true };
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    // Email failure is never allowed to crash the calling flow (e.g.
    // registration must still succeed even if the verification email fails)
    return { delivered: false, reason: 'SEND_FAILED' };
  }
}

async function sendVerificationEmail(toEmail, rawToken) {
  const verifyUrl = `${env.CORS_ORIGIN}/verify-email?token=${rawToken}`;
  return sendEmail({
    to: toEmail,
    subject: 'Verify your email address',
    text: `Please verify your email by visiting: ${verifyUrl}`,
    html: `<p>Welcome! Please verify your email address by clicking the link below:</p>
           <p><a href="${verifyUrl}">${verifyUrl}</a></p>
           <p>This link expires in 24 hours.</p>`,
  });
}

async function sendPasswordResetEmail(toEmail, rawToken) {
  const resetUrl = `${env.CORS_ORIGIN}/reset-password?token=${rawToken}`;
  return sendEmail({
    to: toEmail,
    subject: 'Reset your password',
    text: `Reset your password by visiting: ${resetUrl}`,
    html: `<p>You requested a password reset. Click the link below to set a new password:</p>
           <p><a href="${resetUrl}">${resetUrl}</a></p>
           <p>This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>`,
  });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};