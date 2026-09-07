import { calculateStudioTrialAndPaymentStatus, StudioRecord } from '../../models/db';

export function getStudioTrialAndPaymentStatus(studio: StudioRecord) {
  return calculateStudioTrialAndPaymentStatus(studio);
}

export { calculateStudioTrialAndPaymentStatus };
