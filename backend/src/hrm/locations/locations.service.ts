import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrmLocationsService {
  constructor(private readonly prisma: PrismaService) {}

  private items: any[] = [
  {
    "id": "loc-01",
    "code": "ATX-HQ",
    "name": "Austin Headquarters",
    "address": "100 Congress Ave",
    "city": "Austin",
    "state": "TX",
    "country": "USA",
    "timezone": "America/Chicago",
    "status": "ACTIVE"
  },
  {
    "id": "loc-02",
    "code": "LON-01",
    "name": "London Office",
    "address": "25 Bank Street, Canary Wharf",
    "city": "London",
    "state": "Greater London",
    "country": "UK",
    "timezone": "Europe/London",
    "status": "ACTIVE"
  },
  {
    "id": "loc-03",
    "code": "NYC-HUB",
    "name": "New York Hub",
    "address": "350 5th Ave",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "timezone": "America/New_York",
    "status": "ACTIVE"
  },
  {
    "id": "loc-04",
    "code": "REMOTE",
    "name": "Global Remote Workplace",
    "address": "Digital Distributed",
    "city": "Global",
    "state": "Virtual",
    "country": "Worldwide",
    "timezone": "UTC",
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
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
    return item;
  }

  async create(data: any) {
    const newItem = {
      id: `loc-${Date.now()}`,
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
      throw new NotFoundException(`Location with ID ${id} not found`);
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
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
    const removed = this.items.splice(index, 1)[0];
    return { message: `Location successfully deleted`, item: removed };
  }
}
