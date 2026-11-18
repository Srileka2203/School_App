import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface InventoryItemDto {
  id?: string;
  sku: string;
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

  async getInventory(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    const [data, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        orderBy: { name: 'asc' },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);

    return {
      data,
      meta: { total },
    };
  }

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
}
