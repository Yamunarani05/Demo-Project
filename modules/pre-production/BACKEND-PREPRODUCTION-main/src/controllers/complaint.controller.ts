import { Request, Response } from "express";
import { salesPool } from "../config/db";

export const getComplaints = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                c.id, 
                c.lead_id as "leadId", 
                c.subject, 
                c.complaint, 
                c.status, 
                c.created_at as "createdAt", 
                c.resolved_at as "resolvedAt", 
                c."resolvedBy",
                l.first_name as "firstName",
                l.last_name as "lastName",
                l.lead_serial_number as "leadSerialNumber",
                l.email as "clientEmail",
                l.contact_number as "clientMobile",
                l.event_type as "eventType"
            FROM client_complaints c
            JOIN leads_detail l ON c.lead_id = l.lead_id
            ORDER BY c.created_at DESC
        `;
        const result = await salesPool.query(query);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error: any) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const resolveComplaint = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { resolvedBy } = req.body;
        
        const updateQuery = `
            UPDATE client_complaints
            SET status = $1, resolved_at = NOW(), "resolvedBy" = $2
            WHERE id = $3
            RETURNING *
        `;
        const result = await salesPool.query(updateQuery, ['Resolved', resolvedBy || 'Operational Manager', id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Complaint not found" });
        }

        res.status(200).json({ success: true, data: result.rows[0], message: "Complaint resolved successfully" });
    } catch (error: any) {
        console.error("Error resolving complaint:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
