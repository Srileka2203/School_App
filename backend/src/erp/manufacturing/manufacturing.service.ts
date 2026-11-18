import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface WorkOrderItem {
  id: string;
  orderNumber: string;
  productName: string;
  quantityTarget: number;
  quantityCompleted: number;
  status: 'SCHEDULED' | 'IN_PRODUCTION' | 'QUALITY_REVIEW' | 'COMPLETED' | 'HALTED';
  startDate: string;
  dueDate: string;
  productionLine: string;
}

@Injectable()
export class ManufacturingService {
  constructor(private readonly prisma: PrismaService) {}

  private workOrders: WorkOrderItem[] = [
    {
      id: 'wo-1',
      orderNumber: 'WO-2026-0041',
      productName: 'Heavy Industrial Turbine Vane X1',
      quantityTarget: 50,
      quantityCompleted: 34,
      status: 'IN_PRODUCTION',
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      productionLine: 'Line 2 - CNC Precision Milling',
    },
  ];

  async getWorkOrders() {
    return {
      data: this.workOrders,
      meta: { total: this.workOrders.length },
    };
  }

  async createWorkOrder(data: Partial<WorkOrderItem>) {
    const newWo: WorkOrderItem = {
      id: `wo-${Date.now()}`,
      orderNumber: `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: data.productName || 'Precision Assembly Unit',
      quantityTarget: data.quantityTarget || 10,
      quantityCompleted: 0,
      status: 'SCHEDULED',
      startDate: data.startDate || new Date().toISOString(),
      dueDate: data.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      productionLine: data.productionLine || 'Assembly Line 1',
    };
    this.workOrders.unshift(newWo);
    return newWo;
  }

  async getBillOfMaterials() {
    return [
      {
        bomId: 'BOM-101',
        assemblyName: 'Industrial Turbine Vane X1',
        components: [
          { sku: 'RAW-TITANIUM-01', name: 'Grade 5 Titanium Ingot', qtyPerUnit: 2.4, unit: 'kg' },
          { sku: 'FAST-HEX-08', name: 'Stainless Steel Hex Bolt M8', qtyPerUnit: 12, unit: 'pcs' },
          { sku: 'SEAL-O-RING-14', name: 'Viton High-Temp O-Ring', qtyPerUnit: 4, unit: 'pcs' },
        ],
      },
    ];
  }
}
