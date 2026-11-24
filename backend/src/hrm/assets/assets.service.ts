import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmAssetsService {
  constructor(private readonly prisma: PrismaService) {}

  private assets = [
    { id: 'ast-01', assetTag: 'AST-LAP-102', name: 'MacBook Pro 16" M3 Max', category: 'LAPTOP', serialNumber: 'C02G9941MD6', assignedToId: 'emp-101', assignedToName: 'Sarah Connor', status: 'ASSIGNED', purchasedDate: '2024-01-10' },
    { id: 'ast-02', assetTag: 'AST-MON-204', name: 'Dell UltraSharp 32" 4K Monitor', category: 'PERIPHERAL', serialNumber: 'CN-0881920', assignedToId: 'emp-101', assignedToName: 'Sarah Connor', status: 'ASSIGNED', purchasedDate: '2024-01-10' },
    { id: 'ast-03', assetTag: 'AST-LAP-105', name: 'Lenovo ThinkPad X1 Carbon Gen 11', category: 'LAPTOP', serialNumber: 'PF-399104', assignedToId: null, assignedToName: null, status: 'AVAILABLE', purchasedDate: '2024-03-20' },
  ];

  async findAll() {
    return { data: this.assets, meta: { total: this.assets.length } };
  }

  async findOne(id: string) {
    const a = this.assets.find((item) => item.id === id);
    if (!a) throw new NotFoundException('Asset record not found');
    return a;
  }

  async create(data: any) {
    const asset = { id: `ast-${Date.now()}`, status: 'AVAILABLE', ...data };
    this.assets.unshift(asset);
    return asset;
  }

  async assign(id: string, employeeId: string, employeeName: string) {
    const a = await this.findOne(id);
    a.assignedToId = employeeId;
    a.assignedToName = employeeName;
    a.status = 'ASSIGNED';
    return a;
  }

  async returnAsset(id: string) {
    const a = await this.findOne(id);
    a.assignedToId = null;
    a.assignedToName = null;
    a.status = 'AVAILABLE';
    return a;
  }
}
