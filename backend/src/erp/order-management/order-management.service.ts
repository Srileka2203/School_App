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

  async updateOrder(id: string, data: any) {
    const item = await this.findOne(id);
    return this.prisma.erpSalesOrder.update({
      where: { id: item.id },
      data: {
        ...(data.customerName !== undefined && { customerName: data.customerName }),
        ...(data.customerId !== undefined && { customerId: data.customerId }),
        ...(data.orderTotal !== undefined && { orderTotal: Number(data.orderTotal) }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.paymentStatus !== undefined && { paymentStatus: data.paymentStatus }),
        ...(data.shippingAddress !== undefined && { shippingAddress: data.shippingAddress }),
        ...(data.billingAddress !== undefined && { billingAddress: data.billingAddress }),
      },
      include: { items: true },
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

  async removeOrder(id: string) {
    const item = await this.findOne(id);
    await this.prisma.erpSalesOrder.delete({
      where: { id: item.id },
    });
    return { message: `Sales Order ${item.orderNumber} successfully removed` };
  }

  async addOrderItem(orderId: string, item: any) {
    const order = await this.findOne(orderId);
    const quantity = item.quantity ? Number(item.quantity) : 1;
    const unitPrice = item.unitPrice ? Number(item.unitPrice) : 0;
    const totalPrice = item.totalPrice ? Number(item.totalPrice) : quantity * unitPrice;

    const createdItem = await this.prisma.erpSalesOrderItem.create({
      data: {
        salesOrderId: order.id,
        productName: item.productName || 'Order Product Item',
        sku: item.sku,
        quantity,
        unitPrice,
        totalPrice,
      },
    });

    // Update Order totals
    await this.prisma.erpSalesOrder.update({
      where: { id: order.id },
      data: {
        orderTotal: { increment: totalPrice },
        lineItemsCount: { increment: 1 },
      },
    });

    return createdItem;
  }

  async recordPayment(id: string, paymentStatus: string) {
    const item = await this.findOne(id);
    return this.prisma.erpSalesOrder.update({
      where: { id: item.id },
      data: { paymentStatus },
      include: { items: true },
    });
  }
}
