import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { verifyClientToken } from '../util/auth';

const prisma = new PrismaClient();

export const submitPreproductionRequirements = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const payload = verifyClientToken(token);
        const leadId = payload.id;

        if (!leadId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { projectType, referenceLink, imageNumbers } = req.body;

        if (!projectType) {
            return res.status(400).json({ success: false, message: 'Missing projectType' });
        }

        const leadDetail = await prisma.leadsDetail.findUnique({
            where: { leadId: Number(leadId) }
        });

        const CRM_API_URL = process.env.CRM_API_URL || process.env.PREPRODUCTION_API_URL || 'http://localhost:5001/api';
        
        // Find serial number to use in CRM backend
        const serialNumber = leadDetail?.leadSerialNumber || `LD-${leadId}`;

        // Forward to Preproduction CRM Backend
        try {
            await axios.patch(`${CRM_API_URL}/assigned-projects/${serialNumber}/client-requirements`, {
                projectType,
                referenceLink,
                imageNumbers
            });
        } catch (e: any) {
            console.error('Failed to notify CRM backend', e.message, e.response?.data);
            // We do NOT return a 500 error here. If the CRM backend fails or is unreachable, 
            // we still want to save the requirements to the local Client Database below.
        }

        try {
            let dType = 'RAW_DATA';
            if (projectType === 'Event Deliverables') dType = 'EVENT_RAW_DATA';

            const delivery = await prisma.clientDelivery.findFirst({
                where: { 
                    leadId: Number(leadId), 
                    deliveryType: dType 
                },
                orderBy: { createdAt: 'desc' }
            });

            if (delivery) {
                let reqs: any = delivery.clientRequirements || {};
                if (typeof reqs === 'string') {
                    try { reqs = JSON.parse(reqs); } catch(e){}
                }
                
                reqs[projectType] = { referenceLink, imageNumbers };
                
                await prisma.clientDelivery.update({
                    where: { id: delivery.id },
                    data: { clientRequirements: reqs }
                });
            }
        } catch (e: any) {
            console.error('Failed to save client requirements locally', e.message);
        }

        res.status(200).json({ success: true, message: 'Requirements submitted successfully' });
    } catch (error: any) {
        console.error('SUBMIT PREPRODUCTION REQUIREMENTS ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const approveRawDataController = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const payload = verifyClientToken(token);
        const leadId = payload.id;

        if (!leadId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { projectType } = req.body;

        const leadDetail = await prisma.leadsDetail.findUnique({
            where: { leadId: Number(leadId) }
        });

        const name = leadDetail ? `${leadDetail.firstName || ''} ${leadDetail.lastName || ''}`.trim() : '';

        const SALES_API_URL = process.env.SALES_API_URL || 'http://localhost:5000/api';
        const CRM_API_URL = process.env.CRM_API_URL || process.env.PREPRODUCTION_API_URL || 'http://localhost:5001/api';
        
        try {
            let dType = 'RAW_DATA';
            if (projectType === 'Event Deliverables') dType = 'EVENT_RAW_DATA';

            let delivery = await prisma.clientDelivery.findFirst({
                where: { 
                    leadId: Number(leadId), 
                    deliveryType: dType
                },
                orderBy: { createdAt: 'desc' }
            });

            if (!delivery && dType === 'EVENT_RAW_DATA') {
                delivery = await prisma.clientDelivery.findFirst({
                    where: { 
                        leadId: Number(leadId), 
                        deliveryType: 'RAW_DATA'
                    },
                    orderBy: { createdAt: 'desc' }
                });
            }

            let deliveryInPreprod = false;
            if (!delivery) {
                try {
                    const { preprodPool } = require('../config/db');
                    const { rows } = await preprodPool.query(`SELECT id, notes FROM client_deliveries WHERE lead_id::text = $1 AND delivery_type = $2 ORDER BY created_at DESC LIMIT 1`, [String(leadId), dType]);
                    if (rows.length > 0) {
                        delivery = rows[0] as any;
                        deliveryInPreprod = true;
                    } else if (dType === 'EVENT_RAW_DATA') {
                        const { rows: fallbackRows } = await preprodPool.query(`SELECT id, notes FROM client_deliveries WHERE lead_id::text = $1 AND delivery_type = 'RAW_DATA' ORDER BY created_at DESC LIMIT 1`, [String(leadId)]);
                        if (fallbackRows.length > 0) {
                            delivery = fallbackRows[0] as any;
                            deliveryInPreprod = true;
                        }
                    }
                } catch (err) {
                    console.error("Fallback to preprod DB for client_deliveries approval failed:", err);
                }
            }

            if (delivery) {
                let notes = delivery.notes || '';
                const flag = `[${projectType}_Approved]`;
                
                if (!notes.includes(flag)) {
                    notes = notes ? `${notes} ${flag}` : flag;
                    if (deliveryInPreprod) {
                        const { preprodPool } = require('../config/db');
                        await preprodPool.query(`UPDATE client_deliveries SET notes = $1 WHERE id = $2`, [notes, delivery.id]);
                    } else {
                        await prisma.clientDelivery.update({
                            where: { id: delivery.id },
                            data: { notes }
                        });
                    }
                }

                // Check if all 3 are approved (Preproduction) or if it's Event Deliverables
                const hasSaveTheDate = notes.includes('[Save the Date_Approved]');
                const hasSaveTheVideo = notes.includes('[Save the Video_Approved]');
                const hasRetouch = notes.includes('[Retouch_Approved]');
                const hasEventDeliverables = notes.includes('[Event Deliverables_Approved]');

                if (hasSaveTheDate || hasSaveTheVideo || hasRetouch || hasEventDeliverables) {
                    const serialNumber = leadDetail?.leadSerialNumber || `LD-${leadId}`;
                    const dType = hasEventDeliverables ? 'EVENT_RAW_DATA' : 'RAW_DATA';
                    await axios.patch(`${CRM_API_URL}/crm/client-deliveries/${serialNumber}/client-approve`, {
                        deliveryType: dType
                    });

                    try {
                        await axios.post(`${SALES_API_URL}/notifications/raw-data-approved`, {
                            leadId: leadId,
                            leadName: name,
                            deliveryType: dType
                        });
                    } catch (e: any) {
                        console.error('Failed to trigger notification on Sales Backend', e.message);
                    }
                }
            }
        } catch (e: any) {
            console.error('Failed to update delivery status on CRM Backend', e.message);
        }

        res.status(200).json({ success: true, message: 'Raw data approved successfully' });
    } catch (error: any) {
        console.error('APPROVE RAW DATA ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRawDataLinksController = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const payload = verifyClientToken(token);
        const leadId = payload.id;

        if (!leadId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const type = req.query.type as string; // 'Save the Date', 'Save the Video', 'Retouch'

        const leadDetail = await prisma.leadsDetail.findUnique({
            where: { leadId: Number(leadId) },
            select: { leadSerialNumber: true }
        });

        if (!leadDetail?.leadSerialNumber) {
            return res.status(200).json({ success: true, data: { driveLink: null, videoDriveLink: null } });
        }

        let numericLeadIdStr: string | null = null;
        if (leadDetail?.leadSerialNumber) {
            const match = String(leadDetail.leadSerialNumber).match(/\d+$/);
            if (match) numericLeadIdStr = Number(match[0]).toString();
        }

        let rawData = await prisma.clientDelivery.findFirst({
            where: { 
                leadId: Number(leadId), 
                deliveryType: { in: ['RAW_DATA', 'EVENT_RAW_DATA'] } 
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!rawData) {
            try {
                const { preprodPool } = require('../config/db');
                const qBase = `SELECT * FROM client_deliveries WHERE (lead_id::text = $1 OR lead_id::text = $2 OR (lead_id::text = $3 AND $3 IS NOT NULL))`;
                const { rows } = await preprodPool.query(`${qBase} AND delivery_type IN ('RAW_DATA', 'EVENT_RAW_DATA') ORDER BY created_at DESC LIMIT 1`, [String(leadId), String(leadDetail?.leadSerialNumber), numericLeadIdStr]);
                if (rows.length > 0) {
                    rawData = {
                        driveLink: rows[0].drive_link,
                        videoDriveLink: rows[0].video_drive_link,
                        notes: rows[0].notes,
                        status: rows[0].status
                    } as any;
                }
            } catch (err) {
                console.error("Fallback to preprod DB for raw data client_deliveries failed:", err);
            }
        }

        let finalDelivery = await prisma.clientDelivery.findFirst({
            where: { leadId: Number(leadId), deliveryType: 'FINAL_DELIVERABLES' },
            orderBy: { createdAt: 'desc' }
        });

        if (!finalDelivery) {
            try {
                const { preprodPool } = require('../config/db');
                const qBase = `SELECT * FROM client_deliveries WHERE (lead_id::text = $1 OR lead_id::text = $2 OR (lead_id::text = $3 AND $3 IS NOT NULL))`;
                const { rows } = await preprodPool.query(`${qBase} AND delivery_type = 'FINAL_DELIVERABLES' ORDER BY created_at DESC LIMIT 1`, [String(leadId), String(leadDetail?.leadSerialNumber), numericLeadIdStr]);
                if (rows.length > 0) {
                    finalDelivery = {
                        driveLink: rows[0].drive_link,
                        videoDriveLink: rows[0].video_drive_link,
                        notes: rows[0].notes,
                        status: rows[0].status
                    } as any;
                }
            } catch (err) {
                console.error("Fallback to preprod DB for final client_deliveries failed:", err);
            }
        }

        let driveLink = rawData?.driveLink || null;
        let videoDriveLink = rawData?.videoDriveLink || null;

        // Fallback to directly fetching from preproduction DB
        let _debug: any = {};
        try {
            const { preprodPool } = require('../config/db');
            const { rows: ppsRows } = await preprodPool.query(`
                SELECT drive_link, video_drive_link
                FROM pre_production_shoots 
                WHERE external_lead_id = $1 OR external_lead_id = $2
                ORDER BY updated_at DESC LIMIT 1
            `, [leadDetail.leadSerialNumber, String(leadId)]);

            _debug.ppsRows = ppsRows;

            const { rows: edRows } = await preprodPool.query(`
                SELECT drive_link, video_drive_link, save_the_date_drive_link, save_the_video_drive_link, retouch_drive_link
                FROM event_details 
                WHERE external_lead_id = $1 OR external_lead_id = $2
                ORDER BY updated_at DESC LIMIT 1
            `, [leadDetail.leadSerialNumber, String(leadId)]);

            _debug.edRows = edRows;

            if (!driveLink) {
                driveLink = ppsRows[0]?.drive_link || edRows[0]?.drive_link || edRows[0]?.save_the_date_drive_link || edRows[0]?.retouch_drive_link || null;
            }
            if (!videoDriveLink) {
                videoDriveLink = ppsRows[0]?.video_drive_link || edRows[0]?.video_drive_link || edRows[0]?.save_the_video_drive_link || null;
            }
        } catch (dbErr: any) {
            _debug.error = dbErr.message;
            console.error("Failed to query preproduction DB for drive links:", dbErr.message);
        }

        const isRawDataApproved = rawData?.notes?.includes(`[${type}_Approved]`) || rawData?.status === 'client_approved';

        let clientRequirements: any = rawData?.clientRequirements || {};
        if (typeof clientRequirements === 'string') {
            try { clientRequirements = JSON.parse(clientRequirements); } catch(e){}
        }
        
        let reqs = clientRequirements[type];
        if (!reqs && type === 'Retouch') {
            reqs = clientRequirements['Retouching'];
        }

        res.status(200).json({ 
            success: true, 
            data: { 
                driveLink: driveLink || null, 
                videoDriveLink: videoDriveLink || null,
                isRawDataApproved,
                requirements: reqs || null,
                finalDelivery: finalDelivery ? {
                    driveLink: finalDelivery.driveLink,
                    videoDriveLink: finalDelivery.videoDriveLink,
                    notes: finalDelivery.notes
                } : null,
                _debug
            } 
        });

    } catch (error: any) {
        console.error('GET RAW DATA LINKS ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export const approveFinalDeliveryController = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const payload = verifyClientToken(token);
        const leadId = payload.id;

        if (!leadId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { projectType } = req.body;

        const leadDetail = await prisma.leadsDetail.findUnique({
            where: { leadId: Number(leadId) }
        });

        const name = leadDetail ? `${leadDetail.firstName || ''} ${leadDetail.lastName || ''}`.trim() : '';
        const SALES_API_URL = process.env.SALES_API_URL || 'http://localhost:5000/api';
        
        let numericLeadIdStr: string | null = null;
        if (leadDetail?.leadSerialNumber) {
            const match = String(leadDetail.leadSerialNumber).match(/\d+$/);
            if (match) numericLeadIdStr = Number(match[0]).toString();
        }

        const delivery = await prisma.clientDelivery.findFirst({
            where: { leadId: Number(leadId), deliveryType: 'FINAL_DELIVERABLES' },
            orderBy: { createdAt: 'desc' }
        });

        const flag = `[${projectType}_Final_Approved]`;

        if (delivery) {
            let notes = delivery.notes || '';
            if (!notes.includes(flag)) {
                notes = notes ? `${notes} ${flag}` : flag;
                await prisma.clientDelivery.update({
                    where: { id: delivery.id },
                    data: { notes }
                });
            }
        } else {
            try {
                const { preprodPool } = require('../config/db');
                const qBase = `SELECT id, notes FROM client_deliveries WHERE (lead_id::text = $1 OR lead_id::text = $2 OR (lead_id::text = $3 AND $3 IS NOT NULL)) AND delivery_type = 'FINAL_DELIVERABLES' ORDER BY created_at DESC LIMIT 1`;
                const { rows } = await preprodPool.query(qBase, [String(leadId), String(leadDetail?.leadSerialNumber), numericLeadIdStr]);
                
                if (rows.length > 0) {
                    const row = rows[0];
                    let notes = row.notes || '';
                    if (!notes.includes(flag)) {
                        notes = notes ? `${notes} ${flag}` : flag;
                        await preprodPool.query(`UPDATE client_deliveries SET notes = $1 WHERE id = $2`, [notes, row.id]);
                    }
                }
            } catch (err) {
                console.error("Failed to update notes in preprod DB", err);
            }
        }

        try {
            await axios.post(`${SALES_API_URL}/notifications/final-delivery-approved`, {
                leadId: leadId,
                leadName: name,
                projectType: projectType
            });
        } catch (e: any) {
            console.error('Failed to trigger notification on Sales Backend', e.message);
        }

        const CRM_API_URL = process.env.CRM_API_URL || process.env.PREPRODUCTION_API_URL || 'http://localhost:5001/api';
        const serialNumber = leadDetail?.leadSerialNumber || `LD-${leadId}`;

        // Forward approval to Preproduction CRM Backend
        try {
            await axios.patch(`${CRM_API_URL}/assigned-projects/${serialNumber}/client-approve`, {
                projectType
            });
        } catch (e: any) {
            console.error('Failed to notify CRM backend of approval', e.message);
        }

        res.status(200).json({ success: true, message: 'Final delivery approved successfully' });
    } catch (error: any) {
        console.error('APPROVE FINAL DELIVERY ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const rejectFinalDeliveryController = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const payload = verifyClientToken(token);
        const leadId = payload.id;

        if (!leadId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { projectType, query } = req.body;

        if (!projectType || !query) {
            return res.status(400).json({ success: false, message: 'Missing projectType or query' });
        }

        const leadDetail = await prisma.leadsDetail.findUnique({
            where: { leadId: Number(leadId) }
        });

        const CRM_API_URL = process.env.CRM_API_URL || process.env.PREPRODUCTION_API_URL || 'http://localhost:5001/api';
        
        const serialNumber = leadDetail?.leadSerialNumber || `LD-${leadId}`;

        // Forward rejection to Preproduction CRM Backend
        try {
            await axios.patch(`${CRM_API_URL}/assigned-projects/${serialNumber}/client-reject`, {
                projectType,
                query
            });
        } catch (e: any) {
            console.error('Failed to notify CRM backend of rejection', e.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to notify CRM backend. Please try again.' 
            });
        }

        // Also update local delivery notes so the frontend can show a rejected state if needed
        let numericLeadIdStr: string | null = null;
        if (leadDetail?.leadSerialNumber) {
            const match = String(leadDetail.leadSerialNumber).match(/\d+$/);
            if (match) numericLeadIdStr = Number(match[0]).toString();
        }

        const delivery = await prisma.clientDelivery.findFirst({
            where: { leadId: Number(leadId), deliveryType: 'FINAL_DELIVERABLES' },
            orderBy: { createdAt: 'desc' }
        });

        const flag = `[${projectType}_Rejected]`;

        if (delivery) {
            let notes = delivery.notes || '';
            if (!notes.includes(flag)) {
                notes = notes ? `${notes} ${flag}` : flag;
                await prisma.clientDelivery.update({
                    where: { id: delivery.id },
                    data: { notes }
                });
            }
        } else {
             try {
                const { preprodPool } = require('../config/db');
                const qBase = `SELECT id, notes FROM client_deliveries WHERE (lead_id::text = $1 OR lead_id::text = $2 OR (lead_id::text = $3 AND $3 IS NOT NULL)) AND delivery_type = 'FINAL_DELIVERABLES' ORDER BY created_at DESC LIMIT 1`;
                const { rows } = await preprodPool.query(qBase, [String(leadId), String(leadDetail?.leadSerialNumber), numericLeadIdStr]);
                
                if (rows.length > 0) {
                    const row = rows[0];
                    let notes = row.notes || '';
                    if (!notes.includes(flag)) {
                        notes = notes ? `${notes} ${flag}` : flag;
                        await preprodPool.query(`UPDATE client_deliveries SET notes = $1 WHERE id = $2`, [notes, row.id]);
                    }
                }
            } catch (err) {
                console.error("Failed to update reject notes in preprod DB", err);
            }
        }

        res.status(200).json({ success: true, message: 'Query submitted successfully. The team will review it shortly.' });
    } catch (error: any) {
        console.error('REJECT FINAL DELIVERY ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Trigger nodemon restart after prisma generate
