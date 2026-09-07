export type StudioStatus = 'pending' | 'approved' | 'active' | 'inactive' | 'suspended';

export type TrialStatus = 'PENDING' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'CONVERTED';

export type PaymentStatus = 'PENDING' | 'PAYMENT_PENDING' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'REFUNDED';

export interface Studio {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  status: StudioStatus;
  plan: 'trial' | 'pro' | 'enterprise';
  amount?: number;
  registrationDate?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  trialStatus?: TrialStatus;
  trialDaysRemaining?: number;
  paymentStatus?: PaymentStatus;
  created_at: string;
}
