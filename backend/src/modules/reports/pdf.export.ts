import PDFDocument from "pdfkit";
import { Response } from "express";
import { ReportData } from "./reports.service";

const PAGE_MARGIN = 40;

export function streamReportPdf(res: Response, report: ReportData, businessName: string) {
  const doc = new PDFDocument({ margin: PAGE_MARGIN, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${report.title.replace(/\s+/g, "-").toLowerCase()}.pdf"`);
  doc.pipe(res);

  drawHeader(doc, report.title, businessName);
  drawTable(doc, report.columns, report.rows);
  drawSummary(doc, report.summary);

  doc.end();
}

function drawHeader(doc: PDFKit.PDFDocument, title: string, businessName: string) {
  doc.fontSize(18).text(businessName, { align: "left" });
  doc.fontSize(14).text(title, { align: "left" });
  doc.fontSize(9).fillColor("#666").text(new Date().toLocaleString(), { align: "left" });
  doc.fillColor("#000");
  doc.moveDown(1);
}

function drawTable(doc: PDFKit.PDFDocument, columns: string[], rows: (string | number)[][]) {
  const startX = doc.x;
  const usableWidth = doc.page.width - PAGE_MARGIN * 2;
  const colWidth = usableWidth / columns.length;

  function drawRow(values: (string | number)[], bold = false) {
    const y = doc.y;
    doc.fontSize(9).font(bold ? "Helvetica-Bold" : "Helvetica");
    values.forEach((value, i) => {
      doc.text(String(value), startX + i * colWidth, y, { width: colWidth - 4 });
    });
    doc.moveDown(0.6);
    if (doc.y > doc.page.height - PAGE_MARGIN - 60) {
      doc.addPage();
    }
  }

  drawRow(columns, true);
  doc.moveTo(startX, doc.y).lineTo(startX + usableWidth, doc.y).strokeColor("#ccc").stroke();
  doc.moveDown(0.3);

  rows.forEach((row) => drawRow(row));
}

function drawSummary(doc: PDFKit.PDFDocument, summary: { label: string; value: string | number }[]) {
  if (!summary.length) return;
  doc.moveDown(0.5);
  doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - PAGE_MARGIN, doc.y).strokeColor("#ccc").stroke();
  doc.moveDown(0.5);
  summary.forEach((s) => {
    doc.fontSize(11).font("Helvetica-Bold").text(`${s.label}: ${s.value}`);
  });
}
