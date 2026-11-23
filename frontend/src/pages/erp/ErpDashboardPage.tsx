import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ErpLayout } from './ErpLayout';
import { erpService } from '../../services/erp.service';
import type { ErpDashboardMetrics, ErpOperationalStats } from '../../types/erp.types';
import { RefreshCwIcon, ArrowRightIcon } from '../../components/common/Icons';

export const ErpDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ErpDashboardMetrics | null>(null);
  const [stats, setStats] = useState<ErpOperationalStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [overviewRes, statsRes] = await Promise.all([
        erpService.getDashboardOverview(),
        erpService.getDashboardStats(),
      ]);
      setMetrics(overviewRes.metrics);
      setStats(statsRes);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load ERP dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const moduleShortcuts = [
    { title: 'Business Workflows', desc: 'Process orchestration & triggers', path: '/erp/workflows', count: metrics?.activeWorkflows ?? 0 },
    { title: 'Approvals Engine', desc: 'Financial & operational sign-offs', path: '/erp/approvals', count: metrics?.pendingApprovals ?? 0 },
    { title: 'Procurement', desc: 'Purchase orders & vendor directory', path: '/erp/procurement', count: metrics?.openProcurementOrders ?? 0 },
    { title: 'Order Management', desc: 'Sales order lifecycle & fulfillment', path: '/erp/orders', count: metrics?.activeOrders ?? 0 },
    { title: 'Supply Chain', desc: 'Warehouse inventory & shipments', path: '/erp/supply-chain', count: metrics?.supplyChainAlerts ?? 0 },
    { title: 'Project Management', desc: 'Milestones & capital burn tracking', path: '/erp/projects', count: metrics?.activeProjects ?? 0 },
    { title: 'Manufacturing', desc: 'Work orders & bill of materials', path: '/erp/manufacturing', count: metrics?.manufacturingRuns ?? 0 },
    { title: 'Quality Management', desc: 'Batch inspections & audits', path: '/erp/quality', count: metrics?.qualityInspectionsPending ?? 0 },
    { title: 'Integrations', desc: 'Third-party connectors & sync logs', path: '/erp/integrations' },
    { title: 'Reports & Analytics', desc: 'P&L, spend analysis & OEE metrics', path: '/erp/reports' },
  ];

  return (
    <ErpLayout
      title="Enterprise Resource Planning (ERP)"
      subtitle="Unified operational hub across procurement, production, logistics, and workflows"
      activeTab="dashboard"
      error={error}
      onDismissError={() => setError(null)}
      actions={
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="erp-btn erp-btn-secondary"
          title="Refresh dashboard stats"
        >
          <RefreshCwIcon size={16} className={loading ? 'erp-spin' : ''} />
          <span>Refresh</span>
        </button>
      }
    >
      {/* 1. Core Operational KPI Summary */}
      <section className="erp-section">
        <div className="erp-section-header">
          <div className="erp-section-header-left">
            <h2 className="erp-section-title">Core Operations Summary</h2>
            <p className="erp-section-subtitle">Real-time throughput metrics across operational pipelines</p>
          </div>
          {lastRefreshed && (
            <span className="erp-section-timestamp">Updated at {lastRefreshed}</span>
          )}
        </div>

        <div className="erp-stats-grid">
          <div className="erp-stat-card">
            <div className="erp-stat-header">
              <span>Active Workflows</span>
              <span className="erp-badge erp-badge-blue">Pipelines</span>
            </div>
            <div className="erp-stat-value">{metrics ? metrics.activeWorkflows : '—'}</div>
            <div className="erp-stat-footer">Automated operational pipelines</div>
          </div>

          <div className="erp-stat-card">
            <div className="erp-stat-header">
              <span>Pending Approvals</span>
              <span className="erp-badge erp-badge-amber">Sign-Offs</span>
            </div>
            <div className="erp-stat-value" style={{ color: (metrics?.pendingApprovals ?? 0) > 0 ? '#b45309' : undefined }}>
              {metrics ? metrics.pendingApprovals : '—'}
            </div>
            <div className="erp-stat-footer">Awaiting managerial sign-off</div>
          </div>

          <div className="erp-stat-card">
            <div className="erp-stat-header">
              <span>Open POs</span>
              <span className="erp-badge erp-badge-cyan">Procurement</span>
            </div>
            <div className="erp-stat-value">{metrics ? metrics.openProcurementOrders : '—'}</div>
            <div className="erp-stat-footer">Procurement orders in transit</div>
          </div>

          <div className="erp-stat-card">
            <div className="erp-stat-header">
              <span>Active Orders</span>
              <span className="erp-badge erp-badge-emerald">Sales</span>
            </div>
            <div className="erp-stat-value">{metrics ? metrics.activeOrders : '—'}</div>
            <div className="erp-stat-footer">Sales orders processing</div>
          </div>

          <div className="erp-stat-card">
            <div className="erp-stat-header">
              <span>Supply Chain Alerts</span>
              <span className="erp-badge erp-badge-rose">Logistics</span>
            </div>
            <div className="erp-stat-value" style={{ color: (metrics?.supplyChainAlerts ?? 0) > 0 ? '#b91c1c' : undefined }}>
              {metrics ? metrics.supplyChainAlerts : '—'}
            </div>
            <div className="erp-stat-footer">Low inventory & dispatch delays</div>
          </div>

          <div className="erp-stat-card">
            <div className="erp-stat-header">
              <span>Active Projects</span>
              <span className="erp-badge erp-badge-violet">Projects</span>
            </div>
            <div className="erp-stat-value">{metrics ? metrics.activeProjects : '—'}</div>
            <div className="erp-stat-footer">Client projects underway</div>
          </div>

          <div className="erp-stat-card">
            <div className="erp-stat-header">
              <span>Manufacturing Runs</span>
              <span className="erp-badge erp-badge-orange">Shop Floor</span>
            </div>
            <div className="erp-stat-value">{metrics ? metrics.manufacturingRuns : '—'}</div>
            <div className="erp-stat-footer">Active production lines</div>
          </div>

          <div className="erp-stat-card">
            <div className="erp-stat-header">
              <span>Quality Queue</span>
              <span className="erp-badge erp-badge-teal">QA & Audits</span>
            </div>
            <div className="erp-stat-value">{metrics ? metrics.qualityInspectionsPending : '—'}</div>
            <div className="erp-stat-footer">Pending inspection batches</div>
          </div>
        </div>
      </section>

      {/* 2. Financial & Efficiency KPIs */}
      {stats && (
        <section className="erp-section">
          <div className="erp-section-header">
            <div className="erp-section-header-left">
              <h2 className="erp-section-title">Executive Performance Indicators</h2>
              <p className="erp-section-subtitle">High-level operational throughput and financial metrics</p>
            </div>
            <span className="erp-badge erp-badge-emerald">Enterprise Telemetry</span>
          </div>
          <div className="erp-stats-grid">
            <div className="erp-stat-card">
              <div className="erp-stat-header">
                <span>Procurement Spend (YTD)</span>
                <span className="erp-badge erp-badge-emerald">Finance</span>
              </div>
              <div className="erp-stat-value">${stats.totalProcurementSpend.toLocaleString()}</div>
              <div className="erp-stat-footer">Across verified vendor orders</div>
            </div>
            <div className="erp-stat-card">
              <div className="erp-stat-header">
                <span>Orders Fulfilled</span>
                <span className="erp-badge erp-badge-blue">Fulfillment</span>
              </div>
              <div className="erp-stat-value">{stats.fulfilledOrders.toLocaleString()}</div>
              <div className="erp-stat-footer">100% on-time delivery metric</div>
            </div>
            <div className="erp-stat-card">
              <div className="erp-stat-header">
                <span>Avg Production Cycle</span>
                <span className="erp-badge erp-badge-amber">Efficiency</span>
              </div>
              <div className="erp-stat-value">{stats.averageProductionCycleHours} hrs</div>
              <div className="erp-stat-footer">Manufacturing turnaround time</div>
            </div>
            <div className="erp-stat-card">
              <div className="erp-stat-header">
                <span>Compliance Score</span>
                <span className="erp-badge erp-badge-emerald">Audit</span>
              </div>
              <div className="erp-stat-value" style={{ color: stats.complianceScorePercent >= 90 ? '#047857' : '#d97706' }}>
                {stats.complianceScorePercent}%
              </div>
              <div className="erp-stat-footer">ISO & QA audit readiness</div>
            </div>
          </div>
        </section>
      )}

      {/* 3. ERP Sub-Modules Directory */}
      <section className="erp-section">
        <div className="erp-section-header">
          <div className="erp-section-header-left">
            <h2 className="erp-section-title">ERP Sub-Modules Directory</h2>
            <p className="erp-section-subtitle">Direct access to all 10 specialized enterprise operational modules</p>
          </div>
        </div>
        <div className="erp-module-grid">
          {moduleShortcuts.map((item) => (
            <Link key={item.path} to={item.path} className="erp-module-card">
              <div className="erp-module-card-header">
                <span className="erp-module-card-title">{item.title}</span>
                {item.count !== undefined && (
                  <span className="erp-badge erp-badge-info">{item.count} items</span>
                )}
              </div>
              <p className="erp-module-card-desc">{item.desc}</p>
              <div className="erp-module-card-link">
                <span>Access Module</span>
                <ArrowRightIcon size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </ErpLayout>
  );
};
