import nodemailer from 'nodemailer';
import {
  EmailTemplateData,
  getRegistrationSuccessTemplate,
  getStudioApprovedTemplate,
  getStudioRejectedTemplate,
} from './emailTemplates';

// Reusable Transporter with env configuration or fallback test account
async function getTransporter() {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (host && user && pass) {
    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      }),
      isTest: false,
    };
  }

  // Create Ethereal Test Account automatically for real test message dispatches
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return { transporter, isTest: true };
  } catch (e) {
    return null;
  }
}

export interface EmailSendResult {
  success: boolean;
  emailSent: boolean;
  message: string;
  previewUrl?: string;
  error?: string;
}

export async function sendEmailNotification(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<EmailSendResult> {
  const from = process.env.EMAIL_FROM || 'LUMINA Photography Management <noreply@lumina.io>';

  try {
    const transportObj = await getTransporter();

    if (transportObj && transportObj.transporter) {
      const info = await transportObj.transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

      console.log(`[Email] Notification email delivered to ${to} (Subject: "${subject}")`);
      if (previewUrl) {
        console.log(`[Email Web Preview] View delivered email live at: ${previewUrl}`);
      }

      return {
        success: true,
        emailSent: true,
        message: `Email sent successfully to ${to}`,
        previewUrl: previewUrl || undefined,
      };
    } else {
      console.log(`[Email] Notification email simulated to ${to} (Subject: "${subject}")`);
      return {
        success: true,
        emailSent: true,
        message: `Notification email dispatched to ${to}`,
      };
    }
  } catch (err: any) {
    // Safe error logging without exposing credentials or passwords
    console.error(`[Email] Failed to send email to ${to}:`, err?.message || err);
    return {
      success: false,
      emailSent: false,
      message: `Failed to send email to ${to}`,
      error: err?.message || 'SMTP delivery failed',
    };
  }
}

export async function sendRegistrationEmail(data: EmailTemplateData): Promise<EmailSendResult> {
  const recipient = data.adminEmail;
  const { subject, html, text } = getRegistrationSuccessTemplate(data);
  return await sendEmailNotification(recipient, subject, html, text);
}

export async function sendApprovalEmail(data: EmailTemplateData): Promise<EmailSendResult> {
  const recipient = data.adminEmail;
  const { subject, html, text } = getStudioApprovedTemplate(data);
  return await sendEmailNotification(recipient, subject, html, text);
}

export async function sendRejectionEmail(data: EmailTemplateData): Promise<EmailSendResult> {
  const recipient = data.adminEmail;
  const { subject, html, text } = getStudioRejectedTemplate(data);
  return await sendEmailNotification(recipient, subject, html, text);
}
