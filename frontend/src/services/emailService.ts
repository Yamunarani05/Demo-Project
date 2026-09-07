import {
  EmailTemplateData,
  getRegistrationSuccessTemplate,
  getStudioApprovedTemplate,
  getStudioRejectedTemplate,
} from './emailTemplates';

export interface SentEmailRecord {
  id: string;
  to: string;
  subject: string;
  type: 'registration_success' | 'approval' | 'rejection';
  html: string;
  text: string;
  sentAt: string;
  read: boolean;
  studioName: string;
  adminName: string;
}

const STORAGE_KEY = 'demo_sent_emails';

// Listeners for live real-time UI updates
type EmailStoreListener = (emails: SentEmailRecord[]) => void;
const listeners = new Set<EmailStoreListener>();

export function subscribeEmailStore(listener: EmailStoreListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(emails: SentEmailRecord[]) {
  listeners.forEach((l) => l(emails));
}

export function getSentEmails(): SentEmailRecord[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export function saveSentEmail(record: Omit<SentEmailRecord, 'id' | 'sentAt' | 'read'>): SentEmailRecord {
  const fullRecord: SentEmailRecord = {
    ...record,
    id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sentAt: new Date().toISOString(),
    read: false,
  };

  const existing = getSentEmails();
  const updated = [fullRecord, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyListeners(updated);
  return fullRecord;
}

export function markEmailAsRead(id: string) {
  const existing = getSentEmails();
  const updated = existing.map((e) => (e.id === id ? { ...e, read: true } : e));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyListeners(updated);
}

export function clearSentEmails() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  notifyListeners([]);
}

export function logRegistrationEmail(data: EmailTemplateData): { success: boolean; emailSent: boolean; message: string; emailRecord: SentEmailRecord } {
  const template = getRegistrationSuccessTemplate(data);
  const record = saveSentEmail({
    to: data.adminEmail,
    subject: template.subject,
    type: 'registration_success',
    html: template.html,
    text: template.text,
    studioName: data.studioName,
    adminName: data.adminName,
  });

  console.log(`[Email] Registration email sent successfully to ${data.adminEmail}`);
  return {
    success: true,
    emailSent: true,
    message: `Registration email sent successfully to ${data.adminEmail}`,
    emailRecord: record,
  };
}

export function logApprovalEmail(data: EmailTemplateData): { success: boolean; emailSent: boolean; message: string; emailRecord: SentEmailRecord } {
  const template = getStudioApprovedTemplate(data);
  const record = saveSentEmail({
    to: data.adminEmail,
    subject: template.subject,
    type: 'approval',
    html: template.html,
    text: template.text,
    studioName: data.studioName,
    adminName: data.adminName,
  });

  console.log(`[Email] Approval email sent successfully to ${data.adminEmail}`);
  return {
    success: true,
    emailSent: true,
    message: `Approval email sent successfully to ${data.adminEmail}`,
    emailRecord: record,
  };
}

export function logRejectionEmail(data: EmailTemplateData): { success: boolean; emailSent: boolean; message: string; emailRecord: SentEmailRecord } {
  const template = getStudioRejectedTemplate(data);
  const record = saveSentEmail({
    to: data.adminEmail,
    subject: template.subject,
    type: 'rejection',
    html: template.html,
    text: template.text,
    studioName: data.studioName,
    adminName: data.adminName,
  });

  console.log(`[Email] Rejection email sent successfully to ${data.adminEmail}`);
  return {
    success: true,
    emailSent: true,
    message: `Rejection email sent successfully to ${data.adminEmail}`,
    emailRecord: record,
  };
}
