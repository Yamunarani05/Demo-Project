import { Request, Response } from "express";
import {
  getPhaseCompletedClients,
  getAllClientDetails,
  getAllEmployees,
  getEmployeeAttendanceReport,
  getEmployeeLeaveReport,
  getEmployeeWorkReport,
  getSingleClientReport,
  getSingleEmployeeReport
} from "../services/adminReports.service";

export const getPhaseReportController = async (req: Request, res: Response) => {
  try {
    const { phase } = req.params;
    const { dateFilter } = req.query; // e.g. 'today', 'week', 'month', 'year', '07-2026'
    
    const data = await getPhaseCompletedClients(String(phase), String(dateFilter || ''));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClientsReportController = async (req: Request, res: Response) => {
  try {
    const data = await getAllClientDetails();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeesReportController = async (req: Request, res: Response) => {
  try {
    const data = await getAllEmployees();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getEmployeeAttendanceReportController = async (req: Request, res: Response) => {
  try {
    const data = await getEmployeeAttendanceReport();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeLeaveReportController = async (req: Request, res: Response) => {
  try {
    const data = await getEmployeeLeaveReport();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeWorkReportController = async (req: Request, res: Response) => {
  try {
    const data = await getEmployeeWorkReport();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSingleClientReportController = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const data = await getSingleClientReport(String(clientId));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSingleEmployeeReportController = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const data = await getSingleEmployeeReport(String(employeeId));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
