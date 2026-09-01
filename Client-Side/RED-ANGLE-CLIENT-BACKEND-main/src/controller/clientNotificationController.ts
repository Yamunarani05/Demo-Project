import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getClientNotifications = async (req: Request, res: Response) => {
    try {
        // Authenticated client payload
        const payload = (req as any).user;
        if (!payload || !payload.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const leadId = Number(payload.id);

        const lead = await prisma.leadsDetail.findUnique({
            where: { leadId },
            include: {
                events: true,
                leadEmployee: true,
                invoices: true,
                quotationLeads: true,
                clientDeliveries: true,
            }
        });

        if (!lead) {
            return res.json({ success: true, data: [] });
        }

        const notifications: any[] = [];
        let idCounter = 1;

        // 1. Welcome Notification
        notifications.push({
            id: leadId * 1000 + idCounter++,
            type: 'client',
            title: 'Welcome to Red Angle Studio!',
            detail: 'Your project has been successfully registered. You can track your progress here.',
            created_at: lead.createdTime ? lead.createdTime.toISOString() : new Date().toISOString(),
            is_read: false
        });

        // 2. Quotation
        if (lead.quotationLeads && lead.quotationLeads.length > 0) {
            lead.quotationLeads.forEach((quote: any) => {
                notifications.push({
                    id: leadId * 1002 + quote.id,
                    type: 'assignment',
                    title: 'New Quotation Available',
                    detail: `A quotation has been prepared for your event.`,
                    created_at: quote.createdAt ? quote.createdAt.toISOString() : new Date().toISOString(),
                    is_read: false
                });
            });
        }

        // 3. Stage changes
        if (lead.currentStage?.toLowerCase() === 'finalised' || lead.currentStage?.toLowerCase() === 'finalized') {
            notifications.push({
                id: leadId * 1005 + idCounter++,
                type: 'assignment_accepted',
                title: 'Project Finalised',
                detail: 'Production has officially started for your project!',
                created_at: (lead as any).updatedTime ? (lead as any).updatedTime.toISOString() : ((lead as any).createdTime ? (lead as any).createdTime.toISOString() : new Date().toISOString()),
                is_read: false
            });
        }

        // 4. Invoices
        if (lead.invoices && lead.invoices.length > 0) {
            lead.invoices.forEach((inv: any) => {
                // Skip if the invoice hasn't been sent yet
                if (inv.status?.toLowerCase() === 'pending' || inv.status?.toLowerCase() === 'draft') return;

                const totalText = inv.totalAmount && inv.totalAmount > 0 
                    ? ` for ₹${inv.totalAmount.toLocaleString('en-IN')}` 
                    : '';
                    
                notifications.push({
                    id: leadId * 10000 + inv.invoiceId,
                    type: 'delivery',
                    title: `Invoice Generated`,
                    detail: `An invoice${totalText} has been generated.`,
                    created_at: inv.invoiceDate ? inv.invoiceDate.toISOString() : (inv.createdAt ? new Date(inv.createdAt).toISOString() : new Date().toISOString()),
                    is_read: false
                });

                if (inv.paymentStatus === 'paid' || inv.status?.toLowerCase() === 'paid') {
                    notifications.push({
                        id: leadId * 20000 + inv.invoiceId,
                        type: 'assignment_accepted',
                        title: `Payment Received`,
                        detail: `We have received payment for your Invoice. Thank you!`,
                        created_at: inv.createdAt ? new Date(inv.createdAt).toISOString() : new Date().toISOString(),
                        is_read: false
                    });
                }
            });
        }

        // 5. Events Completed
        if (lead.events && lead.events.length > 0) {
            lead.events.forEach((e: any) => {
                if (e.status === 'completed' || e.status === 'approved') {
                    notifications.push({
                        id: leadId * 30000 + e.eventId,
                        type: 'shoot',
                        title: `Event Completed: ${e.eventName}`,
                        detail: `The shoot for ${e.eventName} has been successfully completed.`,
                        created_at: e.updatedAt ? new Date(e.updatedAt).toISOString() : (e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString()),
                        is_read: false
                    });
                }
            });
        }

        // 6. Preproduction Deliveries
        if (lead.clientDeliveries && lead.clientDeliveries.length > 0) {
            lead.clientDeliveries.forEach((d: any) => {
                let title = 'Delivery Available';
                let detail = 'New files have been delivered for your project. Please review them.';
                
                if (d.deliveryType === 'RAW_DATA') {
                    title = 'Raw Data Available';
                    detail = 'Raw data is ready for your selection. Please verify.';
                } else if (d.deliveryType === 'ALBUM') {
                    title = 'Album Design Available';
                    detail = 'Your album design is ready for review.';
                } else if (d.deliveryType === 'FINAL_VIDEO') {
                    title = 'Final Video Available';
                    detail = 'Your final video has been uploaded for review.';
                } else if (d.deliveryType === 'FINAL_PHOTOS' || d.deliveryType === 'RETOUCH') {
                    title = 'Final Photos Available';
                    detail = 'Your processed photos are ready for review.';
                }

                notifications.push({
                    id: leadId * 40000 + d.id,
                    type: 'delivery',
                    title: title,
                    detail: detail,
                    created_at: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
                    is_read: false
                });
            });
        }

        // 7. Complaints removed temporarily because table does not exist

        // Sort descending by created_at (simulate newer first)
        notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error fetching client notifications:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
