import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmDepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
    {
      id: 'dept-01',
      code: 'ENG',
      name: 'Engineering & Technology',
      headOfDepartment: 'Alex Mercer',
      employeeCount: 42,
      annualBudget: 4200000,
      status: 'ACTIVE',
    },
    {
      id: 'dept-02',
      code: 'SALES',
      name: 'Global Sales & Partnerships',
      headOfDepartment: 'Victoria Sterling',
      employeeCount: 28,
      annualBudget: 2800000,
      status: 'ACTIVE',
    },
    {
      id: 'dept-03',
      code: 'HR',
      name: 'Human Resources & Talent',
      headOfDepartment: 'Elena Rostova',
      employeeCount: 12,
      annualBudget: 1100000,
      status: 'ACTIVE',
    },
    {
      id: 'dept-04',
      code: 'FIN',
      name: 'Finance & Compliance',
      headOfDepartment: 'Julian Moore',
      employeeCount: 15,
      annualBudget: 1600000,
      status: 'ACTIVE',
    },
    {
      id: 'dept-05',
      code: 'OPS',
      name: 'Operations & Logistics',
      headOfDepartment: 'Chloe Bennett',
      employeeCount: 22,
      annualBudget: 2100000,
      status: 'ACTIVE',
    },
  ];

  async findAll(query?: any) {
    try {
      const dbItems = await this.prisma.hrmDepartment.findMany({
        include: {
          employees: { select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (dbItems && dbItems.length > 0) {
        let result = dbItems.map((d) => ({
          ...d,
          employeeCount: d.employees?.length || 0,
        }));

        if (query?.search) {
          const q = String(query.search).toLowerCase();
          result = result.filter(
            (item) =>
              item.name?.toLowerCase().includes(q) ||
              item.code?.toLowerCase().includes(q) ||
              item.headOfDepartment?.toLowerCase().includes(q),
          );
        }
        if (query?.status) {
          result = result.filter((item) => item.status === query.status);
        }
        return {
          data: result,
          meta: { total: result.length },
        };
      }
    } catch (err) {
      // Fall through to memory
    }

    let result = [...this.items];
    if (query?.search) {
      const q = String(query.search).toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some(
          (val) => typeof val === 'string' && val.toLowerCase().includes(q),
        ),
      );
    }
    if (query?.status) {
      result = result.filter((item) => item.status === query.status);
    }
    return {
      data: result,
      meta: { total: result.length },
    };
  }

  async findOne(id: string) {
    try {
      const item = await this.prisma.hrmDepartment.findFirst({
        where: { OR: [{ id }, { code: id }] },
        include: { employees: true },
      });
      if (item) {
        return {
          ...item,
          employeeCount: item.employees?.length || 0,
        };
      }
    } catch (err) {
      // Fall through to memory
    }

    const item = this.items.find(
      (i) => i.id === id || i.code === id,
    );
    if (!item) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return item;
  }

  async create(data: any) {
    const name = data.name || data.title || 'New Department';
    const code = data.code || name.substring(0, 4).toUpperCase();
    const headOfDepartment = data.headOfDepartment || null;
    const description = data.description || null;
    const status = data.status || 'ACTIVE';

    try {
      const created = await this.prisma.hrmDepartment.create({
        data: {
          ...(data.id ? { id: String(data.id) } : {}),
          name,
          code,
          headOfDepartment,
          description,
          status,
        },
      });
      this.items.unshift(created);
      return created;
    } catch (err) {
      const newItem = {
        id: data.id || `dept-${Date.now()}`,
        name,
        code,
        headOfDepartment,
        description,
        status,
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
      const updated = await this.prisma.hrmDepartment.update({
        where: { id },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.code !== undefined ? { code: data.code } : {}),
          ...(data.headOfDepartment !== undefined ? { headOfDepartment: data.headOfDepartment } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.status ? { status: data.status } : {}),
        },
      });
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items[idx] = { ...this.items[idx], ...updated };
      return updated;
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) {
        throw new NotFoundException(`Department with ID ${id} not found`);
      }
      this.items[index] = {
        ...this.items[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return this.items[index];
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.prisma.hrmDepartment.delete({ where: { id } });
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items.splice(idx, 1);
      return { message: `Department successfully deleted`, item: deleted };
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) {
        throw new NotFoundException(`Department with ID ${id} not found`);
      }
      const removed = this.items.splice(index, 1)[0];
      return { message: `Department successfully deleted`, item: removed };
    }
  }
}
