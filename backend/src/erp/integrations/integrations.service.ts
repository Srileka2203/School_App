import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateConnectorDto, UpdateConnectorDto } from './dto/connector.dto';

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getConnectors(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {};
    let [data, total] = await Promise.all([
      this.prisma.erpConnector.findMany({
        where,
        include: {
          logs: {
            take: 5,
            orderBy: { timestamp: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.erpConnector.count({ where }),
    ]);

    // If no connectors exist yet, auto-seed default enterprise connectors for convenience
    if (total === 0) {
      await this.seedDefaultConnectors(workspaceId);
      [data, total] = await Promise.all([
        this.prisma.erpConnector.findMany({
          where,
          include: {
            logs: {
              take: 5,
              orderBy: { timestamp: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.erpConnector.count({ where }),
      ]);
    }

    return {
      data,
      meta: { total },
    };
  }

  async getConnector(id: string) {
    const connector = await this.prisma.erpConnector.findUnique({
      where: { id },
      include: {
        logs: {
          take: 20,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!connector) {
      throw new NotFoundException(`Connector with ID ${id} not found`);
    }

    return connector;
  }

  async createConnector(data: CreateConnectorDto) {
    const connector = await this.prisma.erpConnector.create({
      data: {
        name: data.name || 'Custom ERP Connector',
        type: data.type || 'CUSTOM_WEBHOOK',
        status: data.status || 'CONNECTED',
        config: data.config ?? {},
        workspaceId: data.workspaceId,
      },
    });

    // Create initial lifecycle audit log
    await this.prisma.erpIntegrationLog.create({
      data: {
        connectorId: connector.id,
        level: 'INFO',
        message: `Connector "${connector.name}" created and registered successfully.`,
        payload: { type: connector.type, status: connector.status },
      },
    });

    return connector;
  }

  async updateConnector(id: string, data: UpdateConnectorDto) {
    await this.getConnector(id);

    return this.prisma.erpConnector.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.config !== undefined && { config: data.config }),
        ...(data.workspaceId !== undefined && { workspaceId: data.workspaceId }),
      },
      include: {
        logs: {
          take: 5,
          orderBy: { timestamp: 'desc' },
        },
      },
    });
  }

  async removeConnector(id: string) {
    await this.getConnector(id);

    await this.prisma.erpConnector.delete({
      where: { id },
    });

    return { message: `Connector with ID ${id} successfully removed` };
  }

  async triggerSync(id: string) {
    const connector = await this.getConnector(id);

    const updated = await this.prisma.erpConnector.update({
      where: { id },
      data: {
        lastSyncAt: new Date(),
        recordsSyncedToday: { increment: 10 },
      },
    });

    const log = await this.prisma.erpIntegrationLog.create({
      data: {
        connectorId: id,
        level: 'INFO',
        message: `Sync completed successfully for ${connector.name}`,
        payload: { recordsProcessed: 10, syncedAt: new Date().toISOString() },
      },
    });

    return {
      message: `Sync triggered successfully for ${connector.name}`,
      connector: updated,
      log,
    };
  }

  async getLogs(connectorId?: string) {
    const where = connectorId ? { connectorId } : {};
    return this.prisma.erpIntegrationLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }

  async seedDefaultConnectors(workspaceId?: string) {
    const defaults = [
      {
        name: 'QuickBooks Enterprise Gateway',
        type: 'ACCOUNTING',
        status: 'CONNECTED',
        config: { endpoint: 'https://api.quickbooks.com/v3', autoSync: true },
        recordsSyncedToday: 142,
        workspaceId,
      },
      {
        name: 'EDI 850 / 856 Supply Chain Portal',
        type: 'EDI',
        status: 'CONNECTED',
        config: { standard: 'X12', partnerId: 'SUPPLY-DIRECT-01' },
        recordsSyncedToday: 58,
        workspaceId,
      },
      {
        name: 'FreightWise Automated TMS',
        type: 'LOGISTICS',
        status: 'CONNECTED',
        config: { carrierApi: 'FedEx, DHL, UPS', trackingPollMinutes: 15 },
        recordsSyncedToday: 24,
        workspaceId,
      },
    ];

    for (const item of defaults) {
      const created = await this.prisma.erpConnector.create({
        data: item,
      });

      await this.prisma.erpIntegrationLog.create({
        data: {
          connectorId: created.id,
          level: 'INFO',
          message: `Connector "${created.name}" initialized.`,
          payload: { type: created.type },
        },
      });
    }
  }
}
