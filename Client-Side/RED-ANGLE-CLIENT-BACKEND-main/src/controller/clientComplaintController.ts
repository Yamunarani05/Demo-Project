import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const createComplaint = async (req: Request, res: Response) => {
    try {
        const payload = (req as any).user;
        if (!payload || !payload.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const leadId = Number(payload.id);
        const { subject, complaint } = req.body;

        if (!complaint) {
            return res.status(400).json({ success: false, message: 'Complaint text is required' });
        }

        const newComplaint = await prisma.clientComplaint.create({
            data: {
                leadId,
                subject: subject || null,
                complaint,
                status: 'Open'
            }
        });

        res.status(201).json({ success: true, data: newComplaint });
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getComplaints = async (req: Request, res: Response) => {
    try {
        const payload = (req as any).user;
        if (!payload || !payload.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const leadId = Number(payload.id);

        const complaints = await prisma.clientComplaint.findMany({
            where: { leadId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: complaints });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
