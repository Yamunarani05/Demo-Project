export const exportToStyledExcel = async (
    reportCategory: string,
    reportData: any,
    filteredData: any[],
    formatDate: (d: string | null) => string,
    formatTime: (t: string | null) => string,
    todayDate: string
) => {
    let rows: any[] = [];
    if (Array.isArray(filteredData) && filteredData.length > 0) {
        rows = filteredData;
    } else if (Array.isArray(reportData) && reportData.length > 0) {
        rows = reportData;
    }

    if (rows.length === 0) return;

    const headers = Object.keys(rows[0]);
    const csvContent = [
        headers.join(','),
        ...rows.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = (todayDate || new Date().toISOString().split('T')[0]).replace(/[\/\\]/g, '-');
    link.setAttribute('download', `${reportCategory}_report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
