import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmDesignationsService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
  {
    "id": "des-01",
    "code": "SE-L1",
    "title": "Junior Software Engineer",
    "department": "Engineering",
    "rank": 1,
    "status": "ACTIVE"
  },
  {
    "id": "des-02",
    "code": "SE-L3",
    "title": "Senior Software Engineer",
    "department": "Engineering",
    "rank": 3,
    "status": "ACTIVE"
  },
  {
    "id": "des-03",
    "code": "SE-L5",
    "title": "Staff Software Engineer",
    "department": "Engineering",
    "rank": 5,
    "status": "ACTIVE"
  },
  {
    "id": "des-04",
    "code": "AE-L2",
    "title": "Account Executive",
    "department": "Sales",
    "rank": 2,
    "status": "ACTIVE"
  },
  {
    "id": "des-05",
    "code": "HRL-L4",
    "title": "HR People Lead",
    "department": "Human Resources",
    "rank": 4,
    "status": "ACTIVE"
  }
];

  async findAll(query?: any) {
    let result = [...this.items];
    if (query?.search) {
      const q = String(query.search).toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((val) =>
          typeof val === 'string' && val.toLowerCase().includes(q),
        ),
      );
    }
    if (query?.status) {
      result = result.filter((item) => item.status === query.status);
    }
    if (query?.department) {
      result = result.filter((item) => item.department === query.department);
    }
    if (query?.employeeId) {
      result = result.filter((item) => item.employeeId === query.employeeId);
    }
    return {
      data: result,
      meta: { total: result.length },
    };
  }

  async findOne(id: string) {
    const item = this.items.find((i) => i.id === id || i.code === id || i.employeeNumber === id);
    if (!item) {
      throw new NotFoundException(`Designation with ID ${id} not found`);
    }
    return item;
  }

  async create(data: any) {
    const newItem = {
      id: `des-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    this.items.unshift(newItem);
    return newItem;
  }

  async update(id: string, data: any) {
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

  async remove(id: string) {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new NotFoundException(`Designation with ID ${id} not found`);
    }
    const removed = this.items.splice(index, 1)[0];
    return { message: `Designation successfully deleted`, item: removed };
  }
}
