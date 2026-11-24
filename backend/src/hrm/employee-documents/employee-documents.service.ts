import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmEmployeeDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
  {
    "id": "doc-01",
    "employeeId": "emp-101",
    "title": "Employment Agreement 2023",
    "documentType": "CONTRACT",
    "fileUrl": "https://files.example.com/contracts/emp-101.pdf",
    "expiryDate": null,
    "status": "VERIFIED"
  },
  {
    "id": "doc-02",
    "employeeId": "emp-101",
    "title": "Government Passport Copy",
    "documentType": "ID_CARD",
    "fileUrl": "https://files.example.com/id/emp-101-pass.pdf",
    "expiryDate": "2029-08-20",
    "status": "VERIFIED"
  },
  {
    "id": "doc-03",
    "employeeId": "emp-102",
    "title": "Sales NDA & Non-Compete",
    "documentType": "NDA",
    "fileUrl": "https://files.example.com/legal/emp-102-nda.pdf",
    "expiryDate": null,
    "status": "VERIFIED"
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
      throw new NotFoundException(`EmployeeDocument with ID ${id} not found`);
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
      throw new NotFoundException(`EmployeeDocument with ID ${id} not found`);
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
      throw new NotFoundException(`EmployeeDocument with ID ${id} not found`);
    }
    const removed = this.items.splice(index, 1)[0];
    return { message: `EmployeeDocument successfully deleted`, item: removed };
  }
}
