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

  // --- WORK ORDERS ---
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

  async getWorkOrder(id: string) {
    const item = await this.prisma.manufacturingWorkOrder.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
    });

    if (!item) {
      throw new NotFoundException(`Work Order ${id} not found`);
    }
    return item;
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

  async updateWorkOrder(id: string, data: any) {
    const item = await this.getWorkOrder(id);
    return this.prisma.manufacturingWorkOrder.update({
      where: { id: item.id },
      data: {
        ...(data.productName !== undefined && { productName: data.productName }),
        ...(data.quantityTarget !== undefined && { quantityTarget: Number(data.quantityTarget) }),
        ...(data.quantityCompleted !== undefined && { quantityCompleted: Number(data.quantityCompleted) }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.productionLine !== undefined && { productionLine: data.productionLine }),
        ...(data.dueDate !== undefined && { dueDate: new Date(data.dueDate) }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
  }

  async removeWorkOrder(id: string) {
    const item = await this.getWorkOrder(id);
    await this.prisma.manufacturingWorkOrder.delete({
      where: { id: item.id },
    });
    return { message: `Work Order ${item.orderNumber} successfully removed` };
  }

  // --- BILL OF MATERIALS (BOM) ---
  async getBillOfMaterials(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    let data = await this.prisma.billOfMaterial.findMany({
      where,
      include: {
        components: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (data.length === 0) {
      await this.seedDefaultBOM(workspaceId);
      data = await this.prisma.billOfMaterial.findMany({
        where,
        include: { components: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return {
      data,
      meta: { total: data.length },
    };
  }

  async getBOM(id: string) {
    const item = await this.prisma.billOfMaterial.findFirst({
      where: {
        OR: [{ id }, { bomCode: id }],
      },
      include: {
        components: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`BOM ${id} not found`);
    }
    return item;
  }

  async createBOM(data: any) {
    const bomCode =
      data.bomCode ||
      `BOM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.billOfMaterial.create({
      data: {
        bomCode,
        assemblyName: data.assemblyName || 'Precision Industrial Sub-Assembly',
        version: data.version || '1.0',
        status: data.status || 'ACTIVE',
        workspaceId: data.workspaceId,
        components: data.components
          ? {
              create: data.components.map((c: any) => ({
                componentName: c.componentName,
                sku: c.sku,
                quantity: Number(c.quantity || 1),
                unitOfMeasure: c.unitOfMeasure || 'pcs',
                costPerUnit: Number(c.costPerUnit || 0),
              })),
            }
          : undefined,
      },
      include: {
        components: true,
      },
    });
  }

  async updateBOM(id: string, data: any) {
    const item = await this.getBOM(id);
    return this.prisma.billOfMaterial.update({
      where: { id: item.id },
      data: {
        ...(data.assemblyName !== undefined && { assemblyName: data.assemblyName }),
        ...(data.version !== undefined && { version: data.version }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: {
        components: true,
      },
    });
  }

  async removeBOM(id: string) {
    const item = await this.getBOM(id);
    await this.prisma.billOfMaterial.delete({
      where: { id: item.id },
    });
    return { message: `BOM ${item.bomCode} successfully removed` };
  }

  async seedDefaultBOM(workspaceId?: string) {
    const created = await this.prisma.billOfMaterial.create({
      data: {
        bomCode: 'BOM-2026-X1',
        assemblyName: 'Industrial Gas Turbine Vane Assembly',
        version: '1.2',
        status: 'ACTIVE',
        workspaceId,
        components: {
          create: [
            { componentName: 'Titanium Cast Bracket', sku: 'TIT-991', quantity: 4, unitOfMeasure: 'pcs', costPerUnit: 240 },
            { componentName: 'Ceramic Thermal Barrier Tile', sku: 'THM-102', quantity: 12, unitOfMeasure: 'pcs', costPerUnit: 85 },
            { componentName: 'Lock-tight Hex Fastener M8', sku: 'FST-008', quantity: 32, unitOfMeasure: 'pcs', costPerUnit: 2.5 },
          ],
        },
      },
    });
    return created;
  }
}
