import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { verifyClientToken } from '../util/auth';
import { preprodPool } from '../config/db';

const prisma = new PrismaClient(); // Reload Prisma Client

const appendDeliveryNote = (currentNotes: string | null | undefined, label: string, message?: string) => {
    const cleanMessage = String(message || '').trim();
    if (!cleanMessage) return currentNotes || '';
    const entry = `${label} (${new Date().toLocaleDateString()}): ${cleanMessage}`;
    return `${currentNotes || ''}${currentNotes ? '\n\n' : ''}${entry}`;
};

export const getClientDeliveries = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const payload = verifyClientToken(token);
        const leadId = payload.id;

        if (!leadId) {
            console.log("Unauthorized: no leadId");
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const leadDetail = await prisma.leadsDetail.findUnique({
            where: { leadId: Number(leadId) },
            select: { leadSerialNumber: true }
        });

        let numericLeadIdStr: string | null = null;
        if (leadDetail?.leadSerialNumber) {
            const match = String(leadDetail.leadSerialNumber).match(/\d+$/);
            if (match) numericLeadIdStr = Number(match[0]).toString();
        }

        console.log("Fetching deliveries for leadId:", leadId);
        const deliveries = await prisma.clientDelivery.findMany({
            where: { leadId: Number(leadId) },
            orderBy: { createdAt: 'desc' }
        });

        let preprodDeliveries: any[] = [];
        try {
            console.log("DEBUG: Fetching from preprod DB with leadId:", leadId);
            const qBase = `SELECT * FROM client_deliveries WHERE (lead_id::text = $1 OR lead_id::text = $2 OR (lead_id::text = $3 AND $3 IS NOT NULL)) ORDER BY created_at DESC`;
            const { rows } = await preprodPool.query(qBase, [String(leadId), String(leadDetail?.leadSerialNumber), numericLeadIdStr]);
            
            console.log("DEBUG: Preprod DB returned rows count:", rows.length);
            
            preprodDeliveries = rows.map(row => {
                console.log("DEBUG: Mapping row ID:", row.id, "Delivery Type:", row.delivery_type, "Has approved_links?", !!row.approved_links);
                return {
                    id: row.id,
                    leadId: Number(leadId),
                    deliveryType: row.delivery_type,
                    driveLink: row.drive_link,
                    videoDriveLink: row.video_drive_link,
                    dronePhotoLink: row.drone_photo_drive_link,
                    droneVideoLink: row.drone_video_drive_link,
                    status: row.status,
                    notes: row.notes,
                    queryCount: row.query_count || 0,
                    createdAt: row.created_at,
                    updatedAt: row.created_at,
                    magazineDriveLink: row.magazine_drive_link,
                    frameDriveLink: row.frame_drive_link,
                    approvedLinks: row.approved_links, 
                    isFromPreprod: true
                };
            });
        } catch (err) {
            console.error("DEBUG: Failed to fetch deliveries from preprod DB", err);
        }

        // Combine and sort by createdAt desc
        const allDeliveries = [...deliveries, ...preprodDeliveries].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        console.log("Found total deliveries:", allDeliveries.length);

        res.status(200).json({ success: true, data: allDeliveries });
    } catch (error: any) {
        console.error('GET CLIENT DELIVERIES ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const approveClientDelivery = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const payload = verifyClientToken(token);
        const leadId = payload.id;
        const { deliveryId } = req.params;
        const comment = String(req.body?.comment || '').trim();

        if (!leadId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        let delivery: any = await prisma.clientDelivery.findFirst({
            where: { id: Number(deliveryId), leadId: Number(leadId) }
        });

        const lead = await prisma.leadsDetail.findUnique({ where: { leadId: Number(leadId) } });
        const serialNumber = lead?.leadSerialNumber || leadId;

        let isFromPreprod = false;
        if (!delivery) {
            try {
                const qBase = `SELECT * FROM client_deliveries WHERE id = $1 AND (lead_id::text = $2 OR lead_id::text = $3)`;
                const { rows } = await preprodPool.query(qBase, [Number(deliveryId), String(leadId), String(serialNumber)]);
                if (rows.length > 0) {
                    delivery = {
                        id: rows[0].id,
                        deliveryType: rows[0].delivery_type,
                        notes: rows[0].notes
                    };
                    isFromPreprod = true;
                }
            } catch (err) {
                console.error("Failed to fetch from preprod DB in approve", err);
            }
        }

        if (!delivery) {
            return res.status(404).json({ success: false, message: 'Delivery not found' });
        }

        // Ask the CRM workflow to release the next stage before committing the local approval.
        try {
            const PREPRODUCTION_API_URL = process.env.PREPRODUCTION_API_URL || 'http://localhost:5001/api';
            await axios.patch(`${PREPRODUCTION_API_URL}/crm/client-deliveries/${serialNumber}/client-approve`, {
                deliveryType: delivery.deliveryType,
                leadId: serialNumber,
                comment: comment || undefined,
            });
        } catch (e: any) {
            const crmMessage = e.response?.data?.message || e.message;
            console.error('Failed to notify CRM backend of approval:', crmMessage, e.response?.data);
            return res.status(502).json({
                success: false,
                message: crmMessage || 'CRM workflow did not accept the approval. Please try again.',
            });
        }

        const newNotes = appendDeliveryNote(delivery.notes, 'Client Approval', comment);

        let updated;
        if (isFromPreprod) {
            const upQ = `UPDATE client_deliveries SET status = 'client_approved', notes = $1 WHERE id = $2 RETURNING *`;
            const { rows } = await preprodPool.query(upQ, [newNotes, delivery.id]);
            updated = rows[0];
        } else {
            updated = await prisma.clientDelivery.update({
                where: { id: Number(deliveryId) },
                data: {
                    status: 'client_approved',
                    notes: newNotes,
                }
            });
        }

        res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
        console.error('APPROVE CLIENT DELIVERY ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const raiseClientQuery = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const payload = verifyClientToken(token);
        const leadId = payload.id;
        const { deliveryId } = req.params;
        const { queryMessage, deliverableType } = req.body;
        const cleanQueryMessage = String(queryMessage || '').trim();
        const cleanDeliverableType = String(deliverableType || '').trim();

        if (!leadId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        let delivery: any = await prisma.clientDelivery.findFirst({
            where: { id: Number(deliveryId), leadId: Number(leadId) }
        });

        const lead = await prisma.leadsDetail.findUnique({ where: { leadId: Number(leadId) } });
        const serialNumber = lead?.leadSerialNumber || leadId;

        let isFromPreprod = false;
        if (!delivery) {
            try {
                const qBase = `SELECT * FROM client_deliveries WHERE id = $1 AND (lead_id::text = $2 OR lead_id::text = $3)`;
                const { rows } = await preprodPool.query(qBase, [Number(deliveryId), String(leadId), String(serialNumber)]);
                if (rows.length > 0) {
                    delivery = {
                        id: rows[0].id,
                        deliveryType: rows[0].delivery_type,
                        notes: rows[0].notes,
                        queryCount: rows[0].query_count || 0
                    };
                    isFromPreprod = true;
                }
            } catch (err) {
                console.error("Failed to fetch from preprod DB in query", err);
            }
        }

        if (!delivery) {
            return res.status(404).json({ success: false, message: 'Delivery not found' });
        }

        if (!cleanQueryMessage) {
            return res.status(400).json({ success: false, message: 'Query message is required.' });
        }

        if (delivery.queryCount >= 2) {
            return res.status(400).json({ success: false, message: 'Query limit exceeded. You can only raise a query 2 times.' });
        }

        const newNotes = appendDeliveryNote(delivery.notes, 'Client Query', cleanQueryMessage);
        
        let updated;
        if (isFromPreprod) {
            const upQ = `UPDATE client_deliveries SET status = 'query_raised', notes = $1, query_count = query_count + 1 WHERE id = $2 RETURNING *`;
            const { rows } = await preprodPool.query(upQ, [newNotes, delivery.id]);
            updated = rows[0];
        } else {
            updated = await prisma.clientDelivery.update({
                where: { id: Number(deliveryId) },
                data: { 
                    status: 'query_raised',
                    notes: newNotes,
                    queryCount: { increment: 1 }
                }
            });
        }

        let crmNotificationSent = false;

        // Notify CRM backend about the query
        try {
            const PREPRODUCTION_API_URL = process.env.PREPRODUCTION_API_URL || 'http://localhost:5001/api';
            await axios.post(`${PREPRODUCTION_API_URL}/data-manager/${serialNumber}/client-query`, {
                queryMessage: cleanQueryMessage,
                deliveryId: delivery.id,
                deliveryType: delivery.deliveryType,
                deliverableType: cleanDeliverableType || undefined,
                leadId: serialNumber,
            });
            crmNotificationSent = true;
        } catch (e: any) {
            console.error('Failed to notify CRM backend of query:', e.response?.data || e.message);
        }

        res.status(200).json({ success: true, data: updated, crmNotificationSent });
    } catch (error: any) {
        console.error('RAISE CLIENT QUERY ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
