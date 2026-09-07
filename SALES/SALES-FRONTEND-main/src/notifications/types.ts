export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string; // ISO string
  read: boolean;
  link?: {
    label?: string;
    to: string;
  };
}
