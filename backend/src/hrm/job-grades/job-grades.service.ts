import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmJobGradesService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
  {
    "id": "jg-01",
    "gradeCode": "L1",
    "name": "Entry Level Specialist",
    "minSalary": 45000,
    "maxSalary": 65000,
    "currency": "USD",
    "status": "ACTIVE"
  },
  {
    "id": "jg-02",
    "gradeCode": "L2",
    "name": "Associate Professional",
    "minSalary": 65000,
    "maxSalary": 85000,
    "currency": "USD",
    "status": "ACTIVE"
  },
  {
    "id": "jg-03",
    "gradeCode": "L3",
    "name": "Mid-Level Professional",
    "minSalary": 85000,
    "maxSalary": 110000,
    "currency": "USD",
    "status": "ACTIVE"
  },
  {
    "id": "jg-04",
    "gradeCode": "L4",
    "name": "Senior Professional / Lead",
    "minSalary": 110000,
    "maxSalary": 145000,
    "currency": "USD",
    "status": "ACTIVE"
  },
  {
    "id": "jg-05",
    "gradeCode": "L5",
    "name": "Staff / Principal Specialist",
    "minSalary": 145000,
    "maxSalary": 190000,
    "currency": "USD",
    "status": "ACTIVE"
  },
  {
    "id": "jg-06",
    "gradeCode": "L6",
    "name": "Director / Strategic Leader",
    "minSalary": 190000,
    "maxSalary": 260000,
    "currency": "USD",
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
      throw new NotFoundException(`JobGrade with ID ${id} not found`);
    }
    return item;
  }

  async create(data: any) {
    const newItem = {
      id: `job-${Date.now()}`,
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
      throw new NotFoundException(`JobGrade with ID ${id} not found`);
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
      throw new NotFoundException(`JobGrade with ID ${id} not found`);
    }
    const removed = this.items.splice(index, 1)[0];
    return { message: `JobGrade successfully deleted`, item: removed };
  }
}
