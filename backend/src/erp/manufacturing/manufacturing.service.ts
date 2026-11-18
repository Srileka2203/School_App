import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface WorkOrderItem {
  id?: string;
  orderNumber?: string;
  productName: string;
  quantityTarget?: number;
  quantityCompleted?: number;
  status?: string;
  startDate?: Date | string;
  dueDate?: Date | string;
  productionLine?: string;
  notes?: string;
  workspaceId?: string;
}

@Injectable()
export class ManufacturingService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkOrders(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    const [data, total] = await Promise.all([
      this.prisma.manufacturingWorkOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.manufacturingWorkOrder.count({ where }),
    ]);

    return {
      data,
      meta: { total },
    };
  }

  async createWorkOrder(data: Partial<WorkOrderItem>) {
    const orderNumber =
      data.orderNumber ||
      `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.manufacturingWorkOrder.create({
      data: {
        orderNumber,
        productName: data.productName || 'Precision Assembly Unit',
        quantityTarget: data.quantityTarget ? Number(data.quantityTarget) : 10,
        quantityCompleted: data.quantityCompleted ? Number(data.quantityCompleted) : 0,
        status: data.status || 'SCHEDULED',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        dueDate: data.dueDate
          ? new Date(data.dueDate)
          : new Date(Date.now() + 7 * 86400000),
        productionLine: data.productionLine || 'Assembly Line 1',
        notes: data.notes,
        workspaceId: data.workspaceId,
      },
    });
  }

  async getBillOfMaterials(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    return this.prisma.billOfMaterial.findMany({
      where,
      include: {
        components: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
