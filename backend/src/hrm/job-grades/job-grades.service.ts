import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmJobGradesService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
    {
      id: 'jg-01',
      gradeCode: 'L1',
      gradeName: 'Entry Level Specialist',
      minSalary: 45000,
      maxSalary: 65000,
      currency: 'USD',
      status: 'ACTIVE',
    },
    {
      id: 'jg-02',
      gradeCode: 'L2',
      gradeName: 'Associate Professional',
      minSalary: 65000,
      maxSalary: 85000,
      currency: 'USD',
      status: 'ACTIVE',
    },
    {
      id: 'jg-03',
      gradeCode: 'L3',
      gradeName: 'Mid-Level Professional',
      minSalary: 85000,
      maxSalary: 110000,
      currency: 'USD',
      status: 'ACTIVE',
    },
    {
      id: 'jg-04',
      gradeCode: 'L4',
      gradeName: 'Senior Professional / Lead',
      minSalary: 110000,
      maxSalary: 145000,
      currency: 'USD',
      status: 'ACTIVE',
    },
    {
      id: 'jg-05',
      gradeCode: 'L5',
      gradeName: 'Staff / Principal Specialist',
      minSalary: 145000,
      maxSalary: 190000,
      currency: 'USD',
      status: 'ACTIVE',
    },
  ];

  async findAll(query?: any) {
    try {
      const dbItems = await this.prisma.hrmJobGrade.findMany({
        orderBy: { minSalary: 'asc' },
      });
      if (dbItems && dbItems.length > 0) {
        let result = dbItems;
        if (query?.search) {
          const q = String(query.search).toLowerCase();
          result = result.filter(
            (item) =>
              item.gradeName?.toLowerCase().includes(q) ||
              item.gradeLevel?.toLowerCase().includes(q),
          );
        }
        return { data: result, meta: { total: result.length } };
      }
    } catch (err) {}

    let result = [...this.items];
    if (query?.search) {
      const q = String(query.search).toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some(
          (val) => typeof val === 'string' && val.toLowerCase().includes(q),
        ),
      );
    }
    return { data: result, meta: { total: result.length } };
  }

  async findOne(id: string) {
    try {
      const item = await this.prisma.hrmJobGrade.findFirst({
        where: { OR: [{ id }, { gradeLevel: id }] },
      });
      if (item) return item;
    } catch (err) {}

    const item = this.items.find((i) => i.id === id || i.gradeCode === id);
    if (!item) throw new NotFoundException(`Job Grade with ID ${id} not found`);
    return item;
  }

  async create(data: any) {
    const gradeName = data.gradeName || data.name || 'New Grade';
    const gradeLevel = data.gradeLevel || data.gradeCode || null;
    const minSalary = data.minSalary !== undefined ? parseFloat(data.minSalary) : null;
    const maxSalary = data.maxSalary !== undefined ? parseFloat(data.maxSalary) : null;
    const currency = data.currency || 'USD';
    const description = data.description || null;

    try {
      const created = await this.prisma.hrmJobGrade.create({
        data: {
          ...(data.id ? { id: String(data.id) } : {}),
          gradeName,
          gradeLevel,
          minSalary,
          maxSalary,
          currency,
          description,
        },
      });
      this.items.unshift(created);
      return created;
    } catch (err) {
      const newItem = {
        id: data.id || `jg-${Date.now()}`,
        gradeName,
        gradeLevel,
        minSalary,
        maxSalary,
        currency,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      this.items.unshift(newItem);
      return newItem;
    }
  }

  async update(id: string, data: any) {
    try {
      const updated = await this.prisma.hrmJobGrade.update({
        where: { id },
        data: {
          ...(data.gradeName ? { gradeName: data.gradeName } : {}),
          ...(data.gradeLevel !== undefined ? { gradeLevel: data.gradeLevel } : {}),
          ...(data.minSalary !== undefined ? { minSalary: parseFloat(data.minSalary) } : {}),
          ...(data.maxSalary !== undefined ? { maxSalary: parseFloat(data.maxSalary) } : {}),
          ...(data.currency ? { currency: data.currency } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
        },
      });
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items[idx] = { ...this.items[idx], ...updated };
      return updated;
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) throw new NotFoundException(`Job Grade with ID ${id} not found`);
      this.items[index] = { ...this.items[index], ...data, updatedAt: new Date().toISOString() };
      return this.items[index];
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.prisma.hrmJobGrade.delete({ where: { id } });
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items.splice(idx, 1);
      return { message: 'Job Grade successfully deleted', item: deleted };
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) throw new NotFoundException(`Job Grade with ID ${id} not found`);
      const removed = this.items.splice(index, 1)[0];
      return { message: 'Job Grade successfully deleted', item: removed };
    }
  }
}
