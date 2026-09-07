import ExcelJS from "exceljs";

export const generateAttendanceExcel = async (
  records: {
    date: string;
    checkIn: string;
    checkOut: string;
    duration: string;
    status: string;
  }[]
) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance Report");

  /* ===== TITLE ===== */
  sheet.mergeCells("A1:E1");
  sheet.getCell("A1").value = "RED ANGLE STUDIO";
  sheet.getCell("A1").font = { size: 16, bold: true };
  sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };

  sheet.mergeCells("A2:E2");
  sheet.getCell("A2").value = "EMPLOYEE ATTENDANCE REPORT";
  sheet.getCell("A2").font = { size: 12, bold: true };
  sheet.getCell("A2").alignment = { horizontal: "center" };

  sheet.mergeCells("A4:E4");
  sheet.getCell("A4").value = `Generated On: ${new Date().toLocaleString("en-IN")}`;
  sheet.getCell("A4").font = { italic: true };

  /* ===== HEADER ===== */
  const headerRow = sheet.addRow([
    "Date",
    "Check In (IST)",
    "Check Out (IST)",
    "Worked Duration",
    "Status",
  ]);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F4FD8" }, // Blue header
    };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  /* ===== DATA ===== */
  records.forEach((r) => {
    const row = sheet.addRow([
      r.date,
      r.checkIn,
      r.checkOut,
      r.duration,
      r.status,
    ]);

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: "center" };
    });
  });

  /* ===== COLUMN WIDTH ===== */
  sheet.columns = [
    { width: 15 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 15 },
  ];

  return workbook;
};
