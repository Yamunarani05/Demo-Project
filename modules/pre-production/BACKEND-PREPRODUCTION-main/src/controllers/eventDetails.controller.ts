import { Request, Response } from "express";
import { createEventDetailsService, getEventDetailsByLeadIdService }
  from "../services/eventDetails.service";
import { 
  updateUploadDetailsQuery,
  upsertEventMediaClipsQuery,
  updatePreProductionUploadDetailsQuery
} from "../queries/eventDetails.query";
import { pool } from "../config/db";
import { createNotificationService } from "../services/notification.service";

export const createEventDetailsController = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const event = await createEventDetailsService(req.body);

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error("EVENT DETAILS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEventDetailsByLeadIdController = async (req, res) => {
  try {
    const leadId = String(req.params.leadId);
    const event = await getEventDetailsByLeadIdService(leadId);

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error("GET EVENT DETAILS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUploadDetailsController = async (req, res) => {
  try {
    const leadId = String(req.params.leadId);
    let {
      drive_link,
      video_drive_link,
      camera_used,
      video_camera_used,
      num_images,
      num_videos,
      upload_notes,
      video_upload_notes,
      uploader_role,
      delivery_method,
      hard_disk_delivery_date,
      first_clip_base64,
      last_clip_base64,
      video_included_file_format,
      task_key
    } = req.body;

    const files = req.files as any;
    const firstClipUrl = files?.firstClipFile?.[0] ? `/${files.firstClipFile[0].path.replace(/\\/g, '/')}` : null;
    const lastClipUrl = files?.lastClipFile?.[0] ? `/${files.lastClipFile[0].path.replace(/\\/g, '/')}` : null;

    if (firstClipUrl || lastClipUrl) {
      if (upload_notes) {
        try {
          const parsed = JSON.parse(upload_notes);
          if (firstClipUrl) parsed.first_clip = firstClipUrl;
          if (lastClipUrl) parsed.last_clip = lastClipUrl;
          upload_notes = JSON.stringify(parsed);
        } catch(e) {}
      }
      if (video_upload_notes) {
        try {
          const parsed = JSON.parse(video_upload_notes);
          if (firstClipUrl) parsed.first_clip = firstClipUrl;
          if (lastClipUrl) parsed.last_clip = lastClipUrl;
          video_upload_notes = JSON.stringify(parsed);
        } catch(e) {}
      }
    }

    const normalizedUploaderRole = (uploader_role || 'photographer')
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const phaseResult = await pool.query(
      `SELECT el.current_phase, ed.event_status
       FROM external_leads el
       LEFT JOIN event_details ed
         ON ed.external_lead_id = el.external_id::text
         OR ed.external_lead_id = el.lead_serial_number
       WHERE el.external_id::text = $1 OR el.lead_serial_number = $1
       LIMIT 1`,
      [leadId]
    );
    const currentPhase = phaseResult.rows[0]?.current_phase || 'pre_production';
    const eventStatus = String(phaseResult.rows[0]?.event_status || '').toLowerCase();
    const fieldEventRoles = ['photographer', 'videographer', 'drone'];

    if (currentPhase === 'event' && fieldEventRoles.includes(normalizedUploaderRole) && eventStatus !== 'ended') {
      return res.status(409).json({
        success: false,
        message: 'Upload is locked until the event tracker is completely ended.',
      });
    }

    let data;
    if (currentPhase === 'pre_production') {
      data = await updatePreProductionUploadDetailsQuery(
        leadId,
        drive_link || '',
        video_drive_link || '',
        camera_used || '',
        video_camera_used || '',
        num_images || 0,
        num_videos || 0,
        upload_notes || '',
        video_upload_notes || '',
        normalizedUploaderRole,
        delivery_method || 'drive_link',
        hard_disk_delivery_date || '',
        first_clip_base64 || '',
        last_clip_base64 || '',
        video_included_file_format || ''
      );
    } else {
      data = await updateUploadDetailsQuery(
        leadId,
        drive_link || '',
        video_drive_link || '',
        camera_used || '',
        video_camera_used || '',
        num_images || 0,
        num_videos || 0,
        upload_notes || '',
        video_upload_notes || '',
        normalizedUploaderRole,
        delivery_method || 'drive_link',
        hard_disk_delivery_date || '',
        currentPhase,
        first_clip_base64 || '',
        last_clip_base64 || '',
        video_included_file_format || '',
        task_key || ''
      );
      if (data && (first_clip_base64 || last_clip_base64)) {
        await upsertEventMediaClipsQuery(leadId, normalizedUploaderRole, first_clip_base64 || '', last_clip_base64 || '', task_key || '');
      }
    }

    if (!data) {
      return res.status(404).json({ success: false, message: 'Event details not found for this lead' });
    }

    if (normalizedUploaderRole === 'drone' && req.body.employee_id) {
      const rawEmployeeId = String(req.body.employee_id).trim();
      const normalizedEmployeeId = rawEmployeeId.startsWith('EMP-')
        ? rawEmployeeId
        : `EMP-${rawEmployeeId.replace(/\D/g, '')}`;
      try {
        await pool.query(
          `UPDATE assign_teams
           SET event_drone = COALESCE(NULLIF(event_drone, ''), $2),
               updated_at = NOW()
           WHERE external_lead_id = $1
              OR external_lead_id IN (
                SELECT external_id::text FROM external_leads WHERE lead_serial_number = $1
                UNION
                SELECT lead_serial_number FROM external_leads WHERE external_id::text = $1
              )`,
          [leadId, normalizedEmployeeId]
        );
      } catch (linkError) {
        console.error('Failed to link drone uploader to assign team:', linkError);
      }
    }

    try {
      const stageLabel = currentPhase === 'event' ? 'Event' : 'Pre-production';
      const isHardDisk = delivery_method === 'hard_disk';
      const roleLabel = normalizedUploaderRole
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

      const sourceStage = currentPhase === 'event' ? 'event' : 'pre-production';
      const preProductionRoles = ['save the date', 'save the video', 'retouch', 'retouching'];
      const isPreProdRole = preProductionRoles.includes(normalizedUploaderRole);

      let notifTitle = isHardDisk ? `${stageLabel} hard disk delivery scheduled` : `${stageLabel} raw data uploaded`;
      let notifType = 'raw_data_uploaded';
      let targetRoles = ['data_manager'];

      if (isPreProdRole) {
        notifTitle = `QC is available for ${roleLabel}`;
        notifType = 'qc_available';
        targetRoles = ['pre-production-crm', 'crm'];
      }

      await createNotificationService({
        type: notifType,
        title: notifTitle,
        detail: isHardDisk
          ? `${roleLabel} will deliver raw data by hard disk for lead ${leadId} on ${hard_disk_delivery_date}. Stage: ${stageLabel}.`
          : `${roleLabel} upload received for lead ${leadId}. Stage: ${stageLabel}.`,
        lead_id: Number.isFinite(Number(leadId)) ? Number(leadId) : undefined,
        from_role: normalizedUploaderRole,
        from_name: req.body.uploader_name || roleLabel,
        target_roles: targetRoles,
        source_stage: sourceStage,
      });
    } catch (e) {
      console.error('Failed to notify about upload:', e);
    }

    // Work Tracking: Record the upload milestone
    try {
      const { updateCurrentStageService } = require('../services/stageTracking.service');
      const isSubmitted = delivery_method === 'hard_disk' || drive_link || video_drive_link;
      if (normalizedUploaderRole === 'drone') {
        if (isSubmitted) {
          await updateCurrentStageService(leadId, 'drone_upload');
        }
      } else if (normalizedUploaderRole === 'photographer' && isSubmitted) {
        await updateCurrentStageService(leadId, 'photographer_upload');
      }
      if (normalizedUploaderRole === 'videographer' && isSubmitted) {
        await updateCurrentStageService(leadId, 'videographer_upload');
      }
    } catch (e) {
      console.error('Failed to trigger upload stage tracking:', e);
    }

    res.json({ success: true, data });
  } catch (error: any) {
    console.error("UPDATE UPLOAD DETAILS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
