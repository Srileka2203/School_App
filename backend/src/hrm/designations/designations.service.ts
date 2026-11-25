import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmDesignationsService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
    {
      id: 'des-01',
      code: 'SE-L1',
      title: 'Junior Software Engineer',
      department: 'Engineering',
      rank: 1,
      status: 'ACTIVE',
    },
    {
      id: 'des-02',
      code: 'SE-L3',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      rank: 3,
      status: 'ACTIVE',
    },
    {
      id: 'des-03',
      code: 'SE-L5',
      title: 'Staff Software Engineer',
      department: 'Engineering',
      rank: 5,
      status: 'ACTIVE',
    },
    {
      id: 'des-04',
      code: 'AE-L2',
      title: 'Account Executive',
      department: 'Sales',
      rank: 2,
      status: 'ACTIVE',
    },
    {
      id: 'des-05',
      code: 'HRL-L4',
      title: 'HR People Lead',
      department: 'Human Resources',
      rank: 4,
      status: 'ACTIVE',
    },
  ];

  async findAll(query?: any) {
    try {
      const dbItems = await this.prisma.hrmDesignation.findMany({
        include: { department: true },
        orderBy: { createdAt: 'desc' },
      });

      if (dbItems && dbItems.length > 0) {
        let result = dbItems.map((d) => ({
          ...d,
          department: d.department?.name || null,
        }));

        if (query?.search) {
          const q = String(query.search).toLowerCase();
          result = result.filter(
            (item) =>
              item.title?.toLowerCase().includes(q) ||
              item.code?.toLowerCase().includes(q) ||
              item.department?.toLowerCase().includes(q),
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
      const item = await this.prisma.hrmDesignation.findFirst({
        where: { OR: [{ id }, { code: id }] },
        include: { department: true },
      });
      if (item) {
        return {
          ...item,
          department: item.department?.name || null,
        };
      }
    } catch (err) {
      // Fall through to memory
    }

    const item = this.items.find((i) => i.id === id || i.code === id);
    if (!item) {
      throw new NotFoundException(`Designation with ID ${id} not found`);
    }
    return item;
  }

  async create(data: any) {
    const title = data.title || data.name || 'New Designation';
    const code = data.code || title.substring(0, 4).toUpperCase();
    const description = data.description || null;
    const jobGrade = data.jobGrade || null;
    const status = data.status || 'ACTIVE';

    // Resolve departmentId if provided
    let departmentId: string | null = null;
    if (data.departmentId) {
      try {
        const d = await this.prisma.hrmDepartment.findUnique({ where: { id: data.departmentId } });
        if (d) departmentId = d.id;
      } catch {}
    } else if (data.department) {
      try {
        const d = await this.prisma.hrmDepartment.findFirst({
          where: { OR: [{ name: data.department }, { code: data.department }] },
        });
        if (d) departmentId = d.id;
      } catch {}
    }

    try {
      const created = await this.prisma.hrmDesignation.create({
        data: {
          ...(data.id ? { id: String(data.id) } : {}),
          title,
          code,
          departmentId,
          jobGrade,
          description,
          status,
        },
        include: { department: true },
      });
      const formatted = { ...created, department: created.department?.name || null };
      this.items.unshift(formatted);
      return formatted;
    } catch (err) {
      const newItem = {
        id: data.id || `des-${Date.now()}`,
        title,
        code,
        department: data.department || null,
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
      const updated = await this.prisma.hrmDesignation.update({
        where: { id },
        data: {
          ...(data.title ? { title: data.title } : {}),
          ...(data.code !== undefined ? { code: data.code } : {}),
          ...(data.jobGrade !== undefined ? { jobGrade: data.jobGrade } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.status ? { status: data.status } : {}),
        },
        include: { department: true },
      });
      const formatted = { ...updated, department: updated.department?.name || null };
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items[idx] = { ...this.items[idx], ...formatted };
      return formatted;
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) {
        throw new NotFoundException(`Designation with ID ${id} not found`);
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
      const deleted = await this.prisma.hrmDesignation.delete({ where: { id } });
      const idx = this.items.findIndex((i) => i.id === id);
      if (idx !== -1) this.items.splice(idx, 1);
      return { message: `Designation successfully deleted`, item: deleted };
    } catch (err) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) {
        throw new NotFoundException(`Designation with ID ${id} not found`);
      }
      const removed = this.items.splice(index, 1)[0];
      return { message: `Designation successfully deleted`, item: removed };
    }
  }
}
