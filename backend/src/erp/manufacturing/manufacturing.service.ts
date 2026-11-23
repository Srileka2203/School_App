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
    const cleanWorkspaceId = workspaceId?.trim();
    const where = cleanWorkspaceId ? { workspaceId: cleanWorkspaceId } : {};
    let [data, total] = await Promise.all([
      this.prisma.manufacturingWorkOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.manufacturingWorkOrder.count({ where }),
    ]);

    if (total === 0) {
      await this.prisma.manufacturingWorkOrder.createMany({
        data: [
          {
            orderNumber: 'WO-2026-001',
            productName: 'Heavy Industrial Turbine Vane X1',
            quantityTarget: 50,
            quantityCompleted: 35,
            status: 'IN_PRODUCTION',
            productionLine: 'Line 2 - CNC Milling',
            workspaceId: cleanWorkspaceId || null,
          },
          {
            orderNumber: 'WO-2026-002',
            productName: 'Precision Hydraulic Valve Core',
            quantityTarget: 100,
            quantityCompleted: 100,
            status: 'COMPLETED',
            productionLine: 'Line 1 - Automated Assembly',
            workspaceId: cleanWorkspaceId || null,
          },
        ],
        skipDuplicates: true,
      });

      [data, total] = await Promise.all([
        this.prisma.manufacturingWorkOrder.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.manufacturingWorkOrder.count({ where }),
      ]);

      if (total === 0) {
        [data, total] = await Promise.all([
          this.prisma.manufacturingWorkOrder.findMany({
            orderBy: { createdAt: 'desc' },
          }),
          this.prisma.manufacturingWorkOrder.count(),
        ]);
      }
    }

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
    const cleanWorkspaceId = workspaceId?.trim();
    const where = cleanWorkspaceId ? { workspaceId: cleanWorkspaceId } : {};
    let data = await this.prisma.billOfMaterial.findMany({
      where,
      include: {
        components: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (data.length === 0) {
      await this.seedDefaultBOM(cleanWorkspaceId);
      data = await this.prisma.billOfMaterial.findMany({
        where,
        include: { components: true },
        orderBy: { createdAt: 'desc' },
      });

      // Fallback: if workspace-specific BOM was not found, return any existing BOMs
      if (data.length === 0) {
        data = await this.prisma.billOfMaterial.findMany({
          include: { components: true },
          orderBy: { createdAt: 'desc' },
        });
      }
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

    const rawComponents = Array.isArray(data.components)
      ? data.components
      : Array.isArray(data.components?.create)
        ? data.components.create
        : [];

    return this.prisma.billOfMaterial.create({
      data: {
        bomCode,
        assemblyName: data.assemblyName || 'Precision Industrial Sub-Assembly',
        version: data.version || '1.0',
        status: data.status || 'ACTIVE',
        workspaceId: data.workspaceId,
        components: rawComponents.length > 0
          ? {
              create: rawComponents.map((c: any) => ({
                componentName: c.componentName || 'Component',
                sku: c.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`,
                qtyPerUnit: Number(c.qtyPerUnit ?? c.quantity ?? 1),
                unit: c.unit || c.unitOfMeasure || 'pcs',
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
    const bomCode = 'BOM-2026-X1';

    const existing = await this.prisma.billOfMaterial.findFirst({
      where: { bomCode },
      include: { components: true },
    });

    if (existing) {
      return existing;
    }

    const created = await this.prisma.billOfMaterial.create({
      data: {
        bomCode,
        assemblyName: 'Industrial Gas Turbine Vane Assembly',
        version: '1.2',
        status: 'ACTIVE',
        workspaceId: workspaceId || null,
        components: {
          create: [
            { componentName: 'Titanium Cast Bracket', sku: 'TIT-991', qtyPerUnit: 4, unit: 'pcs' },
            { componentName: 'Ceramic Thermal Barrier Tile', sku: 'THM-102', qtyPerUnit: 12, unit: 'pcs' },
            { componentName: 'Lock-tight Hex Fastener M8', sku: 'FST-008', qtyPerUnit: 32, unit: 'pcs' },
          ],
        },
      },
      include: {
        components: true,
      },
    });
    return created;
  }
}
