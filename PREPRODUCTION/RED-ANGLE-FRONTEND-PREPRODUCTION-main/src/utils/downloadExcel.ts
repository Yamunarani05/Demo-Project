import * as XLSX from 'xlsx';

export function downloadCsvAsExcel(csvContent: string, filename: string) {
    const workbook = XLSX.read(csvContent, { type: 'string', raw: true });
    XLSX.writeFile(workbook, filename.replace('.csv', '.xlsx'));
}
