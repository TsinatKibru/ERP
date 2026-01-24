import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { Product } from '../../inventory/products/entities/product.entity';

@Injectable()
export class PurchaseOrdersService {
    constructor(
        @InjectRepository(PurchaseOrder)
        private poRepository: Repository<PurchaseOrder>,
        @InjectRepository(PurchaseOrderItem)
        private poiRepository: Repository<PurchaseOrderItem>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    async findAll(): Promise<PurchaseOrder[]> {
        return this.poRepository.find({
            relations: ['supplier', 'items'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<PurchaseOrder> {
        const po = await this.poRepository.findOne({
            where: { id },
            relations: ['supplier', 'items'],
        });
        if (!po) throw new NotFoundException(`Purchase Order with ID ${id} not found`);
        return po;
    }

    async create(data: { supplierId: string; items: { productId: string; quantity: number; unitPrice: number }[] }): Promise<PurchaseOrder> {
        const po = new PurchaseOrder();
        po.poNumber = `PO-${Date.now()}`;
        po.status = PurchaseOrderStatus.PENDING;
        po.supplier = { id: data.supplierId } as any;

        const savedPo = await this.poRepository.save(po);

        let total = 0;
        const poItems: PurchaseOrderItem[] = [];

        for (const item of data.items) {
            const product = await this.productsRepository.findOne({ where: { id: item.productId } });
            if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

            const poItem = new PurchaseOrderItem();
            poItem.purchaseOrder = savedPo;
            poItem.product = product;
            poItem.quantity = item.quantity;
            poItem.unitPrice = item.unitPrice;

            total += Number(item.unitPrice) * item.quantity;
            poItems.push(poItem);
        }

        await this.poiRepository.save(poItems);

        savedPo.totalAmount = total;
        return this.poRepository.save(savedPo);
    }

    async updateStatus(id: string, status: PurchaseOrderStatus): Promise<PurchaseOrder> {
        const po = await this.findOne(id);

        if (po.status === status) return po;
        if (po.status === PurchaseOrderStatus.RECEIVED) {
            throw new BadRequestException('Cannot change status of a received Purchase Order');
        }

        // If marking as RECEIVED, replenish stock
        if (status === PurchaseOrderStatus.RECEIVED) {
            for (const item of po.items) {
                const product = await this.productsRepository.findOne({ where: { id: item.product.id } });
                if (product) {
                    product.stockLevel += item.quantity;
                    await this.productsRepository.save(product);
                }
            }
        }

        po.status = status;
        return this.poRepository.save(po);
    }

    async remove(id: string): Promise<void> {
        const po = await this.findOne(id);
        if (po.status === PurchaseOrderStatus.RECEIVED) {
            throw new BadRequestException('Cannot delete a received Purchase Order');
        }
        await this.poRepository.delete(id);
    }
}
