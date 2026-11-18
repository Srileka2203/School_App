import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface BusinessWorkflowItem {
  id: string;
  name: string;
  category: string;
  status: 'ACTIVE' | 'DRAFT' | 'PAUSED' | 'ARCHIVED';
  trigger: string;
  stepsCount: number;
  lastExecutedAt?: string;
  createdAt: string;
}

@Injectable()
export class BusinessWorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  private workflows: BusinessWorkflowItem[] = [
    {
      id: 'wf-1',
      name: 'Procurement Approval Chain',
      category: 'Procurement',
      status: 'ACTIVE',
      trigger: 'Purchase Order Submitted',
      stepsCount: 4,
      lastExecutedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'wf-2',
      name: 'Manufacturing Quality Gate',
      category: 'Manufacturing',
      status: 'ACTIVE',
      trigger: 'Batch Inspection Complete',
      stepsCount: 3,
      lastExecutedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'wf-3',
      name: 'Customer Fulfillment Dispatch',
      category: 'Order Management',
      status: 'ACTIVE',
      trigger: 'Order Payment Confirmed',
      stepsCount: 5,
      lastExecutedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  async findAll() {
    return {
      data: this.workflows,
      meta: { total: this.workflows.length },
    };
  }

  async findOne(id: string) {
    const item = this.workflows.find((w) => w.id === id);
    if (!item) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }
    return item;
  }

  async create(data: Partial<BusinessWorkflowItem>) {
    const newWorkflow: BusinessWorkflowItem = {
      id: `wf-${Date.now()}`,
      name: data.name || 'Untitled Workflow',
      category: data.category || 'General',
      status: data.status || 'ACTIVE',
      trigger: data.trigger || 'Manual Trigger',
      stepsCount: data.stepsCount || 1,
      createdAt: new Date().toISOString(),
    };
    this.workflows.push(newWorkflow);
    return newWorkflow;
  }

  async update(id: string, data: Partial<BusinessWorkflowItem>) {
    const item = await this.findOne(id);
    Object.assign(item, data);
    return item;
  }

  async remove(id: string) {
    await this.findOne(id);
    this.workflows = this.workflows.filter((w) => w.id !== id);
    return { message: `Workflow ${id} successfully removed` };
  }
}
