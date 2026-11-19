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

  // --- INSPECTIONS ---
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

  async getInspection(id: string) {
    const item = await this.prisma.qualityInspection.findFirst({
      where: {
        OR: [{ id }, { inspectionCode: id }],
      },
    });

    if (!item) {
      throw new NotFoundException(`Quality inspection ${id} not found`);
    }
    return item;
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

  async updateInspection(id: string, data: any) {
    const item = await this.getInspection(id);
    return this.prisma.qualityInspection.update({
      where: { id: item.id },
      data: {
        ...(data.targetBatch !== undefined && { targetBatch: data.targetBatch }),
        ...(data.inspector !== undefined && { inspector: data.inspector }),
        ...(data.sampleSize !== undefined && { sampleSize: Number(data.sampleSize) }),
        ...(data.defectsCount !== undefined && { defectsCount: Number(data.defectsCount) }),
        ...(data.result !== undefined && { result: data.result }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
  }

  async removeInspection(id: string) {
    const item = await this.getInspection(id);
    await this.prisma.qualityInspection.delete({
      where: { id: item.id },
    });
    return { message: `Inspection ${item.inspectionCode} successfully removed` };
  }

  // --- AUDITS ---
  async getAudits(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    let [data, total] = await Promise.all([
      this.prisma.qualityAudit.findMany({
        where,
        orderBy: { auditDate: 'desc' },
      }),
      this.prisma.qualityAudit.count({ where }),
    ]);

    if (total === 0) {
      await this.seedDefaultAudits(workspaceId);
      [data, total] = await Promise.all([
        this.prisma.qualityAudit.findMany({
          where,
          orderBy: { auditDate: 'desc' },
        }),
        this.prisma.qualityAudit.count({ where }),
      ]);
    }

    return {
      data,
      meta: { total },
    };
  }

  async getAudit(id: string) {
    const audit = await this.prisma.qualityAudit.findUnique({
      where: { id },
    });

    if (!audit) {
      throw new NotFoundException(`Audit with ID ${id} not found`);
    }
    return audit;
  }

  async createAudit(data: any) {
    return this.prisma.qualityAudit.create({
      data: {
        title: data.title || 'Internal ISO 9001 Quality Audit',
        standard: data.standard || 'ISO 9001',
        score: data.score !== undefined ? Number(data.score) : null,
        status: data.status || 'COMPLIANT',
        auditDate: data.auditDate ? new Date(data.auditDate) : new Date(),
        auditor: data.auditor || 'Lead Auditor',
        workspaceId: data.workspaceId,
      },
    });
  }

  async updateAudit(id: string, data: any) {
    await this.getAudit(id);
    return this.prisma.qualityAudit.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.standard !== undefined && { standard: data.standard }),
        ...(data.score !== undefined && { score: Number(data.score) }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.auditor !== undefined && { auditor: data.auditor }),
      },
    });
  }

  async removeAudit(id: string) {
    await this.getAudit(id);
    await this.prisma.qualityAudit.delete({
      where: { id },
    });
    return { message: `Audit with ID ${id} successfully removed` };
  }

  async seedDefaultAudits(workspaceId?: string) {
    const defaults = [
      { title: 'ISO 9001:2015 Recertification Audit', standard: 'ISO 9001', score: 99.2, status: 'COMPLIANT', auditor: 'Bureau Veritas', workspaceId },
      { title: 'OSHA Workplace Safety Standard Audit', standard: 'OSHA', score: 97.8, status: 'COMPLIANT', auditor: 'National Safety Council', workspaceId },
      { title: 'Good Manufacturing Practice (GMP) Review', standard: 'GMP', score: 98.4, status: 'COMPLIANT', auditor: 'Internal QA Team', workspaceId },
    ];
    for (const d of defaults) {
      await this.prisma.qualityAudit.create({ data: d });
    }
  }
}
