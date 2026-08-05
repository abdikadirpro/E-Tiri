import PDFDocument from "pdfkit";
import { Response } from "express";
import { Prisma } from "@prisma/client";

interface ReceiptSale {
  saleNumber: number;
  createdAt: Date;
  subtotal: Prisma.Decimal | number;
  discount: Prisma.Decimal | number;
  vatAmount: Prisma.Decimal | number;
  total: Prisma.Decimal | number;
  amountPaid: Prisma.Decimal | number;
  paymentStatus: string;
  customer: { name: string } | null;
  items: { product: { name: string }; quantity: number; unitPrice: Prisma.Decimal | number; lineTotal: Prisma.Decimal | number }[];
}

export function streamReceipt(res: Response, business: { name: string; currency: string }, sale: ReceiptSale) {
  const doc = new PDFDocument({ size: [226, 500], margin: 12 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="receipt-${sale.saleNumber}.pdf"`);
  doc.pipe(res);

  doc.fontSize(14).text(business.name, { align: "center" });
  doc.fontSize(9).text(new Date(sale.createdAt).toLocaleString(), { align: "center" });
  doc.moveDown(0.5);
  doc.text(`Receipt #${sale.saleNumber}`, { align: "center" });
  if (sale.customer) doc.text(`Customer: ${sale.customer.name}`, { align: "center" });
  doc.moveDown(0.5);
  doc.text("-".repeat(38));

  sale.items.forEach((item) => {
    doc.text(`${item.product.name}`);
    doc.text(`  ${item.quantity} x ${Number(item.unitPrice).toFixed(2)} = ${Number(item.lineTotal).toFixed(2)}`);
  });

  doc.text("-".repeat(38));
  doc.text(`Subtotal: ${Number(sale.subtotal).toFixed(2)} ${business.currency}`);
  if (Number(sale.discount) > 0) doc.text(`Discount: -${Number(sale.discount).toFixed(2)}`);
  if (Number(sale.vatAmount) > 0) doc.text(`VAT: +${Number(sale.vatAmount).toFixed(2)}`);
  doc.fontSize(11).text(`Total: ${Number(sale.total).toFixed(2)} ${business.currency}`);
  doc.fontSize(9).text(`Paid: ${Number(sale.amountPaid).toFixed(2)}`);
  if (sale.paymentStatus !== "PAID") {
    doc.text(`Balance: ${(Number(sale.total) - Number(sale.amountPaid)).toFixed(2)} (${sale.paymentStatus})`);
  }
  doc.moveDown(1);
  doc.fontSize(9).text("Mahadsanid!", { align: "center" });

  doc.end();
}
