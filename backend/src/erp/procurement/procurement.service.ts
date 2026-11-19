import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface PurchaseOrderItem {
  id?: string;
  poNumber?: string;
  vendorName: string;
  vendorId?: string;
  totalAmount?: number;
  currency?: string;
  status?: string;
  orderDate?: Date | string;
  expectedDelivery?: Date | string;
  lineItemsCount?: number;
  notes?: string;
  workspaceId?: string;
}

@Injectable()
export class ProcurementService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: {
          vendor: true,
          items: true,
        },
        orderBy: { orderDate: 'desc' },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return {
      data,
      meta: { total },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.purchaseOrder.findFirst({
      where: {
        OR: [{ id }, { poNumber: id }],
      },
      include: {
        vendor: true,
        items: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Purchase Order ${id} not found`);
    }
    return item;
  }

  async create(data: Partial<PurchaseOrderItem>) {
    const poNumber =
      data.poNumber ||
      `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorName: data.vendorName || 'General Vendor',
        vendorId: data.vendorId,
        totalAmount: data.totalAmount ? Number(data.totalAmount) : 0,
        currency: data.currency || 'USD',
        status: data.status || 'DRAFT',
        orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
        expectedDelivery: data.expectedDelivery
          ? new Date(data.expectedDelivery)
          : new Date(Date.now() + 7 * 86400000),
        lineItemsCount: data.lineItemsCount ? Number(data.lineItemsCount) : 1,
        notes: data.notes,
        workspaceId: data.workspaceId,
      },
      include: {
        vendor: true,
        items: true,
      },
    });
  }

  async updateOrder(id: string, data: any) {
    const order = await this.findOne(id);
    return this.prisma.purchaseOrder.update({
      where: { id: order.id },
      data: {
        ...(data.vendorName !== undefined && { vendorName: data.vendorName }),
        ...(data.vendorId !== undefined && { vendorId: data.vendorId }),
        ...(data.totalAmount !== undefined && { totalAmount: Number(data.totalAmount) }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.expectedDelivery !== undefined && { expectedDelivery: new Date(data.expectedDelivery) }),
        ...(data.lineItemsCount !== undefined && { lineItemsCount: Number(data.lineItemsCount) }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        vendor: true,
        items: true,
      },
    });
  }

  async removeOrder(id: string) {
    const order = await this.findOne(id);
    await this.prisma.purchaseOrder.delete({
      where: { id: order.id },
    });
    return { message: `Purchase Order ${order.poNumber} successfully removed` };
  }

  async addOrderItem(orderId: string, item: any) {
    const order = await this.findOne(orderId);
    const quantity = item.quantity ? Number(item.quantity) : 1;
    const unitPrice = item.unitPrice ? Number(item.unitPrice) : 0;
    const totalPrice = item.totalPrice ? Number(item.totalPrice) : quantity * unitPrice;

    const createdItem = await this.prisma.purchaseOrderItem.create({
      data: {
        purchaseOrderId: order.id,
        itemName: item.itemName || 'Material Item',
        sku: item.sku,
        quantity,
        unitPrice,
        totalPrice,
      },
    });

    // Update PO totals
    await this.prisma.purchaseOrder.update({
      where: { id: order.id },
      data: {
        totalAmount: { increment: totalPrice },
        lineItemsCount: { increment: 1 },
      },
    });

    return createdItem;
  }

  // --- VENDORS ---
  async getVendors(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    let [data, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        include: {
          purchaseOrders: {
            take: 5,
            orderBy: { orderDate: 'desc' },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.vendor.count({ where }),
    ]);

    if (total === 0) {
      await this.seedDefaultVendors(workspaceId);
      [data, total] = await Promise.all([
        this.prisma.vendor.findMany({
          where,
          include: {
            purchaseOrders: {
              take: 5,
              orderBy: { orderDate: 'desc' },
            },
          },
          orderBy: { name: 'asc' },
        }),
        this.prisma.vendor.count({ where }),
      ]);
    }

    return {
      data,
      meta: { total },
    };
  }

  async getVendor(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          orderBy: { orderDate: 'desc' },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    return vendor;
  }

  async createVendor(data: any) {
    return this.prisma.vendor.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        rating: data.rating ? Number(data.rating) : 5.0,
        activeContracts: data.activeContracts ? Number(data.activeContracts) : 1,
        status: data.status || 'ACTIVE',
        workspaceId: data.workspaceId,
      },
    });
  }

  async updateVendor(id: string, data: any) {
    await this.getVendor(id);
    return this.prisma.vendor.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.rating !== undefined && { rating: Number(data.rating) }),
        ...(data.activeContracts !== undefined && { activeContracts: Number(data.activeContracts) }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });
  }

  async removeVendor(id: string) {
    await this.getVendor(id);
    await this.prisma.vendor.delete({
      where: { id },
    });
    return { message: `Vendor ${id} successfully removed` };
  }

  async seedDefaultVendors(workspaceId?: string) {
    const defaults = [
      { name: 'Apex Raw Materials Ltd', rating: 4.8, activeContracts: 3, email: 'sales@apexraw.com', status: 'ACTIVE', workspaceId },
      { name: 'Global Micro Components Inc', rating: 4.9, activeContracts: 5, email: 'contact@globalmicro.io', status: 'ACTIVE', workspaceId },
      { name: 'Delta Packaging Solutions', rating: 4.6, activeContracts: 2, email: 'support@deltapack.com', status: 'ACTIVE', workspaceId },
    ];
    for (const d of defaults) {
      await this.prisma.vendor.create({ data: d });
    }
  }
}
