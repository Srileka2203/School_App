import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface ErpIntegrationConnector {
  id: string;
  name: string;
  type: 'ACCOUNTING' | 'EDI' | 'LOGISTICS' | 'BANKING' | 'CUSTOM_WEBHOOK';
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSyncAt: string;
  recordsSyncedToday: number;
}

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  private connectors: ErpIntegrationConnector[] = [
    {
      id: 'int-1',
      name: 'QuickBooks Enterprise Gateway',
      type: 'ACCOUNTING',
      status: 'CONNECTED',
      lastSyncAt: new Date().toISOString(),
      recordsSyncedToday: 142,
    },
    {
      id: 'int-2',
      name: 'EDI 850 / 856 Supply Chain Portal',
      type: 'EDI',
      status: 'CONNECTED',
      lastSyncAt: new Date().toISOString(),
      recordsSyncedToday: 58,
    },
    {
      id: 'int-3',
      name: 'FreightWise Automated TMS',
      type: 'LOGISTICS',
      status: 'CONNECTED',
      lastSyncAt: new Date(Date.now() - 3600000).toISOString(),
      recordsSyncedToday: 24,
    },
  ];

  async getConnectors() {
    return {
      data: this.connectors,
      meta: { total: this.connectors.length },
    };
  }

  async triggerSync(id: string) {
    const item = this.connectors.find((c) => c.id === id);
    if (!item) {
      throw new NotFoundException(`Connector ${id} not found`);
    }
    item.lastSyncAt = new Date().toISOString();
    item.recordsSyncedToday += 10;
    return {
      message: `Sync triggered successfully for ${item.name}`,
      connector: item,
    };
  }

  async getLogs() {
    return [
      { id: 'log-1', timestamp: new Date().toISOString(), level: 'INFO', message: 'EDI 850 Purchase Order payload ingested successfully.' },
      { id: 'log-2', timestamp: new Date(Date.now() - 1800000).toISOString(), level: 'INFO', message: 'QuickBooks general ledger transaction batch posted.' },
    ];
  }
}
