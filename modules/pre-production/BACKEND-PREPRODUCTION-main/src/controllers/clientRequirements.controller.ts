import { Request, Response } from "express";
import { pool } from "../config/db";

export const updateClientRequirementsController = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const { projectType, referenceLink, imageNumbers } = req.body;

    if (!leadId || !projectType) {
      return res.status(400).json({ success: false, message: "Missing leadId or projectType" });
    }

    const appendText = `\n\n=== Client Pre-production Details ===\nReference Style: ${referenceLink || 'N/A'}\nSubmit Selection: ${imageNumbers || 'N/A'}`;

    // Extract numeric ID if it starts with LD-
    const rawNumericMatch = (leadId as string).match(/^LD-0*(\d+)$/i);
    const rawNumericId = rawNumericMatch ? rawNumericMatch[1] : leadId;

    const leadRes = await pool.query(
        `SELECT external_id::text AS external_id, lead_serial_number FROM external_leads
         WHERE external_id::text = $1 
            OR external_id::text = $2 
            OR lead_serial_number = $1 
         LIMIT 1`,
        [leadId, rawNumericId]
    );

    const lead = leadRes.rows[0];
    
    // Generate all possible project ID variations to guarantee a match
    const extId = lead?.external_id;
    const serial = lead?.lead_serial_number;
    
    const candidates = new Set([
        leadId,
        `CRM-${leadId}`,
        `LD-${leadId}`,
        `LD-0${leadId}`,
        `LD-00${leadId}`,
        `RAS${leadId}`,
        `RAS-${leadId}`,
        `RAS-0${leadId}`,
        `RAS-00${leadId}`
    ]);
    if (extId) {
        candidates.add(extId);
        candidates.add(`CRM-${extId}`);
        candidates.add(`LD-${extId}`);
        candidates.add(`LD-0${extId}`);
        candidates.add(`LD-00${extId}`);
        candidates.add(`RAS${extId}`);
        candidates.add(`RAS-${extId}`);
    }
    if (serial) {
        candidates.add(serial);
        candidates.add(`CRM-${serial}`);
        candidates.add(`RAS${serial}`);
        candidates.add(`RAS-${serial}`);
        candidates.add(`RAS-0${serial}`);
        candidates.add(`RAS-00${serial}`);
    }
    const projectIdCandidates = Array.from(candidates);

    // Map client project types to CRM project types robustly
    let projectTypeFilters: string[] = [];
    if (projectType === 'Save the Date') {
        projectTypeFilters = ['Save the Date', 'Save the Date Post', 'Save The Date Post', 'Save The Date'];
    } else if (projectType === 'Save the Video') {
        projectTypeFilters = ['Save the Video', 'Save the Date Video', 'Save The Date Video', 'Save The Video'];
    } else if (projectType === 'Retouch' || projectType === 'Retouching') {
        projectTypeFilters = ['Retouching', 'Outdoor Retouch', 'Retouch'];
    } else {
        projectTypeFilters = [projectType];
    }

    let result = await pool.query(
        `UPDATE assigned_projects
         SET admin_notes = TRIM(SPLIT_PART(COALESCE(admin_notes, ''), '=== Client Pre-production Details ===', 1)) || $1,
             reference_link = $4,
             submit_selection = $5,
             updated_at = NOW()
         WHERE project_type = ANY($2::text[])
           AND project_id = ANY($3::text[])
         RETURNING *`,
        [appendText, projectTypeFilters, projectIdCandidates, referenceLink || null, imageNumbers || null]
    );

    if (result.rowCount === 0) {
        const insertProjectId = `CRM-${serial || extId || rawNumericId || leadId}`;
        result = await pool.query(
            `INSERT INTO assigned_projects (project_id, project_name, project_type, employee_id, reference_link, submit_selection, status)
             VALUES ($1, 'Pre-production Requirements', $2, 'Unassigned', $3, $4, 'Pending')
             ON CONFLICT (project_id, employee_id, project_type) 
             DO UPDATE SET 
                 reference_link = EXCLUDED.reference_link,
                 submit_selection = EXCLUDED.submit_selection,
                 updated_at = NOW()
             RETURNING *`,
            [insertProjectId, projectTypeFilters[0], referenceLink || null, imageNumbers || null]
        );
    }

    res.json({
        success: true,
        data: result.rows,
        message: "Client requirements updated successfully",
    });

  } catch (error: any) {
    console.error("UPDATE CLIENT REQUIREMENTS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
