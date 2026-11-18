import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface ErpProjectItem {
  id: string;
  projectCode: string;
  name: string;
  client: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED';
  budgetTotal: number;
  spentTotal: number;
  startDate: string;
  targetEndDate: string;
  milestonesCount: number;
}

@Injectable()
export class ProjectManagementService {
  constructor(private readonly prisma: PrismaService) {}

  private projects: ErpProjectItem[] = [
    {
      id: 'prj-1',
      projectCode: 'PRJ-2026-ALPHA',
      name: 'Custom Manufacturing Line Modernization',
      client: 'Vanguard Industrial Tech',
      status: 'IN_PROGRESS',
      budgetTotal: 120000,
      spentTotal: 48600,
      startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      targetEndDate: new Date(Date.now() + 60 * 86400000).toISOString(),
      milestonesCount: 8,
    },
  ];

  async findAll() {
    return {
      data: this.projects,
      meta: { total: this.projects.length },
    };
  }

  async findOne(id: string) {
    const item = this.projects.find((p) => p.id === id || p.projectCode === id);
    if (!item) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return item;
  }

  async create(data: Partial<ErpProjectItem>) {
    const newProject: ErpProjectItem = {
      id: `prj-${Date.now()}`,
      projectCode: `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name || 'Untitled ERP Project',
      client: data.client || 'Internal Operations',
      status: 'PLANNING',
      budgetTotal: data.budgetTotal || 0,
      spentTotal: 0,
      startDate: data.startDate || new Date().toISOString(),
      targetEndDate: data.targetEndDate || new Date(Date.now() + 90 * 86400000).toISOString(),
      milestonesCount: data.milestonesCount || 1,
    };
    this.projects.unshift(newProject);
    return newProject;
  }
}
