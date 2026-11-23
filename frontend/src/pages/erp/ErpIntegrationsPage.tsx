import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ErpLayout } from './ErpLayout';
import { erpService } from '../../services/erp.service';
import type { ErpConnector, ErpIntegrationLog } from '../../types/erp.types';
import { RefreshCwIcon, SearchIcon, ZapIcon } from '../../components/common/Icons';

export const ErpIntegrationsPage: React.FC = () => {
  const [connectors, setConnectors] = useState<ErpConnector[]>([]);
  const [logs, setLogs] = useState<ErpIntegrationLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [connRes, logsRes] = await Promise.all([
        erpService.getConnectors(),
        erpService.getIntegrationLogs(),
      ]);
      const connList = (connRes as any)?.data || (Array.isArray(connRes) ? connRes : []);
      const logList = (logsRes as any)?.data || (Array.isArray(logsRes) ? logsRes : []);
      setConnectors(connList);
      setLogs(logList);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredConnectors = useMemo(() => {
    return connectors.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [connectors, search]);

  const handleTriggerSync = async (id: string, name: string) => {
    try {
      setSyncingId(id);
      setError(null);
      await erpService.triggerSync(id);
      setSuccess(`Sync initiated successfully for "${name}".`);
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || `Failed to sync ${name}`);
    } finally {
      setSyncingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return <span className="erp-badge erp-badge-success">CONNECTED</span>;
      case 'ERROR':
        return <span className="erp-badge erp-badge-danger">ERROR</span>;
      case 'DISCONNECTED':
        return <span className="erp-badge erp-badge-neutral">DISCONNECTED</span>;
      default:
        return <span className="erp-badge erp-badge-warning">{status}</span>;
    }
  };

  const getLogLevelBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'ERROR':
        return <span className="erp-badge erp-badge-danger">ERROR</span>;
      case 'WARN':
        return <span className="erp-badge erp-badge-warning">WARN</span>;
      default:
        return <span className="erp-badge erp-badge-info">INFO</span>;
    }
  };

  return (
    <ErpLayout
      title="Enterprise Integrations & Connectors"
      subtitle="Connect CRM core to SAP, Oracle NetSuite, warehouse 3PL APIs, and EDI transaction buses"
      activeTab="integrations"
      error={error}
      success={success}
      onDismissError={() => setError(null)}
      onDismissSuccess={() => setSuccess(null)}
      actions={
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="erp-btn erp-btn-secondary"
        >
          <RefreshCwIcon size={16} className={loading ? 'erp-spin' : ''} />
          <span>Refresh</span>
        </button>
      }
    >
      {/* 1. Connectors Grid */}
      <section className="erp-card">
        <div className="erp-card-header">
          <h3 className="erp-card-title">Configured Enterprise Connectors</h3>
          <div className="erp-search-wrap" style={{ maxWidth: 300 }}>
            <SearchIcon size={15} className="erp-search-icon" />
            <input
              type="text"
              placeholder="Search connectors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-input erp-search-input"
            />
          </div>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Connector System</th>
                <th>Protocol / Type</th>
                <th>Connection Status</th>
                <th>Records Synced Today</th>
                <th>Last Synchronized</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="erp-empty-cell">
                    Loading connectors...
                  </td>
                </tr>
              ) : filteredConnectors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="erp-empty-cell">
                    No connectors configured.
                  </td>
                </tr>
              ) : (
                filteredConnectors.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                    </td>
                    <td>
                      <span className="erp-badge erp-badge-neutral">{c.type}</span>
                    </td>
                    <td>{getStatusBadge(c.status)}</td>
                    <td>
                      <strong>{(c.recordsSyncedToday ?? 0).toLocaleString()}</strong> records
                    </td>
                    <td>{c.lastSyncAt ? new Date(c.lastSyncAt).toLocaleString() : 'Never'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleTriggerSync(c.id, c.name)}
                        disabled={syncingId === c.id}
                        className="erp-btn erp-btn-sm erp-btn-primary"
                        title="Trigger immediate sync job"
                      >
                        <ZapIcon size={13} />
                        <span>{syncingId === c.id ? 'Syncing...' : 'Sync Now'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Integration Audit Logs */}
      <section className="erp-card">
        <div className="erp-card-header">
          <h3 className="erp-card-title">Integration & Sync Audit Logs</h3>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Severity</th>
                <th>Connector</th>
                <th>Event Message</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="erp-empty-cell">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="erp-empty-cell">
                    No recent integration logs.
                  </td>
                </tr>
              ) : (
                logs.slice(0, 15).map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{getLogLevelBadge(log.level)}</td>
                    <td>
                      <code>{log.connectorId}</code>
                    </td>
                    <td>{log.message}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </ErpLayout>
  );
};
