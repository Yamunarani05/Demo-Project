import nodemailer from 'nodemailer';
import { ENV } from '../config/env';
import { 
  createEmailTemplate,
  createApprovalEmailContent,
  createRejectionEmailContent,
  createPasswordResetEmailContent,
  createWelcomeEmailContent,
  createPaymentConfirmationEmailContent,
  createClientSetupEmailContent
} from './emailTemplates';

// Email configuration interface
interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  isHTML?: boolean;
  attachments?: {
  filename: string;
  content: Buffer;
  contentType?: string;
}[];

}


// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: ENV.EMAIL_HOST,
    port: ENV.EMAIL_PORT,
    secure: ENV.EMAIL_SECURE,
    auth: {
      user: ENV.EMAIL_USER,
      pass: ENV.EMAIL_PASS,
    },
  });
};

// Main email sending function
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // Validate email configuration
    if (!ENV.EMAIL_USER || !ENV.EMAIL_PASS) {
      const errorMsg = 'Email configuration missing: EMAIL_USER and EMAIL_PASS must be set';
      console.error('❌ [EMAIL ERROR]', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('📧 [EMAIL] Attempting to send email to:', options.to);
    console.log('📧 [EMAIL] Email host:', ENV.EMAIL_HOST, 'Port:', ENV.EMAIL_PORT);

    const transporter = createTransporter();

    // Create email content
    const htmlContent = options.isHTML !== false 
      ? options.body 
      : undefined;

    const mailOptions = {
      from: `"${ENV.COMPANY_NAME}" <${ENV.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.isHTML !== false ? undefined : options.body,
      html: htmlContent,
      attachments: options.attachments || [],
    };

    // Send email
    console.log('📧 [EMAIL] Sending mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ [EMAIL] Email sent successfully:', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
    });

    return true;
  } catch (error: any) {
    console.error('❌ [EMAIL ERROR] Failed to send email:', error?.message || error);
    throw error; // ✅ Re-throw so caller knows about the error
  }
};

// Re-export email template functions for convenience
export {
  createApprovalEmailContent,
  createRejectionEmailContent,
  createPasswordResetEmailContent,
  createWelcomeEmailContent,
  createPaymentConfirmationEmailContent,
  createClientSetupEmailContent,
  createEmailTemplate
};