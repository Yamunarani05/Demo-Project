export type WorkflowMediaStatus =
    | 'Pending'
    | 'Pending_Verification'
    | 'Verified'
    | 'QC_Pending_Pixoffice'
    | 'crm_verified'
    | 'Reupload_Requested'
    | 'harddisk_closed'
    | string

export const getWorkflowStatusMeta = (status?: string) => {
    const normalized = String(status || 'Pending').trim()

    switch (normalized) {
        case 'Pending':
            return { label: 'New Upload', badgeClass: 'bg-blue-100 text-blue-600', stage: 'incoming' as const }
        case 'Pending_Verification':
            return { label: 'Awaiting QC', badgeClass: 'bg-orange-100 text-orange-500', stage: 'verification' as const }
        case 'Verified':
            return { label: 'QC Approved', badgeClass: 'bg-green-100 text-green-600', stage: 'pixoffice' as const }
        case 'QC_Pending_Pixoffice':
            return { label: 'Submitted to CRM', badgeClass: 'bg-emerald-100 text-emerald-700', stage: 'pixoffice' as const }
        case 'crm_verified':
            return { label: 'QC Completed', badgeClass: 'bg-blue-100 text-blue-600', stage: 'complete' as const }
        case 'Reupload_Requested':
            return { label: 'Re-upload Requested', badgeClass: 'bg-red-100 text-red-500', stage: 'incoming' as const }
        case 'harddisk_closed':
            return { label: 'Hard Disk Closed', badgeClass: 'bg-gray-100 text-gray-600', stage: 'complete' as const }
        default:
            return { label: normalized.replace(/_/g, ' '), badgeClass: 'bg-gray-100 text-gray-600', stage: 'incoming' as const }
    }
}

export const isVerificationPending = (status?: string) =>
    String(status || '').trim() === 'Pending_Verification'

export const isVerificationCompleted = (status?: string) =>
    ['Verified', 'QC_Pending_Pixoffice', 'crm_verified'].includes(String(status || '').trim())

export const isPixofficeReady = (status?: string) =>
    String(status || '').trim() === 'Verified'

export const isPixofficeSubmitted = (status?: string) =>
    ['QC_Pending_Pixoffice', 'crm_verified'].includes(String(status || '').trim())
