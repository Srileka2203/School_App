import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmEmployeeEducationService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
  {
    "id": "edu-01",
    "employeeId": "emp-101",
    "institution": "University of Texas at Austin",
    "degree": "Bachelor of Science",
    "fieldOfStudy": "Computer Science",
    "graduationYear": 2018,
    "grade": "3.85 GPA"
  },
  {
    "id": "edu-02",
    "employeeId": "emp-102",
    "institution": "King’s College London",
    "degree": "Bachelor of Arts",
    "fieldOfStudy": "Business & Management",
    "graduationYear": 2019,
    "grade": "First Class Honours"
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
      throw new NotFoundException(`EmployeeEducation with ID ${id} not found`);
    }
    return item;
  }

  async create(data: any) {
    const newItem = {
      id: `emp-${Date.now()}`,
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
      throw new NotFoundException(`EmployeeEducation with ID ${id} not found`);
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
      throw new NotFoundException(`EmployeeEducation with ID ${id} not found`);
    }
    const removed = this.items.splice(index, 1)[0];
    return { message: `EmployeeEducation successfully deleted`, item: removed };
  }
}
