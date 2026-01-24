import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../../sales/orders/entities/order.entity';
import { PurchaseOrder, PurchaseOrderStatus } from '../../procurement/purchase-orders/entities/purchase-order.entity';
import { StockAdjustment } from '../adjustments/entities/stock-adjustment.entity';

export interface LedgerItem {
    id: string;
    type: 'SALE' | 'PURCHASE' | 'ADJUSTMENT';
    reference: string;
    productName: string;
    quantity: number;
    previousStock?: number;
    newStock?: number;
    date: Date;
    performedBy: string;
    reason: string;
}

@Injectable()
export class LedgerService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(PurchaseOrder)
        private poRepository: Repository<PurchaseOrder>,
        @InjectRepository(StockAdjustment)
        private adjustmentsRepository: Repository<StockAdjustment>,
    ) { }

    async getFullLedger(): Promise<LedgerItem[]> {
        const adjustments = await this.adjustmentsRepository.find({
            relations: ['product'],
            order: { createdAt: 'DESC' }
        });

        const orders = await this.ordersRepository.find({
            where: { status: OrderStatus.COMPLETED },
            relations: ['items', 'items.product'],
            order: { createdAt: 'DESC' }
        });

        const purchaseOrders = await this.poRepository.find({
            where: { status: PurchaseOrderStatus.RECEIVED },
            relations: ['items', 'items.product'],
            order: { createdAt: 'DESC' }
        });

        const ledgerItems: LedgerItem[] = [];

        // Map adjustments
        adjustments.forEach(adj => {
            ledgerItems.push({
                id: adj.id,
                type: 'ADJUSTMENT',
                reference: `ADJ-${adj.id.slice(0, 8)}`,
                productName: adj.product?.name || 'N/A',
                quantity: Number(adj.type === 'subtraction' ? -adj.changeAmount : adj.changeAmount),
                previousStock: Number(adj.previousStock),
                newStock: Number(adj.newStock),
                date: adj.createdAt,
                performedBy: adj.performedBy || 'System',
                reason: adj.reason
            });
        });

        // Map sales
        orders.forEach(order => {
            order.items?.forEach(item => {
                ledgerItems.push({
                    id: `${order.id}-${item.id}`,
                    type: 'SALE',
                    reference: order.orderNumber,
                    productName: item.product?.name || 'N/A',
                    quantity: -Number(item.quantity),
                    date: order.createdAt,
                    performedBy: 'Sales System',
                    reason: 'Customer Sale'
                });
            });
        });

        // Map purchases
        purchaseOrders.forEach(po => {
            po.items?.forEach(item => {
                ledgerItems.push({
                    id: `${po.id}-${item.id}`,
                    type: 'PURCHASE',
                    reference: po.poNumber,
                    productName: item.product?.name || 'N/A',
                    quantity: Number(item.quantity),
                    date: po.createdAt,
                    performedBy: 'Procurement System',
                    reason: 'Supplier Restock'
                });
            });
        });

        return ledgerItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
}
