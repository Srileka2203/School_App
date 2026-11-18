import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface QualityInspectionItem {
  id?: string;
  inspectionCode?: string;
  targetBatch: string;
  inspector: string;
  sampleSize?: number;
  defectsCount?: number;
  result?: string;
  inspectionDate?: Date | string;
  notes?: string;
  workspaceId?: string;
}

@Injectable()
export class QualityManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async getInspections(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    const [data, total] = await Promise.all([
      this.prisma.qualityInspection.findMany({
        where,
        orderBy: { inspectionDate: 'desc' },
      }),
      this.prisma.qualityInspection.count({ where }),
    ]);

    return {
      data,
      meta: { total },
    };
  }

  async createInspection(data: Partial<QualityInspectionItem>) {
    const inspectionCode =
      data.inspectionCode ||
      `QC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.qualityInspection.create({
      data: {
        inspectionCode,
        targetBatch: data.targetBatch || 'Batch Unspecified',
        inspector: data.inspector || 'Staff Inspector',
        sampleSize: data.sampleSize ? Number(data.sampleSize) : 50,
        defectsCount: data.defectsCount ? Number(data.defectsCount) : 0,
        result: data.result || 'PASS',
        inspectionDate: data.inspectionDate ? new Date(data.inspectionDate) : new Date(),
        notes: data.notes,
        workspaceId: data.workspaceId,
      },
    });
  }

  async getAudits(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    return this.prisma.qualityAudit.findMany({
      where,
      orderBy: { auditDate: 'desc' },
    });
  }
}
