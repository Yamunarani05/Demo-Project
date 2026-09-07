import ExcelJS from "exceljs";

export const exportToExcel = async (
  data: any[],
  filename: string,
  headers: string[],
  reportTitle: string // 👈 NEW
) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(reportTitle);

  const columnCount = headers.length;

  /* ===== ROW 1: COMPANY NAME ===== */
  sheet.mergeCells(1, 1, 1, columnCount);
  sheet.getCell("A1").value = "RED ANGLE STUDIO";
  sheet.getCell("A1").font = { size: 18, bold: true };
  sheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  /* ===== ROW 2: REPORT TITLE (DYNAMIC) ===== */
  sheet.mergeCells(2, 1, 2, columnCount);
  sheet.getCell("A2").value = reportTitle.toUpperCase();
  sheet.getCell("A2").font = { size: 13, bold: true };
  sheet.getCell("A2").alignment = { horizontal: "center" };

  /* ===== ROW 3: EMPTY ===== */
  sheet.addRow([]);

  /* ===== ROW 4: GENERATED DATE ===== */
  sheet.mergeCells(4, 1, 4, columnCount);
  sheet.getCell("A4").value = `Generated On: ${new Date().toLocaleString(
    "en-IN"
  )}`;
  sheet.getCell("A4").font = { italic: true };
  sheet.getCell("A4").alignment = { horizontal: "left" };

  /* ===== ROW 5: TABLE HEADER ===== */
  const headerRow = sheet.addRow(headers);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF6938EF" },
    };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  /* ===== DATA ROWS ===== */
  data.forEach((row) => {
    const dataRow = sheet.addRow(
      headers.map((h) => row[h] ?? "")
    );

    dataRow.eachCell((cell) => {
      cell.alignment = { horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  /* ===== COLUMN WIDTH ===== */
  sheet.columns = headers.map(() => ({ width: 22 }));

  /* ===== DOWNLOAD ===== */
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.xlsx`;
  link.click();
};
