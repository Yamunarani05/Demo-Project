import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToStyledExcel = async (
    reportCategory: string, 
    reportData: any, 
    filteredData: any[], 
    formatDate: (d: string | null) => string, 
    formatTime: (t: string | null) => string,
    todayDate: string
) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'RedAngle Studio';
    workbook.created = new Date();

    const styleHeader = (worksheet: ExcelJS.Worksheet) => {
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F46E5' } // Indigo 600
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        
        // Auto-fit columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell?.({ includeEmpty: true }, cell => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength + 2;
        });
        
        // Add borders to all populated cells
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                    left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                    bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                    right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
                };
            });
        });
    };

    const addSheet = (name: string, data: any[]) => {
        if (!data || data.length === 0) return;
        const worksheet = workbook.addWorksheet(name);
        
        // Set columns from keys
        const keys = Object.keys(data[0]);
        worksheet.columns = keys.map(key => ({ header: key, key: key }));
        
        // Add rows
        worksheet.addRows(data);
        
        styleHeader(worksheet);
    };

    if (reportCategory === 'single_client') {
        const client = reportData.client;
        if (client) {
            addSheet("Client Details", [{
                'LEAD ID': client.serialNumber || client.externalId,
                'NAME': client.name,
                'EVENT TYPE': client.eventType,
                'EVENT DATE': formatDate(client.eventDate),
                'CURRENT PHASE': client.currentPhase,
                'INVOICE TOTAL': client.invoiceTotal,
                'INVOICE BALANCE': client.invoiceBalance,
                'SERVICES': client.services || '-',
                'BUDGET': client.budgetRange || '-',
                'MEETING DETAILS': client.meetingDetails || '-',
                'REQUIREMENTS': client.clientRequirements || '-',
                'DELIVERABLES': client.deliverables || '-',
                'SHOOT LOCATIONS': JSON.stringify(client.shootLocations || []),
                'EVENT STARTED': formatDate(client.eventStartedAt),
                'EVENT ENDED': formatDate(client.eventEndedAt),
                'PHOTO DRIVE': client.driveLink || '-',
                'DRONE PHOTO DRIVE': client.dronePhotoDriveLink || '-',
                'DRONE VIDEO DRIVE': client.droneVideoDriveLink || '-',
                'PHOTO DELIVERY METHOD': client.photoDeliveryMethod || '-',
                'PHOTO HD DATE': formatDate(client.photoHardDiskDeliveryDate),
                'VIDEO DELIVERY METHOD': client.videoDeliveryMethod || '-',
                'VIDEO HD DATE': formatDate(client.videoHardDiskDeliveryDate),
            }]);
        }
        
        if (reportData.assignmentSummary) {
            addSheet("Assignments", reportData.assignmentSummary.map((a: any) => ({
                'GROUP': a.group,
                'TASK': a.task,
                'ITEMS COUNT': a.task_count || '-',
                'EMPLOYEE ID': a.employeeId,
                'NAME': a.name,
                'ROLE': a.role
            })));
        }
        
        if (reportData.attendanceSummary) {
            addSheet("Employee Attendance", reportData.attendanceSummary.map((a: any) => ({
                'EMPLOYEE ID': a.employeeId,
                'NAME': a.employee,
                'DATE': formatDate(a.date),
                'STATUS': a.status
            })));
        }

    } else if (reportCategory === 'single_employee') {
        const emp = reportData.employee;
        if (emp) {
            addSheet("Employee Details", [{
                'EMPLOYEE ID': emp.employee_id,
                'NAME': `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
                'ROLE': emp.role,
                'PHONE': emp.phone_number
            }]);
        }
        
        if (reportData.tasks) {
            if (emp.role === 'Multi Role' || emp.role === 'Multi-role') {
                // Group tasks by their specific role/task_name
                const groupedTasks = reportData.tasks.reduce((acc: any, t: any) => {
                    const roleName = t.name || t.task_name || 'Other Tasks';
                    if (!acc[roleName]) acc[roleName] = [];
                    acc[roleName].push(t);
                    return acc;
                }, {});

                Object.keys(groupedTasks).forEach(roleName => {
                    // Excel sheet names are limited to 31 characters and shouldn't have special chars like : \ / ? * [ ]
                    let sheetName = roleName.replace(/[\\\/\?\*\[\]\:]/g, '').trim();
                    if (sheetName.length > 31) sheetName = sheetName.substring(0, 31);
                    
                    addSheet(sheetName, groupedTasks[roleName].map((t: any) => ({
                        'LEAD ID': t.lead_code || t.lead_id || '-',
                        'LEAD NAME': t.client || t.lead_name || '-',
                        'EVENT TYPE': t.type || '-',
                        'FLOW STAGE': t.flow_stage || '-',
                        'TASK': t.name || t.task_name,
                        'ITEMS COUNT': t.task_count || '-',
                        'PRIORITY': t.priority || '-',
                        'STATUS': t.status || 'Pending',
                        'DEADLINE': formatDate(t.deadline),
                        'DESCRIPTION / LOCATION': t.description || '-',
                        'ADMIN NOTES': t.admin_notes || '-',
                        'UPLOAD LINK': t.upload_link || '-'
                    })));
                });
            } else {
                addSheet("Tasks", reportData.tasks.map((t: any) => ({
                    'LEAD ID': t.lead_code || t.lead_id || '-',
                    'LEAD NAME': t.client || t.lead_name || '-',
                    'EVENT TYPE': t.type || '-',
                    'FLOW STAGE': t.flow_stage || '-',
                    'TASK': t.name || t.task_name,
                    'ITEMS COUNT': t.task_count || '-',
                    'PRIORITY': t.priority || '-',
                    'STATUS': t.status || 'Pending',
                    'DEADLINE': formatDate(t.deadline),
                    'DESCRIPTION / LOCATION': t.description || '-',
                    'ADMIN NOTES': t.admin_notes || '-',
                    'UPLOAD LINK': t.upload_link || '-'
                })));
            }
        }
        
        if (reportData.attendance) {
            addSheet("Attendance", reportData.attendance.map((a: any) => {
                let hoursWorked = '-';
                if (a.check_in && a.check_out) {
                    const diff = new Date(a.check_out).getTime() - new Date(a.check_in).getTime();
                    if (diff > 0 && !isNaN(diff)) {
                        const hrs = Math.floor(diff / (1000 * 60 * 60));
                        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        hoursWorked = `${hrs}h ${mins}m`;
                    }
                }
                return {
                    'DATE': formatDate(a.date),
                    'PUNCH IN': formatTime(a.check_in),
                    'PUNCH OUT': formatTime(a.check_out),
                    'HOURS WORKED': hoursWorked,
                    'STATUS': a.status
                };
            }));
        }
        
        if (reportData.leaves) {
            addSheet("Leaves", reportData.leaves.map((l: any) => ({
                'TYPE': l.leave_type,
                'REASON': l.reason || '-',
                'FROM': formatDate(l.from_date),
                'TO': formatDate(l.to_date),
                'DAYS': l.no_of_days,
                'STATUS': l.status
            })));
        }

    } else if (Array.isArray(reportData)) {
        let exportData: any[] = [];
        
        if (['preproduction', 'event', 'post_production', 'clients'].includes(reportCategory)) {
            exportData = filteredData.map((item, idx) => ({
                'S.NO': idx + 1,
                'LEAD ID': item.serialNumber || item.id || item.external_id || item.lead_serial_number,
                'CLIENT NAME': item.name || item.lead_name || '-',
                'EMAIL': item.email || '-',
                'PHONE': item.phone || '-',
                'EVENT TYPE': item.eventType || item.event_type || '-',
                'EVENT DATE': formatDate(item.eventDate || item.event_date),
                'CURRENT PHASE': item.currentPhase || item.current_phase || '-',
                'STATUS': item.status || '-',
                'COMPLETION DATE': formatDate(item.createdAt || item.updated_at),
                'INVOICE TOTAL': item.invoiceTotal || 0,
                'INVOICE BALANCE': item.invoiceBalance || 0,
                'SERVICES': item.services || '-',
                'BUDGET': item.budgetRange || '-',
                'DELIVERABLES': item.deliverables || '-',
                'EVENT STARTED': formatDate(item.eventStartedAt),
                'EVENT ENDED': formatDate(item.eventEndedAt),
                'PHOTO DRIVE': item.driveLink || '-',
                'DRONE PHOTO DRIVE': item.dronePhotoDriveLink || '-',
                'DRONE VIDEO DRIVE': item.droneVideoDriveLink || '-',
                'PHOTO HD DATE': formatDate(item.photoHardDiskDeliveryDate),
                'VIDEO HD DATE': formatDate(item.videoHardDiskDeliveryDate)
            }));
        } else if (reportCategory === 'attendance') {
            exportData = filteredData.map((item, idx) => ({
                'S.NO': idx + 1,
                'EMPLOYEE ID': item.employee_id,
                'NAME': `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown',
                'ROLE': item.role || '-',
                'DATE': formatDate(item.date),
                'PUNCH IN': formatTime(item.check_in),
                'PUNCH OUT': formatTime(item.check_out),
                'STATUS': item.status || 'Absent'
            }));
        } else if (reportCategory === 'leave') {
            exportData = filteredData.map((item, idx) => ({
                'S.NO': idx + 1,
                'EMPLOYEE ID': item.employee_id,
                'NAME': `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown',
                'LEAVE TYPE': item.leave_type || '-',
                'FROM DATE': formatDate(item.from_date),
                'TO DATE': formatDate(item.to_date),
                'NO OF DAYS': item.no_of_days || 0,
                'REASON': item.reason || '-',
                'STATUS': item.status || 'Pending'
            }));
        } else if (reportCategory === 'work') {
            exportData = filteredData.map((item, idx) => ({
                'S.NO': idx + 1,
                'LEAD NAME': item.lead_name || '-',
                'EMPLOYEE ID': item.employee_id,
                'NAME': `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown',
                'ROLE': item.role || '-',
                'TASK': item.task_name || '-',
                'ITEMS COUNT': item.task_count || '-',
                'PRIORITY': item.priority || '-',
                'DEADLINE': formatDate(item.deadline),
                'STATUS': item.status || 'Pending',
                'ASSIGNED ON': formatDate(item.created_at)
            }));
        }

        addSheet("Report", exportData);
    }
    
    const dateStr = todayDate.split('/').join('-');
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${reportCategory}_report_${dateStr}.xlsx`);
};
