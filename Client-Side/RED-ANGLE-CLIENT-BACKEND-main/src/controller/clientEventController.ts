import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyClientToken } from '../util/auth';
import { preprodPool } from '../config/db';

const prisma = new PrismaClient();

export const getClientEvents = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const payload = verifyClientToken(token);
        const leadId = payload.id;

        if (!leadId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const lead = await prisma.leadsDetail.findUnique({
            where: { leadId: Number(leadId) },
            select: { leadSerialNumber: true }
        });

        const events = await prisma.events.findMany({
            where: { leadId: Number(leadId) },
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { eventDatetime: 'asc' }
        });

        // Query clientDelivery table to get drive links (prioritize EVENT_RAW_DATA)
        let eventDelivery = await prisma.clientDelivery.findFirst({
            where: {
                leadId: Number(leadId),
                deliveryType: 'EVENT_RAW_DATA'
            },
            orderBy: { createdAt: 'desc' }
        });
        
        if (!eventDelivery) {
            eventDelivery = await prisma.clientDelivery.findFirst({
                where: {
                    leadId: Number(leadId),
                    deliveryType: 'RAW_DATA'
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        let numericLeadIdStr: string | null = null;
        if (lead?.leadSerialNumber) {
            const match = String(lead.leadSerialNumber).match(/\d+$/);
            if (match) numericLeadIdStr = Number(match[0]).toString();
        }

        if (!eventDelivery) {
            try {
                const qBase = `SELECT * FROM client_deliveries WHERE (lead_id::text = $1 OR lead_id::text = $2 OR (lead_id::text = $3 AND $3 IS NOT NULL))`;
                const { rows } = await preprodPool.query(`${qBase} AND delivery_type IN ('EVENT_RAW_DATA', 'RAW_DATA') ORDER BY created_at DESC LIMIT 1`, [String(leadId), String(lead?.leadSerialNumber), numericLeadIdStr]);
                if (rows.length > 0) {
                    eventDelivery = {
                        notes: rows[0].notes,
                        driveLink: rows[0].drive_link,
                        videoDriveLink: rows[0].video_drive_link,
                        dronePhotoLink: rows[0].drone_photo_drive_link,
                        droneVideoLink: rows[0].drone_video_drive_link,
                    } as any;
                }
            } catch (err) {
                console.error("Fallback to preprod DB for eventDelivery failed:", err);
            }
        }

        // Still get media_status and raw data links from event_details directly
        let eventDetails: any = null;
        let pixofficeDetails: any = null;
        let pixstudioDetails: any = null;

        if (lead?.leadSerialNumber) {
            console.log("Fetching event_details for external_lead_id:", lead.leadSerialNumber);
            const { rows } = await preprodPool.query(
                `SELECT media_status, drive_link, video_drive_link, drone_photo_drive_link, drone_video_drive_link FROM event_details WHERE external_lead_id = $1 LIMIT 1`,
                [lead.leadSerialNumber]
            );
            console.log("rawEventDetails:", rows);
            if (rows.length > 0) {
                eventDetails = rows[0];
            }

            // Fetch pixoffice_entries
            try {
                const { rows: poRows } = await preprodPool.query(
                    `SELECT storage_path FROM pixoffice_entries WHERE external_lead_id = $1 ORDER BY created_at DESC LIMIT 1`,
                    [lead.leadSerialNumber]
                );
                if (poRows.length > 0) {
                    pixofficeDetails = poRows[0];
                }
            } catch (err: any) {
                console.error("Error fetching pixoffice_entries:", err.message);
            }

            // Fetch pixstudio_entries
            try {
                const { rows: psRows } = await preprodPool.query(
                    `SELECT storage_path FROM pixstudio_entries WHERE external_lead_id = $1 ORDER BY created_at DESC LIMIT 1`,
                    [lead.leadSerialNumber]
                );
                if (psRows.length > 0) {
                    pixstudioDetails = psRows[0];
                }
            } catch (err: any) {
                console.error("Error fetching pixstudio_entries:", err.message);
            }
        } else {
            console.log("No leadSerialNumber found for leadId:", leadId);
        }

        const normalizedStatus = (eventDetails?.media_status || "").trim().toLowerCase();
        const dataManagerApproved = ["verified", "crm_verified", "harddisk_closed"].includes(normalizedStatus);
        console.log("dataManagerApproved:", dataManagerApproved, "normalizedStatus:", normalizedStatus);

        const notes = eventDelivery?.notes || '';
        const isRawDataApproved = notes.includes('[Event Deliverables_Approved]');

        res.status(200).json({ 
            success: true, 
            data: events,
            dataManagerApproved,
            isRawDataApproved,
            driveLink: eventDetails?.drive_link || eventDelivery?.driveLink || null,
            videoDriveLink: eventDetails?.video_drive_link || eventDelivery?.videoDriveLink || null,
            dronePhotoDriveLink: eventDetails?.drone_photo_drive_link || eventDelivery?.dronePhotoLink || null,
            droneVideoDriveLink: eventDetails?.drone_video_drive_link || eventDelivery?.droneVideoLink || null,
            pixofficeLink: pixofficeDetails?.storage_path || null,
            pixstudioLink: pixstudioDetails?.storage_path || null
        });
    } catch (error: any) {
        console.error('GET CLIENT EVENTS ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
