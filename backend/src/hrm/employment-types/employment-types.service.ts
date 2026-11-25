import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmEmploymentTypesService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
    {
      id: 'et-01',
      code: 'FULL_TIME',
      name: 'Regular Full-Time',
      standardHoursPerWeek: 40,
      benefitsEligible: true,
      status: 'ACTIVE',
    },
    {
      id: 'et-02',
      code: 'PART_TIME',
      name: 'Regular Part-Time',
      standardHoursPerWeek: 20,
      benefitsEligible: false,
      status: 'ACTIVE',
    },
    {
      id: 'et-03',
      code: 'CONTRACT',
      name: 'Fixed Term Contractor',
      standardHoursPerWeek: 40,
      benefitsEligible: false,
      status: 'ACTIVE',
    },
    {
      id: 'et-04',
      code: 'INTERN',
      name: 'University Intern',
      standardHoursPerWeek: 30,
      benefitsEligible: false,
      status: 'ACTIVE',
    },
  ];

  async findAll(query?: any) {
    try {
      const dbItems = await this.prisma.hrmEmploymentType.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbItems && dbItems.length > 0) {
        let result = dbItems;
        if (query?.search) {
          const q = String(query.search).toLowerCase();
          result = result.filter(
            (item) =>
              item.name?.toLowerCase().includes(q) ||
              item.code?.toLowerCase().includes(q),
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
      const item = await this.prisma.hrmEmploymentType.findFirst({
        where: { OR: [{ id }, { code: id }] },
      });
      if (item) return item;
    } catch (err) {}

    const item = this.items.find((i) => i.id === id || i.code === id);
    if (!item) throw new NotFoundException(`Employment Type with ID ${id} not found`);
    return item;
  }

  async create(data: any) {
    const name = data.name || 'Full-time';
    const code = data.code || name.replace(/\s+/g, '_').toUpperCase();
    const description = data.description || null;
    const isPermanent = data.isPermanent !== undefined ? Boolean(data.isPermanent) : true;

    try {
      const created = await this.prisma.hrmEmploymentType.create({
        data: {
          ...(data.id ? { id: String(data.id) } : {}),
          name,
          code,
          description,
          isPermanent,
        },
      });
      this.items.unshift(created);
      return created;
    } catch (err) {
      const newItem = {
        id: data.id || `et-${Date.now()}`,
        name,
        code,
        description,
        isPermanent,
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
      const updated = await this.prisma.hrmEmploymentType.update({
        where: { id },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.code !== undefined ? { code: data.code } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.isPermanent !== undefined ? { isPermanent: Boolean(data.isPermanent) } : {}),
        },
      });
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items[idx] = { ...this.items[idx], ...updated };
      return updated;
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) throw new NotFoundException(`Employment Type with ID ${id} not found`);
      this.items[index] = { ...this.items[index], ...data, updatedAt: new Date().toISOString() };
      return this.items[index];
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.prisma.hrmEmploymentType.delete({ where: { id } });
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items.splice(idx, 1);
      return { message: 'Employment Type successfully deleted', item: deleted };
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) throw new NotFoundException(`Employment Type with ID ${id} not found`);
      const removed = this.items.splice(index, 1)[0];
      return { message: 'Employment Type successfully deleted', item: removed };
    }
  }
}
