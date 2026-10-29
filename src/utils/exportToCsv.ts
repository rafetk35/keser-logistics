/**
 * Utility to export tabular data to Excel-compatible CSV files.
 * Uses UTF-8 BOM (\uFEFF) to ensure Turkish characters (ç, ğ, ı, ö, ş, ü, İ)
 * render properly in Microsoft Excel and LibreOffice Calc.
 */

export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  columns: { header: string; key: keyof T | ((row: T) => any) }[]
) {
  if (!rows || rows.length === 0) {
    alert('Dışa aktarılacak kayıt bulunamadı.');
    return;
  }

  // Header line
  const headerLine = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(';');

  // Data rows
  const dataLines = rows.map(row => {
    return columns.map(col => {
      let val: any;
      if (typeof col.key === 'function') {
        val = col.key(row);
      } else {
        val = row[col.key];
      }

      if (val === null || val === undefined) {
        return '""';
      }

      if (typeof val === 'number') {
        // Turkish locale decimal format
        return `"${val.toLocaleString('tr-TR')}"`;
      }

      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join(';');
  });

  // UTF-8 BOM for Excel
  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
