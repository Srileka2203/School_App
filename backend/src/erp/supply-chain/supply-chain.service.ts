import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  warehouseLocation: string;
  quantityOnHand: number;
  reorderLevel: number;
  status: 'OPTIMAL' | 'LOW_STOCK' | 'CRITICAL' | 'OVERSTOCK';
}

export interface ShipmentItem {
  id: string;
  trackingNumber: string;
  carrier: string;
  origin: string;
  destination: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  estimatedArrival: string;
}

@Injectable()
export class SupplyChainService {
  constructor(private readonly prisma: PrismaService) {}

  private inventory: InventoryItem[] = [
    {
      id: 'inv-1',
      sku: 'SKU-IND-409',
      name: 'Precision Aluminum Enclosure',
      warehouseLocation: 'Warehouse A - Bay 14',
      quantityOnHand: 450,
      reorderLevel: 100,
      status: 'OPTIMAL',
    },
    {
      id: 'inv-2',
      sku: 'SKU-ELEC-112',
      name: 'Optocoupler Micro Controller',
      warehouseLocation: 'Warehouse B - Bin 3',
      quantityOnHand: 35,
      reorderLevel: 100,
      status: 'CRITICAL',
    },
  ];

  private shipments: ShipmentItem[] = [
    {
      id: 'shp-1',
      trackingNumber: 'TRK-98421045',
      carrier: 'FedEx Freight',
      origin: 'Chicago Distribution Hub',
      destination: 'Dallas Assembly Facility',
      status: 'IN_TRANSIT',
      estimatedArrival: new Date(Date.now() + 2 * 86400000).toISOString(),
    },
  ];

  async getInventory() {
    return {
      data: this.inventory,
      meta: { total: this.inventory.length },
    };
  }

  async getShipments() {
    return {
      data: this.shipments,
      meta: { total: this.shipments.length },
    };
  }

  async createShipment(data: Partial<ShipmentItem>) {
    const newShipment: ShipmentItem = {
      id: `shp-${Date.now()}`,
      trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      carrier: data.carrier || 'DHL Express',
      origin: data.origin || 'Main Depot',
      destination: data.destination || 'Customer Location',
      status: 'PENDING',
      estimatedArrival: data.estimatedArrival || new Date(Date.now() + 3 * 86400000).toISOString(),
    };
    this.shipments.unshift(newShipment);
    return newShipment;
  }
}
