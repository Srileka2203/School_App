import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmEmployeeExperienceService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
    {
      id: 'exp-01',
      employeeId: 'emp-101',
      companyName: 'Stripe, Inc.',
      jobTitle: 'Senior Infrastructure Engineer',
      location: 'San Francisco, CA',
      startDate: '2020-02-01',
      endDate: '2023-02-28',
      description: 'Distributed payment ledger architecture and cloud infra scaling.',
    },
    {
      id: 'exp-02',
      employeeId: 'emp-102',
      companyName: 'Salesforce UK',
      jobTitle: 'Enterprise Commercial Lead',
      location: 'London, UK',
      startDate: '2019-09-01',
      endDate: '2023-05-15',
      description: 'B2B enterprise pipeline development across EMEA territories.',
    },
  ];

  async findAll(query?: any) {
    try {
      const dbItems = await this.prisma.hrmEmployeeExperience.findMany({
        where: query?.employeeId ? { employeeId: query.employeeId } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      if (dbItems && dbItems.length > 0) {
        return { data: dbItems, meta: { total: dbItems.length } };
      }
    } catch (err) {}

    let result = [...this.items];
    if (query?.employeeId) {
      result = result.filter((item) => item.employeeId === query.employeeId);
    }
    return { data: result, meta: { total: result.length } };
  }

  async findOne(id: string) {
    try {
      const item = await this.prisma.hrmEmployeeExperience.findUnique({ where: { id } });
      if (item) return item;
    } catch (err) {}

    const item = this.items.find((i) => i.id === id);
    if (!item) throw new NotFoundException(`Experience record with ID ${id} not found`);
    return item;
  }

  async create(data: any) {
    const companyName = data.companyName || 'Company';
    const jobTitle = data.jobTitle || 'Role';
    const description = data.description || null;

    try {
      let employeeId = data.employeeId;
      const emp = await this.prisma.hrmEmployee.findFirst({
        where: { OR: [{ id: employeeId }, { employeeNumber: employeeId }] },
      });
      if (emp) employeeId = emp.id;

      const created = await this.prisma.hrmEmployeeExperience.create({
        data: {
          employeeId,
          companyName,
          jobTitle,
          description,
        },
      });
      this.items.unshift(created);
      return created;
    } catch (err) {
      const newItem = {
        id: data.id || `exp-${Date.now()}`,
        companyName,
        jobTitle,
        description,
        createdAt: new Date().toISOString(),
        ...data,
      };
      this.items.unshift(newItem);
      return newItem;
    }
  }

  async update(id: string, data: any) {
    try {
      const updated = await this.prisma.hrmEmployeeExperience.update({
        where: { id },
        data: {
          ...(data.companyName ? { companyName: data.companyName } : {}),
          ...(data.jobTitle ? { jobTitle: data.jobTitle } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
        },
      });
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items[idx] = { ...this.items[idx], ...updated };
      return updated;
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) throw new NotFoundException(`Experience with ID ${id} not found`);
      this.items[index] = { ...this.items[index], ...data };
      return this.items[index];
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.prisma.hrmEmployeeExperience.delete({ where: { id } });
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items.splice(idx, 1);
      return { message: 'Experience record successfully deleted', item: deleted };
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) throw new NotFoundException(`Experience with ID ${id} not found`);
      const removed = this.items.splice(index, 1)[0];
      return { message: 'Experience record successfully deleted', item: removed };
    }
  }
}
