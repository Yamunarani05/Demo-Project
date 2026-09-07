export type UserRole = 'great_master' | 'master_admin' | 'studio_admin' | 'sales' | 'pre_production' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studioId?: string;
  phone?: string;
  avatar?: string;
}
