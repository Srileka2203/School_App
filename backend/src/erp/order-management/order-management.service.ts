import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface ErpSalesOrderItem {
  id?: string;
  orderNumber?: string;
  customerName: string;
  customerId?: string;
  orderTotal?: number;
  currency?: string;
  status?: string;
  paymentStatus?: string;
  orderDate?: Date | string;
  lineItemsCount?: number;
  shippingAddress?: string;
  billingAddress?: string;
  workspaceId?: string;
}

@Injectable()
export class OrderManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    const [data, total] = await Promise.all([
      this.prisma.erpSalesOrder.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: { orderDate: 'desc' },
      }),
      this.prisma.erpSalesOrder.count({ where }),
    ]);

    return {
      data,
      meta: { total },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.erpSalesOrder.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Sales Order ${id} not found`);
    }
    return item;
  }

  async create(data: Partial<ErpSalesOrderItem>) {
    const orderNumber =
      data.orderNumber ||
      `SO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.erpSalesOrder.create({
      data: {
        orderNumber,
        customerName: data.customerName || 'Anonymous Customer',
        customerId: data.customerId,
        orderTotal: data.orderTotal ? Number(data.orderTotal) : 0,
        currency: data.currency || 'USD',
        status: data.status || 'CONFIRMED',
        paymentStatus: data.paymentStatus || 'UNPAID',
        orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
        lineItemsCount: data.lineItemsCount ? Number(data.lineItemsCount) : 1,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        workspaceId: data.workspaceId,
      },
      include: {
        items: true,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const item = await this.findOne(id);
    return this.prisma.erpSalesOrder.update({
      where: { id: item.id },
      data: { status },
      include: { items: true },
    });
  }
}
