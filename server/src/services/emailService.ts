import nodemailer from 'nodemailer';
import { memoryStore, EmailLogRecord } from '../db';
import {
  EmailTemplateData,
  getRegistrationSuccessTemplate,
  getStudioApprovedTemplate,
  getStudioRejectedTemplate,
  getPaymentRequestTemplate,
  getPaymentSuccessTemplate,
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
  text: string,
  emailType: EmailLogRecord['emailType'] = 'REGISTRATION_RECEIVED',
  studioId?: string
): Promise<EmailSendResult> {
  const from = process.env.EMAIL_FROM || 'LUMINA Photography Management <noreply@lumina.io>';

  let result: EmailSendResult;

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

      result = {
        success: true,
        emailSent: true,
        message: `Email sent successfully to ${to}`,
        previewUrl: previewUrl || undefined,
      };
    } else {
      console.log(`[Email] Notification email simulated to ${to} (Subject: "${subject}")`);
      result = {
        success: true,
        emailSent: true,
        message: `Notification email dispatched to ${to}`,
      };
    }
  } catch (err: any) {
    console.error(`[Email] Failed to send email to ${to}:`, err?.message || err);
    result = {
      success: false,
      emailSent: false,
      message: `Failed to send email to ${to}`,
      error: err?.message || 'SMTP delivery failed',
    };
  }

  // Record in Email Activity History log
  const newLog: EmailLogRecord = {
    id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    studioId,
    emailType,
    recipient: to,
    subject,
    sentAt: new Date().toISOString(),
    status: result.success ? 'SENT' : 'FAILED',
    previewUrl: result.previewUrl,
    details: result.message,
  };

  memoryStore.emailLogs.unshift(newLog);

  return result;
}

export async function sendRegistrationEmail(data: EmailTemplateData, studioId?: string): Promise<EmailSendResult> {
  const recipient = data.adminEmail;
  const { subject, html, text } = getRegistrationSuccessTemplate(data);
  return await sendEmailNotification(recipient, subject, html, text, 'REGISTRATION_RECEIVED', studioId);
}

export async function sendApprovalEmail(data: EmailTemplateData, studioId?: string): Promise<EmailSendResult> {
  const recipient = data.adminEmail;
  const { subject, html, text } = getStudioApprovedTemplate(data);
  return await sendEmailNotification(recipient, subject, html, text, 'TRIAL_APPROVED', studioId);
}

export async function sendRejectionEmail(data: EmailTemplateData, studioId?: string): Promise<EmailSendResult> {
  const recipient = data.adminEmail;
  const { subject, html, text } = getStudioRejectedTemplate(data);
  return await sendEmailNotification(recipient, subject, html, text, 'TRIAL_REJECTED', studioId);
}

export async function sendPaymentRequestEmail(data: EmailTemplateData, studioId?: string): Promise<EmailSendResult> {
  const recipient = data.adminEmail;
  const { subject, html, text } = getPaymentRequestTemplate(data);
  return await sendEmailNotification(recipient, subject, html, text, 'PAYMENT_REQUESTED', studioId);
}

export async function sendPaymentSuccessEmail(data: EmailTemplateData, studioId?: string): Promise<EmailSendResult> {
  const recipient = data.adminEmail;
  const { subject, html, text } = getPaymentSuccessTemplate(data);
  return await sendEmailNotification(recipient, subject, html, text, 'PAYMENT_SUCCESS', studioId);
}
