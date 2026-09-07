import { Request, Response } from "express";
import { submitPixofficeDataService, getPixofficeStatsService } from "../services/pixoffice.service";
import { pool } from "../config/db";
import { createNotificationService } from "../services/notification.service";

export const submitPixofficeDataController = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        if (!body.external_lead_id || !body.event_name) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const data = await submitPixofficeDataService(body);
        
        try {
            const { updateCurrentStageService } = require('../services/stageTracking.service');
            await updateCurrentStageService(body.external_lead_id, 'pixoffice_processing');
            await updateCurrentStageService(body.external_lead_id, 'assigned_to_crm');
        } catch (e) {
            console.error('Failed to trigger Pixoffice stage tracking:', e);
        }

        let phaseAdvance: any = null;
        try {
            const { advanceEventToPostProductionService } = require('../services/phaseTracking.service');
            phaseAdvance = await advanceEventToPostProductionService(String(body.external_lead_id));
            if (phaseAdvance) {
                await createNotificationService({
                    type: 'raw_data_uploaded',
                    title: 'Event stage complete — ready for editor assignment',
                    detail: `Lead ${body.external_lead_id} moved to post-production. Open Assign Client to assign editors.`,
                    lead_id: Number.isFinite(Number(body.external_lead_id)) ? Number(body.external_lead_id) : undefined,
                    from_role: 'data-manager',
                    from_name: 'Data Manager',
                    target_roles: ['post-production-crm'],
                    source_stage: 'event',
                });
            }
        } catch (e) {
            console.error('Failed to advance event lead to post-production:', e);
        }

        res.status(200).json({ success: true, data: { entry: data, phase: phaseAdvance } });
    } catch (error: any) {
        console.error("SUBMIT PIXOFFICE ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPixofficeStatsController = async (req: Request, res: Response) => {
    try {
        const stats = await getPixofficeStatsService();
        res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
        console.error("GET PIXOFFICE STATS ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
