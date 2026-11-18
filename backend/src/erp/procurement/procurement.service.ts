import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface PurchaseOrderItem {
  id: string;
  poNumber: string;
  vendorName: string;
  totalAmount: number;
  currency: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  orderDate: string;
  expectedDelivery: string;
  lineItemsCount: number;
}

@Injectable()
export class ProcurementService {
  constructor(private readonly prisma: PrismaService) {}

  private purchaseOrders: PurchaseOrderItem[] = [
    {
      id: 'po-1',
      poNumber: 'PO-2026-0881',
      vendorName: 'Apex Raw Materials Ltd',
      totalAmount: 18450,
      currency: 'USD',
      status: 'APPROVED',
      orderDate: new Date().toISOString(),
      expectedDelivery: new Date(Date.now() + 7 * 86400000).toISOString(),
      lineItemsCount: 12,
    },
    {
      id: 'po-2',
      poNumber: 'PO-2026-0882',
      vendorName: 'Global Micro Components Inc',
      totalAmount: 42900,
      currency: 'USD',
      status: 'SUBMITTED',
      orderDate: new Date().toISOString(),
      expectedDelivery: new Date(Date.now() + 14 * 86400000).toISOString(),
      lineItemsCount: 8,
    },
  ];

  async findAll() {
    return {
      data: this.purchaseOrders,
      meta: { total: this.purchaseOrders.length },
    };
  }

  async findOne(id: string) {
    const item = this.purchaseOrders.find((p) => p.id === id || p.poNumber === id);
    if (!item) {
      throw new NotFoundException(`Purchase Order ${id} not found`);
    }
    return item;
  }

  async create(data: Partial<PurchaseOrderItem>) {
    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPo: PurchaseOrderItem = {
      id: `po-${Date.now()}`,
      poNumber,
      vendorName: data.vendorName || 'General Vendor',
      totalAmount: data.totalAmount || 0,
      currency: data.currency || 'USD',
      status: 'DRAFT',
      orderDate: new Date().toISOString(),
      expectedDelivery: data.expectedDelivery || new Date(Date.now() + 7 * 86400000).toISOString(),
      lineItemsCount: data.lineItemsCount || 1,
    };
    this.purchaseOrders.unshift(newPo);
    return newPo;
  }

  async getVendors() {
    return [
      { id: 'v-1', name: 'Apex Raw Materials Ltd', rating: 4.8, activeContracts: 3 },
      { id: 'v-2', name: 'Global Micro Components Inc', rating: 4.9, activeContracts: 5 },
      { id: 'v-3', name: 'Delta Packaging Solutions', rating: 4.6, activeContracts: 2 },
    ];
  }
}
