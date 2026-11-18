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
          lineItems: true,
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
        lineItems: true,
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
        lineItems: true,
      },
    });
  }

  async getVendors(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    return this.prisma.vendor.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }
}
