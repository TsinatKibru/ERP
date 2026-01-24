import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentType } from './entities/payment.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { PurchaseOrder, PurchaseOrderStatus } from '../../procurement/purchase-orders/entities/purchase-order.entity';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private paymentsRepository: Repository<Payment>,
        @InjectRepository(Invoice)
        private invoicesRepository: Repository<Invoice>,
        @InjectRepository(PurchaseOrder)
        private poRepository: Repository<PurchaseOrder>,
    ) { }

    async findAll(): Promise<Payment[]> {
        return this.paymentsRepository.find({
            relations: ['invoice', 'purchaseOrder'],
            order: { createdAt: 'DESC' },
        });
    }

    async recordInvoicePayment(id: string, data: { amount: number, method: string, reference?: string }): Promise<Payment> {
        const invoice = await this.invoicesRepository.findOne({ where: { id } });
        if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);

        const payment = this.paymentsRepository.create({
            ...data,
            paymentType: PaymentType.INBOUND,
            invoice: invoice,
        });

        const savedPayment = await this.paymentsRepository.save(payment);

        // Simple logic: if payment amount matches invoice, mark as PAID
        // In a real app, you'd track balance.
        if (Number(data.amount) >= Number(invoice.amount)) {
            await this.invoicesRepository.update(id, { status: InvoiceStatus.PAID });
        }

        return savedPayment;
    }

    async recordPOPayment(id: string, data: { amount: number, method: string, reference?: string }): Promise<Payment> {
        const po = await this.poRepository.findOne({ where: { id } });
        if (!po) throw new NotFoundException(`Purchase Order ${id} not found`);

        const payment = this.paymentsRepository.create({
            ...data,
            paymentType: PaymentType.OUTBOUND,
            purchaseOrder: po,
        });

        return this.paymentsRepository.save(payment);
    }
}
