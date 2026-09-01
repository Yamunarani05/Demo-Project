import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyClientToken } from '../util/auth';
import { preprodPool } from '../config/db';

const prisma = new PrismaClient();

export const submitClientEventApproval = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const payload = verifyClientToken(token);
        const leadId = payload.id;

        if (!leadId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { traditional, candid, retouch, album } = req.body;

        const lead = await prisma.leadsDetail.findUnique({
            where: { leadId: Number(leadId) },
            select: { leadSerialNumber: true }
        });

        if (!lead || !lead.leadSerialNumber) {
            return res.status(404).json({ success: false, message: 'Lead not found or missing serial number' });
        }

        const clientReqData = JSON.stringify({
            traditional: traditional || { ref: '', sel: '' },
            candid: candid || { ref: '', sel: '' },
            retouch: retouch || { ref: '', sel: '' },
            album: album || { ref: '', sel: '' },
            submittedAt: new Date().toISOString()
        });

        // Update event_details with the client requirements
        await preprodPool.query(
            `UPDATE event_details SET client_requirements = $1 WHERE external_lead_id = $2`,
            [clientReqData, lead.leadSerialNumber]
        );

        // Update external_leads to push the lead to post-production
        await preprodPool.query(
            `UPDATE external_leads 
             SET current_phase = 'post_production', phase_status = 'not_started', phase_owner = 'post-production-crm' 
             WHERE lead_serial_number = $1`,
            [lead.leadSerialNumber]
        );

        res.status(200).json({ success: true, message: 'Approval submitted successfully and lead moved to post-production.' });
    } catch (error: any) {
        const errorMessage = error?.message || String(error);
        console.error('SUBMIT CLIENT EVENT APPROVAL ERROR:', error);
        res.status(500).json({ success: false, message: errorMessage || 'An error occurred during submission' });
    }
};
