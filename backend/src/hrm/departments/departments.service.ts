import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmDepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
  {
    "id": "dept-01",
    "code": "ENG",
    "name": "Engineering & Technology",
    "headOfDepartment": "Alex Mercer",
    "employeeCount": 42,
    "annualBudget": 4200000,
    "status": "ACTIVE"
  },
  {
    "id": "dept-02",
    "code": "SALES",
    "name": "Global Sales & Partnerships",
    "headOfDepartment": "Victoria Sterling",
    "employeeCount": 28,
    "annualBudget": 2800000,
    "status": "ACTIVE"
  },
  {
    "id": "dept-03",
    "code": "HR",
    "name": "Human Resources & Talent",
    "headOfDepartment": "Elena Rostova",
    "employeeCount": 12,
    "annualBudget": 1100000,
    "status": "ACTIVE"
  },
  {
    "id": "dept-04",
    "code": "FIN",
    "name": "Finance & Compliance",
    "headOfDepartment": "Julian Moore",
    "employeeCount": 15,
    "annualBudget": 1600000,
    "status": "ACTIVE"
  },
  {
    "id": "dept-05",
    "code": "OPS",
    "name": "Operations & Logistics",
    "headOfDepartment": "Chloe Bennett",
    "employeeCount": 22,
    "annualBudget": 2100000,
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
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return item;
  }

  async create(data: any) {
    const newItem = {
      id: `dep-${Date.now()}`,
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
      throw new NotFoundException(`Department with ID ${id} not found`);
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
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    const removed = this.items.splice(index, 1)[0];
    return { message: `Department successfully deleted`, item: removed };
  }
}
