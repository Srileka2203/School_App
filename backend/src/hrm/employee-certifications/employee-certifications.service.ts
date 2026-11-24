import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmEmployeeCertificationsService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
  {
    "id": "cert-01",
    "employeeId": "emp-101",
    "certificationName": "AWS Certified Solutions Architect - Professional",
    "issuingOrganization": "Amazon Web Services",
    "issueDate": "2022-09-15",
    "expiryDate": "2025-09-15",
    "credentialId": "AWS-PSA-99412"
  },
  {
    "id": "cert-02",
    "employeeId": "emp-103",
    "certificationName": "SHRM Senior Certified Professional (SHRM-SCP)",
    "issuingOrganization": "SHRM",
    "issueDate": "2021-04-10",
    "expiryDate": "2026-04-10",
    "credentialId": "SHRM-781290"
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
      throw new NotFoundException(`EmployeeCertification with ID ${id} not found`);
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
      throw new NotFoundException(`EmployeeCertification with ID ${id} not found`);
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
      throw new NotFoundException(`EmployeeCertification with ID ${id} not found`);
    }
    const removed = this.items.splice(index, 1)[0];
    return { message: `EmployeeCertification successfully deleted`, item: removed };
  }
}
