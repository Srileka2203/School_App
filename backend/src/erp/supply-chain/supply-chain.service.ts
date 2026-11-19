import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface InventoryItemDto {
  id?: string;
  sku?: string;
  name: string;
  description?: string;
  warehouseLocation?: string;
  quantityOnHand?: number;
  reorderLevel?: number;
  unitPrice?: number;
  unitOfMeasure?: string;
  status?: string;
  workspaceId?: string;
}

export interface ShipmentItemDto {
  id?: string;
  trackingNumber?: string;
  carrier?: string;
  origin: string;
  destination: string;
  status?: string;
  estimatedArrival?: Date | string;
  actualArrival?: Date | string;
  notes?: string;
  workspaceId?: string;
}

@Injectable()
export class SupplyChainService {
  constructor(private readonly prisma: PrismaService) {}

  // --- INVENTORY ---
  async getInventory(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    let [data, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        orderBy: { name: 'asc' },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);

    if (total === 0) {
      await this.seedDefaultInventory(workspaceId);
      [data, total] = await Promise.all([
        this.prisma.inventoryItem.findMany({
          where,
          orderBy: { name: 'asc' },
        }),
        this.prisma.inventoryItem.count({ where }),
      ]);
    }

    return {
      data,
      meta: { total },
    };
  }

  async getInventoryItem(id: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: {
        OR: [{ id }, { sku: id }],
      },
    });

    if (!item) {
      throw new NotFoundException(`Inventory item ${id} not found`);
    }
    return item;
  }

  async createInventory(data: InventoryItemDto) {
    const sku =
      data.sku ||
      `SKU-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.inventoryItem.create({
      data: {
        sku,
        name: data.name,
        description: data.description,
        warehouseLocation: data.warehouseLocation || 'Main Warehouse',
        quantityOnHand: data.quantityOnHand !== undefined ? Number(data.quantityOnHand) : 0,
        reorderLevel: data.reorderLevel !== undefined ? Number(data.reorderLevel) : 10,
        unitPrice: data.unitPrice !== undefined ? Number(data.unitPrice) : 0,
        unitOfMeasure: data.unitOfMeasure || 'units',
        status: data.status || 'OPTIMAL',
        workspaceId: data.workspaceId,
      },
    });
  }

  async updateInventoryItem(id: string, data: Partial<InventoryItemDto>) {
    const item = await this.getInventoryItem(id);
    return this.prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.warehouseLocation !== undefined && { warehouseLocation: data.warehouseLocation }),
        ...(data.quantityOnHand !== undefined && { quantityOnHand: Number(data.quantityOnHand) }),
        ...(data.reorderLevel !== undefined && { reorderLevel: Number(data.reorderLevel) }),
        ...(data.unitPrice !== undefined && { unitPrice: Number(data.unitPrice) }),
        ...(data.unitOfMeasure !== undefined && { unitOfMeasure: data.unitOfMeasure }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });
  }

  async removeInventoryItem(id: string) {
    const item = await this.getInventoryItem(id);
    await this.prisma.inventoryItem.delete({
      where: { id: item.id },
    });
    return { message: `Inventory item ${item.sku} successfully removed` };
  }

  // --- SHIPMENTS ---
  async getShipments(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    const [data, total] = await Promise.all([
      this.prisma.logisticsShipment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.logisticsShipment.count({ where }),
    ]);

    return {
      data,
      meta: { total },
    };
  }

  async getShipment(id: string) {
    const shipment = await this.prisma.logisticsShipment.findFirst({
      where: {
        OR: [{ id }, { trackingNumber: id }],
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment ${id} not found`);
    }
    return shipment;
  }

  async createShipment(data: Partial<ShipmentItemDto>) {
    const trackingNumber =
      data.trackingNumber ||
      `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;

    return this.prisma.logisticsShipment.create({
      data: {
        trackingNumber,
        carrier: data.carrier || 'DHL Express',
        origin: data.origin || 'Main Depot',
        destination: data.destination || 'Customer Location',
        status: data.status || 'PENDING',
        estimatedArrival: data.estimatedArrival
          ? new Date(data.estimatedArrival)
          : new Date(Date.now() + 3 * 86400000),
        notes: data.notes,
        workspaceId: data.workspaceId,
      },
    });
  }

  async updateShipmentStatus(id: string, status: string, actualArrival?: Date | string) {
    const shipment = await this.getShipment(id);
    return this.prisma.logisticsShipment.update({
      where: { id: shipment.id },
      data: {
        status,
        ...(actualArrival && { actualArrival: new Date(actualArrival) }),
      },
    });
  }

  async removeShipment(id: string) {
    const shipment = await this.getShipment(id);
    await this.prisma.logisticsShipment.delete({
      where: { id: shipment.id },
    });
    return { message: `Shipment ${shipment.trackingNumber} successfully removed` };
  }

  async seedDefaultInventory(workspaceId?: string) {
    const defaults = [
      { sku: 'SKU-IND-409', name: 'Precision Aluminum Enclosure', warehouseLocation: 'Warehouse A - Bay 14', quantityOnHand: 450, reorderLevel: 100, unitPrice: 45, unitOfMeasure: 'pcs', status: 'OPTIMAL', workspaceId },
      { sku: 'SKU-ELEC-112', name: 'Optocoupler Micro Controller', warehouseLocation: 'Warehouse B - Bin 3', quantityOnHand: 35, reorderLevel: 100, unitPrice: 12.5, unitOfMeasure: 'pcs', status: 'CRITICAL', workspaceId },
      { sku: 'SKU-PKG-088', name: 'Corrugated Heavy Duty Crates', warehouseLocation: 'Warehouse C - Staging', quantityOnHand: 800, reorderLevel: 200, unitPrice: 8, unitOfMeasure: 'boxes', status: 'OPTIMAL', workspaceId },
    ];
    for (const d of defaults) {
      await this.prisma.inventoryItem.create({ data: d });
    }
  }
}
