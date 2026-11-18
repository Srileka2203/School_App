import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface ErpProjectItem {
  id?: string;
  projectCode?: string;
  name: string;
  description?: string;
  client?: string;
  status?: string;
  budgetTotal?: number;
  spentTotal?: number;
  startDate?: Date | string;
  targetEndDate?: Date | string;
  milestonesCount?: number;
  workspaceId?: string;
}

@Injectable()
export class ProjectManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    const [data, total] = await Promise.all([
      this.prisma.erpProject.findMany({
        where,
        include: {
          milestones: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.erpProject.count({ where }),
    ]);

    return {
      data,
      meta: { total },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.erpProject.findFirst({
      where: {
        OR: [{ id }, { projectCode: id }],
      },
      include: {
        milestones: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return item;
  }

  async create(data: Partial<ErpProjectItem>) {
    const projectCode =
      data.projectCode ||
      `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.erpProject.create({
      data: {
        projectCode,
        name: data.name || 'Untitled ERP Project',
        description: data.description,
        client: data.client || 'Internal',
        status: data.status || 'PLANNING',
        budgetTotal: data.budgetTotal ? Number(data.budgetTotal) : 0,
        spentTotal: data.spentTotal ? Number(data.spentTotal) : 0,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        targetEndDate: data.targetEndDate
          ? new Date(data.targetEndDate)
          : new Date(Date.now() + 60 * 86400000),
        milestonesCount: data.milestonesCount ? Number(data.milestonesCount) : 0,
        workspaceId: data.workspaceId,
      },
      include: {
        milestones: true,
      },
    });
  }
}
