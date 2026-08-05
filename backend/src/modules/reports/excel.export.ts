import ExcelJS from "exceljs";
import { Response } from "express";
import { ReportData } from "./reports.service";

export async function streamExcel(res: Response, report: ReportData) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(report.title.slice(0, 31));

  sheet.addRow([report.title]).font = { bold: true, size: 14 };
  sheet.addRow([]);

  const headerRow = sheet.addRow(report.columns);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
  });

  report.rows.forEach((row) => sheet.addRow(row));

  sheet.addRow([]);
  report.summary.forEach((s) => {
    const row = sheet.addRow([s.label, s.value]);
    row.font = { bold: true };
  });

  sheet.columns.forEach((col) => {
    col.width = 20;
  });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${report.title.replace(/\s+/g, "-").toLowerCase()}.xlsx"`);

  await workbook.xlsx.write(res);
  res.end();
}
