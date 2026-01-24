import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { Order } from '../../sales/orders/entities/order.entity';

@Injectable()
export class InvoicesService {
    constructor(
        @InjectRepository(Invoice)
        private invoicesRepository: Repository<Invoice>,
    ) { }

    async findAll(): Promise<Invoice[]> {
        return this.invoicesRepository.find({
            relations: ['order', 'order.customer'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Invoice> {
        const invoice = await this.invoicesRepository.findOne({
            where: { id },
            relations: ['order', 'order.customer', 'order.items', 'order.items.product'],
        });
        if (!invoice) throw new NotFoundException(`Invoice with ID ${id} not found`);
        return invoice;
    }

    async createFromOrder(order: Order): Promise<Invoice> {
        const invoice = new Invoice();
        invoice.invoiceNumber = `INV-${order.orderNumber.split('-')[1] || Date.now()}`;
        invoice.amount = order.totalAmount;
        invoice.order = order;
        invoice.status = InvoiceStatus.UNPAID;

        // Default due date: 30 days from now
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        invoice.dueDate = dueDate;

        return this.invoicesRepository.save(invoice);
    }

    async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
        await this.invoicesRepository.update(id, { status });
        return this.findOne(id);
    }
}
