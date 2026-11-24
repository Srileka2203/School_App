import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmEmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
  {
    "id": "emp-101",
    "employeeNumber": "EMP-1001",
    "firstName": "Sarah",
    "lastName": "Connor",
    "email": "sarah.connor@example.com",
    "phone": "+1-555-0101",
    "department": "Engineering",
    "designation": "Staff Software Engineer",
    "location": "Austin HQ",
    "jobGrade": "L5",
    "employmentType": "Full-time",
    "status": "ACTIVE",
    "joiningDate": "2023-03-15",
    "salary": 145000
  },
  {
    "id": "emp-102",
    "employeeNumber": "EMP-1002",
    "firstName": "Marcus",
    "lastName": "Vance",
    "email": "marcus.vance@example.com",
    "phone": "+1-555-0102",
    "department": "Sales",
    "designation": "Senior Account Executive",
    "location": "London Office",
    "jobGrade": "L4",
    "employmentType": "Full-time",
    "status": "ACTIVE",
    "joiningDate": "2023-06-01",
    "salary": 110000
  },
  {
    "id": "emp-103",
    "employeeNumber": "EMP-1003",
    "firstName": "Elena",
    "lastName": "Rostova",
    "email": "elena.rostova@example.com",
    "phone": "+1-555-0103",
    "department": "Human Resources",
    "designation": "HR People Lead",
    "location": "Austin HQ",
    "jobGrade": "L4",
    "employmentType": "Full-time",
    "status": "ACTIVE",
    "joiningDate": "2022-11-10",
    "salary": 98000
  },
  {
    "id": "emp-104",
    "employeeNumber": "EMP-1004",
    "firstName": "David",
    "lastName": "Kim",
    "email": "david.kim@example.com",
    "phone": "+1-555-0104",
    "department": "Finance",
    "designation": "Financial Analyst",
    "location": "New York Hub",
    "jobGrade": "L3",
    "employmentType": "Full-time",
    "status": "ON_LEAVE",
    "joiningDate": "2024-01-15",
    "salary": 85000
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
      throw new NotFoundException(`Employee with ID ${id} not found`);
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
      throw new NotFoundException(`Employee with ID ${id} not found`);
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
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    const removed = this.items.splice(index, 1)[0];
    return { message: `Employee successfully deleted`, item: removed };
  }
}
