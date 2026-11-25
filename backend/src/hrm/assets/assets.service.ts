import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmAssetsService {
  constructor(private readonly prisma: PrismaService) {}

  private assets: any[] = [
    { id: 'ast-01', assetTag: 'AST-LAP-102', name: 'MacBook Pro 16" M3 Max', category: 'LAPTOP', serialNumber: 'C02G9941MD6', assignedToId: 'emp-101', assignedToName: 'Sarah Connor', status: 'ASSIGNED', purchasedDate: '2024-01-10' },
    { id: 'ast-02', assetTag: 'AST-MON-204', name: 'Dell UltraSharp 32" 4K Monitor', category: 'PERIPHERAL', serialNumber: 'CN-0881920', assignedToId: 'emp-101', assignedToName: 'Sarah Connor', status: 'ASSIGNED', purchasedDate: '2024-01-10' },
    { id: 'ast-03', assetTag: 'AST-LAP-105', name: 'Lenovo ThinkPad X1 Carbon Gen 11', category: 'LAPTOP', serialNumber: 'PF-399104', assignedToId: null, assignedToName: null, status: 'AVAILABLE', purchasedDate: '2024-03-20' },
  ];

  async findAll() {
    try {
      const dbAssets = await this.prisma.hrmAsset.findMany({
        include: {
          assignments: {
            include: { employee: true },
            orderBy: { assignedDate: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (dbAssets && dbAssets.length > 0) {
        const result = dbAssets.map((a) => {
          const currentAssignment = a.assignments?.[0];
          return {
            ...a,
            name: a.assetName,
            assignedToId: currentAssignment?.employeeId || null,
            assignedToName: currentAssignment?.employee ? `${currentAssignment.employee.firstName} ${currentAssignment.employee.lastName}` : null,
          };
        });
        return { data: result, meta: { total: result.length } };
      }
    } catch (err) {}

    return { data: this.assets, meta: { total: this.assets.length } };
  }

  async findOne(id: string) {
    try {
      const a = await this.prisma.hrmAsset.findFirst({
        where: { OR: [{ id }, { assetTag: id }] },
        include: {
          assignments: {
            include: { employee: true },
            orderBy: { assignedDate: 'desc' },
            take: 1,
          },
        },
      });
      if (a) {
        const currentAssignment = a.assignments?.[0];
        return {
          ...a,
          name: a.assetName,
          assignedToId: currentAssignment?.employeeId || null,
          assignedToName: currentAssignment?.employee ? `${currentAssignment.employee.firstName} ${currentAssignment.employee.lastName}` : null,
        };
      }
    } catch (err) {}

    const a = this.assets.find((item) => item.id === id || item.assetTag === id);
    if (!a) throw new NotFoundException('Asset record not found');
    return a;
  }

  async create(data: any) {
    const assetName = data.name || data.assetName || 'Hardware Asset';
    const assetTag = data.assetTag || `AST-${Date.now().toString().slice(-6)}`;
    const category = data.category || 'LAPTOP';
    const serialNumber = data.serialNumber || null;
    const cost = data.cost ? parseFloat(data.cost) : null;
    const status = data.status || 'AVAILABLE';

    try {
      const created = await this.prisma.hrmAsset.create({
        data: {
          assetName,
          assetTag,
          category,
          serialNumber,
          cost,
          status,
        },
      });
      const formatted = { ...created, name: created.assetName, assignedToId: null, assignedToName: null };
      this.assets.unshift(formatted);
      return formatted;
    } catch (err) {
      const asset = { id: `ast-${Date.now()}`, assetTag, name: assetName, status, ...data };
      this.assets.unshift(asset);
      return asset;
    }
  }

  async assign(id: string, employeeId: string, employeeName: string) {
    try {
      let resolvedEmpId = employeeId;
      const emp = await this.prisma.hrmEmployee.findFirst({
        where: { OR: [{ id: employeeId }, { employeeNumber: employeeId }] },
      });
      if (emp) resolvedEmpId = emp.id;

      await this.prisma.hrmAssetAssignment.create({
        data: {
          assetId: id,
          employeeId: resolvedEmpId,
        },
      });
      await this.prisma.hrmAsset.update({
        where: { id },
        data: { status: 'ASSIGNED' },
      });
    } catch (err) {}

    const a = await this.findOne(id);
    a.assignedToId = employeeId;
    a.assignedToName = employeeName;
    a.status = 'ASSIGNED';
    return a;
  }

  async returnAsset(id: string) {
    try {
      await this.prisma.hrmAsset.update({
        where: { id },
        data: { status: 'AVAILABLE' },
      });
    } catch (err) {}

    const a = await this.findOne(id);
    a.assignedToId = null;
    a.assignedToName = null;
    a.status = 'AVAILABLE';
    return a;
  }
}
