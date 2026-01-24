import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Invoice } from '../finance/invoices/entities/invoice.entity';
import { PurchaseOrder } from '../procurement/purchase-orders/entities/purchase-order.entity';

@Injectable()
export class ReportingService {
    private hr(doc: any, y: number) {
        doc.moveTo(50, y).lineTo(550, y).stroke();
    }

    async generateInvoicePDF(invoice: Invoice): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc
                .fillColor('#444444')
                .fontSize(20)
                .text('INVOICE', 50, 50)
                .fontSize(10)
                .text('Your ERP System', 200, 50, { align: 'right' })
                .text('123 Business Road', 200, 65, { align: 'right' })
                .text('City, Country', 200, 80, { align: 'right' })
                .moveDown();

            this.hr(doc, 100);

            // Invoice Details
            doc
                .fontSize(10)
                .fillColor('#000000')
                .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 120)
                .text(`Invoice Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 50, 135)
                .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 150)
                .text(`Status: ${invoice.status.toUpperCase()}`, 50, 165)
                .text(`Customer: ${invoice.order.customer.name}`, 300, 120, { align: 'right' })
                .moveDown();

            this.hr(doc, 185);

            // Table Header
            const tableTop = 210;
            doc
                .fontSize(10)
                .text('Product', 50, tableTop)
                .text('Quantity', 250, tableTop, { width: 90, align: 'right' })
                .text('Unit Price', 340, tableTop, { width: 90, align: 'right' })
                .text('Subtotal', 430, tableTop, { width: 90, align: 'right' });

            this.hr(doc, 225);

            // Table Items
            let i = 0;
            invoice.order.items.forEach((item) => {
                const y = tableTop + 25 + i * 25;
                doc
                    .text(item.product.name, 50, y)
                    .text(item.quantity.toString(), 250, y, { width: 90, align: 'right' })
                    .text(`$${Number(item.unitPrice).toFixed(2)}`, 340, y, { width: 90, align: 'right' })
                    .text(`$${(item.quantity * item.unitPrice).toFixed(2)}`, 430, y, { width: 90, align: 'right' });
                i++;
            });

            const totalY = tableTop + 25 + i * 25 + 25;
            this.hr(doc, totalY - 10);
            doc
                .fontSize(12)
                .text(`Total Amount: $${Number(invoice.amount).toFixed(2)}`, 340, totalY, { width: 180, align: 'right' });

            doc.end();
        });
    }

    async generatePOPDF(po: PurchaseOrder): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc
                .fillColor('#444444')
                .fontSize(20)
                .text('PURCHASE ORDER', 50, 50)
                .fontSize(10)
                .text('Your ERP System', 200, 50, { align: 'right' })
                .text('123 Business Road', 200, 65, { align: 'right' })
                .text('City, Country', 200, 80, { align: 'right' })
                .moveDown();

            this.hr(doc, 100);

            // PO Details
            doc
                .fontSize(10)
                .fillColor('#000000')
                .text(`PO Number: ${po.poNumber}`, 50, 120)
                .text(`PO Date: ${new Date(po.createdAt).toLocaleDateString()}`, 50, 135)
                .text(`Status: ${po.status.toUpperCase()}`, 50, 150)
                .text(`Supplier: ${po.supplier.name}`, 300, 120, { align: 'right' })
                .moveDown();

            this.hr(doc, 170);

            // Table Header
            const tableTop = 200;
            doc
                .fontSize(10)
                .text('Product', 50, tableTop)
                .text('Quantity', 250, tableTop, { width: 90, align: 'right' })
                .text('Cost Price', 340, tableTop, { width: 90, align: 'right' })
                .text('Subtotal', 430, tableTop, { width: 90, align: 'right' });

            this.hr(doc, 215);

            // Table Items
            let i = 0;
            po.items.forEach((item) => {
                const y = tableTop + 25 + i * 25;
                doc
                    .text(item.product.name, 50, y)
                    .text(item.quantity.toString(), 250, y, { width: 90, align: 'right' })
                    .text(`$${Number(item.unitPrice).toFixed(2)}`, 340, y, { width: 90, align: 'right' })
                    .text(`$${(item.quantity * item.unitPrice).toFixed(2)}`, 430, y, { width: 90, align: 'right' });
                i++;
            });

            const totalY = tableTop + 25 + i * 25 + 25;
            this.hr(doc, totalY - 10);
            doc
                .fontSize(12)
                .text(`Total Estimate: $${Number(po.totalAmount).toFixed(2)}`, 340, totalY, { width: 180, align: 'right' });

            doc.end();
        });
    }
}
