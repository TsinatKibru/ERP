import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Invoice } from '../finance/invoices/entities/invoice.entity';
import { PurchaseOrder } from '../procurement/purchase-orders/entities/purchase-order.entity';
import { Payroll } from '../hr/entities/payroll.entity';
import { Customer } from '../sales/customers/entities/customer.entity';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class ReportingService {
    constructor(private readonly settingsService: SettingsService) { }

    private hr(doc: any, y: number) {
        doc.moveTo(50, y).lineTo(550, y).stroke();
    }

    async generateInvoicePDF(invoice: Invoice): Promise<Buffer> {
        const companyName = await this.settingsService.getVal('company_name', 'Your ERP System');
        const companyAddress = await this.settingsService.getVal('company_address', '123 Business Road');
        const companyContact = await this.settingsService.getVal('company_email', 'City, Country');

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
                .text(companyName, 200, 50, { align: 'right' })
                .text(companyAddress, 200, 65, { align: 'right' })
                .text(companyContact, 200, 80, { align: 'right' })
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
        const companyName = await this.settingsService.getVal('company_name', 'Your ERP System');
        const companyAddress = await this.settingsService.getVal('company_address', '123 Business Road');
        const companyContact = await this.settingsService.getVal('company_email', 'City, Country');

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
                .text(companyName, 200, 50, { align: 'right' })
                .text(companyAddress, 200, 65, { align: 'right' })
                .text(companyContact, 200, 80, { align: 'right' })
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

    async generatePayslipPDF(payroll: Payroll): Promise<Buffer> {
        const companyName = await this.settingsService.getVal('company_name', 'Your ERP System');
        const companyAddress = await this.settingsService.getVal('company_address', '123 Business Road');
        const companyContact = await this.settingsService.getVal('company_email', 'City, Country');

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
                .text('PAYSLIP', 50, 50)
                .fontSize(10)
                .text(companyName, 200, 50, { align: 'right' })
                .text(companyAddress, 200, 65, { align: 'right' })
                .text(companyContact, 200, 80, { align: 'right' })
                .moveDown();

            this.hr(doc, 100);

            // Employee & Period Details
            doc
                .fontSize(10)
                .fillColor('#000000')
                .text(`Employee: ${payroll.employee.name}`, 50, 120)
                .text(`Employee ID: ${payroll.employee.id.slice(0, 8)}`, 50, 135)
                .text(`Job Title: ${payroll.employee.jobTitle || 'N/A'}`, 50, 150)
                .text(`Period: ${payroll.period}`, 300, 120, { align: 'right' })
                .text(`Date Issued: ${new Date().toLocaleDateString()}`, 300, 135, { align: 'right' })
                .text(`Status: ${payroll.status.toUpperCase()}`, 300, 150, { align: 'right' })
                .moveDown();

            this.hr(doc, 175);

            // Earnings Table
            doc
                .fontSize(12)
                .text('Earnings', 50, 200)
                .fontSize(10)
                .text('Description', 50, 220)
                .text('Amount', 400, 220, { align: 'right' });

            this.hr(doc, 235);

            doc
                .text('Base Salary (Monthly)', 50, 250)
                .text(`$${Number(payroll.baseSalary).toFixed(2)}`, 400, 250, { align: 'right' })
                .text('Bonuses', 50, 275)
                .text(`$${Number(payroll.bonuses).toFixed(2)}`, 400, 275, { align: 'right' });

            const earningsTotal = Number(payroll.baseSalary) + Number(payroll.bonuses);
            doc
                .font('Helvetica-Bold')
                .text('Total Earnings', 50, 305)
                .text(`$${earningsTotal.toFixed(2)}`, 400, 305, { align: 'right' });

            this.hr(doc, 330);

            // Deductions Table
            doc
                .fontSize(12)
                .text('Deductions', 50, 350)
                .fontSize(10)
                .text('Description', 50, 370)
                .text('Amount', 400, 370, { align: 'right' });

            this.hr(doc, 385);

            doc
                .text(`Attendance Deduction (${payroll.absentDays} days absent)`, 50, 400)
                .text(`$${Number(payroll.attendanceDeduction).toFixed(2)}`, 400, 400, { align: 'right' })
                .text('Other Deductions', 50, 425)
                .text(`$${Number(payroll.deductions).toFixed(2)}`, 400, 425, { align: 'right' });

            const deductionsTotal = Number(payroll.attendanceDeduction) + Number(payroll.deductions);
            doc
                .text('Total Deductions', 50, 455)
                .text(`$${deductionsTotal.toFixed(2)}`, 400, 455, { align: 'right' });

            this.hr(doc, 480);

            // Net Pay
            doc
                .fontSize(14)
                .fillColor('#000000')
                .text(`NET PAY: $${Number(payroll.netSalary).toFixed(2)}`, 300, 520, { width: 230, align: 'right' });

            doc
                .fontSize(8)
                .fillColor('#888888')
                .text('This is an automatically generated document and does not require a signature.', 0, 700, { align: 'center' });

            doc.end();
        });
    }

    async generateCustomerStatementPDF(customer: Customer, invoices: Invoice[]): Promise<Buffer> {
        const companyName = await this.settingsService.getVal('company_name', 'Your ERP System');
        const companyAddress = await this.settingsService.getVal('company_address', '123 Business Road');
        const companyContact = await this.settingsService.getVal('company_email', 'City, Country');

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
                .text('CUSTOMER STATEMENT', 50, 50)
                .fontSize(10)
                .text(companyName, 200, 50, { align: 'right' })
                .text(companyAddress, 200, 65, { align: 'right' })
                .text(companyContact, 200, 80, { align: 'right' })
                .moveDown();

            this.hr(doc, 100);

            // Customer Details
            doc
                .fontSize(10)
                .fillColor('#000000')
                .text(`Customer Name: ${customer.name}`, 50, 120)
                .text(`Customer Email: ${customer.email || 'N/A'}`, 50, 135)
                .text(`Statement Date: ${new Date().toLocaleDateString()}`, 300, 120, { align: 'right' })
                .moveDown();

            this.hr(doc, 160);

            // Statement Summary Table
            doc
                .fontSize(10)
                .text('Date', 50, 180)
                .text('Invoice #', 150, 180)
                .text('Total Amount', 300, 180, { width: 100, align: 'right' })
                .text('Status', 450, 180, { align: 'right' });

            this.hr(doc, 195);

            let y = 205;
            let totalBilled = 0;
            let totalUnpaid = 0;

            invoices.forEach(invoice => {
                const amount = Number(invoice.amount);
                totalBilled += amount;
                if (invoice.status === 'unpaid') totalUnpaid += amount;

                doc
                    .text(new Date(invoice.createdAt).toLocaleDateString(), 50, y)
                    .text(invoice.invoiceNumber, 150, y)
                    .text(`$${amount.toFixed(2)}`, 300, y, { width: 100, align: 'right' })
                    .text(invoice.status.toUpperCase(), 450, y, { align: 'right' });
                y += 20;

                // Simple pagination
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }
            });

            this.hr(doc, y + 10);

            const summaryY = y + 30;
            doc
                .fontSize(12)
                .text(`Total Billed: $${totalBilled.toFixed(2)}`, 300, summaryY, { width: 230, align: 'right' })
                .fillColor('#cf1322')
                .text(`Total Outstanding: $${totalUnpaid.toFixed(2)}`, 300, summaryY + 20, { width: 230, align: 'right' });

            doc.end();
        });
    }
}
