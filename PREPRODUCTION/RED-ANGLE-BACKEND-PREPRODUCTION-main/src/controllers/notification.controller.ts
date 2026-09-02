import { Request, Response } from "express";
import axios from "axios";
import {
    createNotificationService,
    getNotificationsService,
    getNotificationsByRolesService,
    getNotificationsFilteredService,
    clearNotificationsService,
    markNotificationReadService,
    markAllNotificationsReadService,
    markAllNotificationsReadByRolesService,
} from "../services/notification.service";

export const createNotificationController = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const notification = await createNotificationService({
            type: data.type,
            title: data.title,
            detail: data.detail,
            lead_id: data.lead_id,
            from_role: data.from_role,
            from_name: data.from_name,
            target_roles: data.target_roles || ["admin"],
            target_employee_id: data.target_employee_id,
            source_stage: data.source_stage,
        });
        return res.status(201).json({ success: true, data: notification });
    } catch (error: any) {
        console.error("Error creating notification:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getNotificationsController = async (req: Request, res: Response) => {
    try {
        const rolesParam = req.query.roles as string | undefined;
        const role = (req.query.role as string) || "admin";
        const employee_id = req.query.employee_id as string | undefined;
        const type = req.query.type as string | undefined;
        const source_stage = req.query.source_stage as string | undefined;
        const from_role = req.query.from_role as string | undefined;

        const rolesArray = rolesParam?.split(",").map(r => r.trim()).filter(Boolean);
        
        let notifications;
        if (type || source_stage || from_role) {
            notifications = await getNotificationsFilteredService({
                roles: rolesArray?.length ? rolesArray : role ? [role] : undefined,
                employee_id,
                type,
                source_stage,
                from_role,
            });
        } else if (rolesArray?.length) {
            notifications = await getNotificationsByRolesService(rolesArray, employee_id);
        } else {
            notifications = await getNotificationsService(role, employee_id);
        }

        try {
            const serviceAUrl = process.env.SERVICE_A_URL;
            if (serviceAUrl && req.headers.authorization) {
                const salesRes = await axios.get(`${serviceAUrl}/api/notifications`, {
                    headers: { Authorization: req.headers.authorization },
                    timeout: 5000
                });
                
                if (salesRes.data && salesRes.data.success && salesRes.data.data) {
                    const salesData = Array.isArray(salesRes.data.data) ? salesRes.data.data : [];
                    const mappedSales = salesData.map((sn: any) => ({
                        id: sn.notificationId + 1000000,
                        notification_id: sn.notificationId,
                        type: sn.issueType,
                        title: sn.title,
                        detail: sn.message,
                        created_at: sn.createdAt,
                        is_read: sn.isRead,
                        source: 'sales'
                    }));
                    notifications = [...notifications, ...mappedSales].sort((a, b) => 
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );
                }
            }
        } catch (salesErr: any) {
            console.error("Failed to fetch Sales notifications:", salesErr.message);
        }

        return res.status(200).json({ success: true, data: notifications });
    } catch (error: any) {
        console.error("Error getting notifications:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const markNotificationReadController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const numId = Number(id);

        if (numId > 1000000) {
            const salesId = numId - 1000000;
            const serviceAUrl = process.env.SERVICE_A_URL;
            if (serviceAUrl && req.headers.authorization) {
                await axios.patch(`${serviceAUrl}/api/notifications/${salesId}/mark-read`, {}, {
                    headers: { Authorization: req.headers.authorization }
                });
            }
            return res.status(200).json({ success: true });
        }

        const notification = await markNotificationReadService(numId);
        return res.status(200).json({ success: true, data: notification });
    } catch (error: any) {
        console.error("Error marking notification read:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const markAllNotificationsReadController = async (req: Request, res: Response) => {
    try {
        const roles = req.body.roles as string[] | undefined;
        const role = (req.body.role as string) || "admin";
        const employee_id = req.body.employee_id as string | undefined;

        if (roles && Array.isArray(roles) && roles.length > 0) {
            await markAllNotificationsReadByRolesService(roles, employee_id);
        } else {
            await markAllNotificationsReadService(role, employee_id);
        }

        try {
            const serviceAUrl = process.env.SERVICE_A_URL;
            if (serviceAUrl && req.headers.authorization) {
                await axios.patch(`${serviceAUrl}/api/notifications/mark-all-read`, {}, {
                    headers: { Authorization: req.headers.authorization }
                });
            }
        } catch (e: any) {
            console.error("Failed to mark all read in Sales:", e.message);
        }

        return res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error: any) {
        console.error("Error marking all notifications read:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const clearNotificationsController = async (req: Request, res: Response) => {
    try {
        const rolesParam = req.query.roles as string | undefined;
        const bodyRoles = req.body.roles as string[] | undefined;
        const employee_id = (req.query.employee_id as string | undefined) || (req.body.employee_id as string | undefined);
        const roles = rolesParam
            ? rolesParam.split(",").map(r => r.trim()).filter(Boolean)
            : Array.isArray(bodyRoles)
                ? bodyRoles
                : [];

        const deletedCount = await clearNotificationsService({ roles, employee_id });
        return res.status(200).json({ success: true, deletedCount });
    } catch (error: any) {
        console.error("Error clearing notifications:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
