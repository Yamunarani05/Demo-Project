import { Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import nodemailer from "nodemailer";
import prisma from "../config/prisma";
import { hashPassword, comparePassword, generateClientToken, verifyClientToken } from "../util/auth";
import { preprodPool } from "../config/db";

const otpStore = new Map<string, { otp: string, expiresAt: number }>();

const getTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
  });


export class ClientAuthController {
  // Verify token
  static async verify(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Missing token" });
      }

      const token = authHeader.split(" ")[1];
      const payload = verifyClientToken(token);

      return res.status(200).json({
        success: true,
        data: {
          ...payload,
          roles: ["client"],
          redirectPath: "/client/dashboard"
        }
      });
    } catch (e: any) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  }

  // Get current client tracker state
  static async getMe(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Missing token" });
      }

      const token = authHeader.split(" ")[1];
      const payload = verifyClientToken(token);

      const lead = await prisma.leadsDetail.findUnique({
        where: { leadId: Number(payload.id) },
        select: {
          leadId: true,
          leadSerialNumber: true,
          firstName: true,
          lastName: true,
          email: true,
          contactNumber: true,
          address: true,
          eventType: true,
          eventDate: true,
          currentStage: true,
          leadFollowedBy: true,
          events: true,
          leadEmployee: {
            include: { employee: true }
          },
          clientDeliveries: true,
          invoices: true,
          quotationLeads: true
        }
      });

      if (!lead) {
        return res.status(404).json({ success: false, message: "Lead not found" });
      }

      if (!lead.eventDate) {
        if (lead.events && lead.events.length > 0) {
          const validEv = lead.events.find((e: any) => e.eventDatetime);
          if (validEv) (lead as any).eventDate = validEv.eventDatetime;
        }
        if (!lead.eventDate && lead.invoices && lead.invoices.length > 0) {
          for (const inv of lead.invoices) {
            if (inv.previewEvents) {
              let previewEvents: any[] = [];
              try {
                previewEvents = Array.isArray(inv.previewEvents) ? inv.previewEvents : JSON.parse(inv.previewEvents as string);
              } catch { }
              const nonDateTitles = ["EVENT NAME", "LOCATION", "VENUE", "CLIENT", "NAME"];
              const found = previewEvents.find(
                (pe: any) => pe.value && String(pe.value).trim() !== "" && String(pe.value).trim() !== "-" && !nonDateTitles.includes(String(pe.title || "").toUpperCase())
              );
              if (found) {
                (lead as any).eventDate = String(found.value).trim();
                break;
              }
            }
          }
        }
      }

      // Proxy fetch production tracker data from Preproduction backend
      try {
        const PREPRODUCTION_API_URL = process.env.PREPRODUCTION_API_URL || 'http://localhost:5001/api';
        // We use lead.leadSerialNumber (if available) or lead.leadId as clientId since Preproduction relies on it
        const proxyRes = await axios.get(`${PREPRODUCTION_API_URL}/master-admin/sales/clients/${lead.leadSerialNumber || lead.leadId}/tracker-data`);
        if (proxyRes.data?.success) {
          const preprodData = proxyRes.data.data;

          // Map preprod assignments
          const mappedAssignments = preprodData.assignments.map((a: any) => ({
            id: a.lead_employee_id,
            taskName: a.task_name,
            flowStage: a.flow_stage,
            createdAt: a.created_at,
            status: a.status,
            // We create a dummy employee object to match the Prisma structure
            employee: {
              firstName: a.employee_first_name ? a.employee_first_name : (a.employee_id ? `Employee ${a.employee_id}` : 'Production Team'),
              lastName: a.employee_last_name || '',
              position: a.role || 'NORMAL'
            }
          }));
          if (!lead.leadEmployee) (lead as any).leadEmployee = [];
          (lead as any).leadEmployee = [...lead.leadEmployee, ...mappedAssignments];

          // Map preprod events
          const mappedEvents = preprodData.events.map((e: any) => ({
            id: e.id,
            eventName: e.event_name,
            status: e.status
          }));
          if (!lead.events) (lead as any).events = [];
          (lead as any).events = [...lead.events, ...mappedEvents];

          // Attach pixoffice and pixstudio
          (lead as any).pixoffice = preprodData.pixoffice || [];
          (lead as any).pixstudio = preprodData.pixstudio || [];
          (lead as any).assignedPostProdCrm = preprodData.assignedPostProdCrm || null;
          (lead as any).assignedProjects = preprodData.assignedProjects || [];

          // Check if any raw data is uploaded and verified
          let rawDataUploaded = false;
          let dataManagerVerified = false;
          let _debug: any = {};
          try {
            // Debug: manually check client_deliveries in sales and preprod DBs
            try {
              const { salesPool } = require('../config/db');
              let numericLeadIdStr = null;
              if (lead.leadSerialNumber) {
                const match = String(lead.leadSerialNumber).match(/\d+$/);
                if (match) numericLeadIdStr = Number(match[0]).toString();
              }
              const q = `SELECT * FROM client_deliveries WHERE lead_id::text = $1 OR lead_id::text = $2 OR (lead_id::text = $3 AND $3 IS NOT NULL)`;
              const params = [String(lead.leadSerialNumber), String(lead.leadId), numericLeadIdStr];
              const salesRes = await salesPool.query(q, params);
              const preprodRes = await preprodPool.query(q, params);
              _debug.clientDeliveriesDb_Sales = salesRes?.rows || [];
              _debug.clientDeliveriesDb_Preprod = preprodRes?.rows || [];

              const allDeliveries = [..._debug.clientDeliveriesDb_Sales, ..._debug.clientDeliveriesDb_Preprod];

              // Map and inject into lead.clientDeliveries for Tracker step 11
              const mappedDeliveries = allDeliveries.map((row: any) => ({
                id: row.id,
                leadId: row.lead_id,
                deliveryType: row.delivery_type,
                driveLink: row.drive_link,
                videoDriveLink: row.video_drive_link,
                status: row.status,
                notes: row.notes,
                createdAt: row.created_at,
                updatedAt: row.updated_at
              }));
              if (!lead.clientDeliveries) {
                (lead as any).clientDeliveries = [];
              }
              (lead as any).clientDeliveries = [...lead.clientDeliveries, ...mappedDeliveries];
            } catch (cdErr: any) {
              _debug.clientDeliveriesError = cdErr.message;
            }

            // Check event_details
            const { rows: edRows } = await preprodPool.query(`
                   SELECT media_status, drive_link, video_drive_link, save_the_date_drive_link, save_the_video_drive_link, retouch_drive_link
                   FROM event_details 
                   WHERE external_lead_id = $1 OR external_lead_id = $2
                   LIMIT 1
                 `, [lead.leadSerialNumber, String(lead.leadId)]);

            _debug.edRows = edRows;

            if (edRows.length > 0) {
              const ed = edRows[0];
              if (ed.drive_link || ed.video_drive_link || ed.save_the_date_drive_link || ed.save_the_video_drive_link || ed.retouch_drive_link) {
                rawDataUploaded = true;
              }
              if (ed.media_status === 'Verified') {
                dataManagerVerified = true;
              }
            }

            // Check pre_production_shoots
            const { rows: ppsRows } = await preprodPool.query(`
                   SELECT media_status, drive_link, video_drive_link
                   FROM pre_production_shoots 
                   WHERE external_lead_id = $1 OR external_lead_id = $2
                   LIMIT 1
                 `, [lead.leadSerialNumber, String(lead.leadId)]);

            _debug.ppsRows = ppsRows;

            if (ppsRows.length > 0) {
              const pps = ppsRows[0];
              if (pps.drive_link || pps.video_drive_link) {
                rawDataUploaded = true;
              }
              if (pps.media_status === 'Verified') {
                dataManagerVerified = true;
              }
            }
          } catch (e: any) {
            _debug.error = e.message;
            console.error("[ClientTracker] Failed to fetch proxy incoming data from db:", e.message);
          }
          (lead as any).rawDataUploaded = rawDataUploaded;
          (lead as any).dataManagerVerified = dataManagerVerified;
          (lead as any)._debug = _debug;
        }
      } catch (e: any) {
        console.error("[ClientTracker] Failed to fetch proxy tracking data from Preproduction:", e.message);
      }

      return res.status(200).json({
        success: true,
        data: lead
      });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // Set Password using Token
  static async setPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: "Token and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
      }

      const safeToken = String(token).trim();
      console.log(`[SetPassword] Attempting to verify token: ${safeToken}`);

      const lead = await prisma.leadsDetail.findFirst({
        where: { clientToken: safeToken, isDeleted: false }
      });

      if (!lead) {
        console.warn(`[SetPassword] Failed to find lead for token: ${safeToken}`);
        return res.status(400).json({ success: false, message: "Invalid or expired setup token" });
      }

      const hashedPassword = await hashPassword(newPassword);

      // Create new token to auto-login the user
      const clientName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || lead.email || "Client";
      const jwtToken = generateClientToken({ id: String(lead.leadId), email: lead.email || "", name: clientName });

      await prisma.leadsDetail.update({
        where: { leadId: lead.leadId },
        data: {
          passwordHash: hashedPassword,
          clientToken: null // Invalidating setup token
        }
      });

      return res.status(200).json({
        success: true,
        message: "Password set successfully!",
        data: {
          token: jwtToken,
          role: "client",
          userId: lead.leadId,
          fullName: clientName,
          redirectPath: "/client/dashboard"
        }
      });

    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to set password",
      });
    }
  }

  // Client Login
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
      }

      const isNumeric = /^\d+$/.test(email);

      const lead = await prisma.leadsDetail.findFirst({
        where: {
          OR: [
            { email: { equals: email, mode: 'insensitive' } },
            { leadSerialNumber: { equals: email, mode: 'insensitive' } },
            ...(isNumeric ? [{ leadId: Number(email) }] : [])
          ],
          isDeleted: false,
          passwordHash: { not: null }
        }
      });

      if (!lead || !lead.passwordHash) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }

      const valid = await comparePassword(password, lead.passwordHash);
      if (!valid) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }

      const clientName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || lead.email || "Client";
      const jwtToken = generateClientToken({ id: String(lead.leadId), email: lead.email || "", name: clientName });

      return res.status(200).json({
        success: true,
        message: "Client login successful",
        data: {
          token: jwtToken,
          role: "client",
          userId: lead.leadId,
          fullName: clientName,
          redirectPath: "/client/dashboard"
        }
      });

    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  // ─── Forgot Password Flow ─────────────────────────────

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const isNumeric = /^\d+$/.test(email);

      const lead = await prisma.leadsDetail.findFirst({
        where: {
          OR: [
            { email: { equals: email, mode: 'insensitive' } },
            { leadSerialNumber: { equals: email, mode: 'insensitive' } },
            ...(isNumeric ? [{ leadId: Number(email) }] : [])
          ],
          isDeleted: false
        }
      });

      if (!lead) {
        return res.status(404).json({ success: false, message: "No account found with this email address" });
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
      otpStore.set(normalizedEmail, { otp, expiresAt });

      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"Red Angle" <${process.env.SMTP_EMAIL || process.env.EMAIL_USER}>`,
        to: normalizedEmail,
        subject: "Password Reset OTP — Red Angle",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #faf5ff; border-radius: 16px;">
            <h2 style="color: #7c3aed; margin-bottom: 8px;">Password Reset</h2>
            <p style="color: #475569; font-size: 14px;">Hi <strong>${lead.firstName || 'Client'}</strong>,</p>
            <p style="color: #475569; font-size: 14px;">Use the OTP below to reset your password. This code is valid for <strong>5 minutes</strong>.</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7c3aed; background: #ede9fe; padding: 16px 32px; border-radius: 12px;">${otp}</span>
            </div>
            <p style="color: #94a3b8; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });

      return res.json({ success: true, message: "OTP sent to your email address" });
    } catch (err: any) {
      console.error("Forgot password error:", err);
      return res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required" });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const storedData = otpStore.get(normalizedEmail);

      if (!storedData || storedData.otp !== otp || storedData.expiresAt < Date.now()) {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP. Please request a new one." });
      }

      return res.json({ success: true, message: "OTP verified successfully" });
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      return res.status(500).json({ success: false, message: "Verification failed. Please try again." });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ success: false, message: "Email and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const isNumeric = /^\d+$/.test(email);
      const lead = await prisma.leadsDetail.findFirst({
        where: {
          OR: [
            { email: { equals: email, mode: 'insensitive' } },
            { leadSerialNumber: { equals: email, mode: 'insensitive' } },
            ...(isNumeric ? [{ leadId: Number(email) }] : [])
          ],
          isDeleted: false
        }
      });

      if (!lead) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      otpStore.delete(normalizedEmail);

      const hashedPassword = await hashPassword(newPassword);
      await prisma.leadsDetail.update({
        where: { leadId: lead.leadId },
        data: { passwordHash: hashedPassword }
      });

      return res.json({ success: true, message: "Password reset successfully. You can now log in." });
    } catch (err: any) {
      console.error("Reset password error:", err);
      return res.status(500).json({ success: false, message: "Password reset failed. Please try again." });
    }
  }
}

export default ClientAuthController;

