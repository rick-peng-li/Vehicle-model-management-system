import * as XLSX from 'xlsx';

export const exportToExcel = (fileName: string, headers: string[], data: any[]) => {
  // Combine headers and data
  const worksheetData = [headers, ...data];
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  // Generate buffer and download
  XLSX.writeFile(workbook, fileName);
};
