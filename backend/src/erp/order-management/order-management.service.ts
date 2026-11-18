import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface ErpSalesOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  orderTotal: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'FULFILLED' | 'CANCELLED';
  orderDate: string;
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL';
  lineItemsCount: number;
}

@Injectable()
export class OrderManagementService {
  constructor(private readonly prisma: PrismaService) {}

  private orders: ErpSalesOrderItem[] = [
    {
      id: 'ord-1',
      orderNumber: 'SO-2026-9001',
      customerName: 'Acme Enterprise Corp',
      orderTotal: 78500,
      status: 'PROCESSING',
      orderDate: new Date().toISOString(),
      paymentStatus: 'PAID',
      lineItemsCount: 6,
    },
    {
      id: 'ord-2',
      orderNumber: 'SO-2026-9002',
      customerName: 'Starlight Retailers',
      orderTotal: 12400,
      status: 'CONFIRMED',
      orderDate: new Date().toISOString(),
      paymentStatus: 'PAID',
      lineItemsCount: 3,
    },
  ];

  async findAll() {
    return {
      data: this.orders,
      meta: { total: this.orders.length },
    };
  }

  async findOne(id: string) {
    const item = this.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!item) {
      throw new NotFoundException(`Sales Order ${id} not found`);
    }
    return item;
  }

  async create(data: Partial<ErpSalesOrderItem>) {
    const orderNumber = `SO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: ErpSalesOrderItem = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: data.customerName || 'Anonymous Customer',
      orderTotal: data.orderTotal || 0,
      status: 'CONFIRMED',
      orderDate: new Date().toISOString(),
      paymentStatus: data.paymentStatus || 'UNPAID',
      lineItemsCount: data.lineItemsCount || 1,
    };
    this.orders.unshift(newOrder);
    return newOrder;
  }

  async updateStatus(id: string, status: ErpSalesOrderItem['status']) {
    const item = await this.findOne(id);
    item.status = status;
    return item;
  }
}
