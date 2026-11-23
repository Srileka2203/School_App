import React, { useEffect, useState, useCallback } from 'react';
import { ErpLayout } from './ErpLayout';
import { erpService } from '../../services/erp.service';
import type { FinancialReport, ProcurementReport, ProductionEfficiencyReport } from '../../types/erp.types';
import { RefreshCwIcon } from '../../components/common/Icons';

export const ErpReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'financial' | 'procurement' | 'production'>('financial');
  const [financial, setFinancial] = useState<FinancialReport | null>(null);
  const [procurement, setProcurement] = useState<ProcurementReport | null>(null);
  const [production, setProduction] = useState<ProductionEfficiencyReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [finRes, procRes, prodRes] = await Promise.all([
        erpService.getFinancialReport(),
        erpService.getProcurementReport(),
        erpService.getProductionReport(),
      ]);
      setFinancial(finRes);
      setProcurement(procRes);
      setProduction(prodRes);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to generate ERP reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <ErpLayout
      title="ERP Analytics & Executive Reports"
      subtitle="Financial statements, vendor spend concentration, operational downtime, and OEE performance"
      activeTab="reports"
      error={error}
      onDismissError={() => setError(null)}
      actions={
        <button
          type="button"
          onClick={loadReports}
          disabled={loading}
          className="erp-btn erp-btn-secondary"
        >
          <RefreshCwIcon size={16} className={loading ? 'erp-spin' : ''} />
          <span>Refresh Reports</span>
        </button>
      }
    >
      <div className="erp-card">
        {/* Module Sub-tabs */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setActiveTab('financial')}
            className={`erp-btn ${activeTab === 'financial' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
          >
            Financial Performance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('procurement')}
            className={`erp-btn ${activeTab === 'procurement' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
          >
            Procurement & Spend Analytics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('production')}
            className={`erp-btn ${activeTab === 'production' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
          >
            Production & Equipment Efficiency (OEE)
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
            Generating executive analytics...
          </div>
        ) : (
          <>
            {/* Tab 1: Financial Performance */}
            {activeTab === 'financial' && financial && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                    Income Statement Breakdown ({financial.period})
                  </h4>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Generated: {new Date(financial.generatedAt).toLocaleString()}
                  </span>
                </div>

                <div className="erp-stats-grid">
                  <div className="erp-stat-card">
                    <div className="erp-stat-header">Total Revenue</div>
                    <div className="erp-stat-value">${financial.totalRevenue.toLocaleString()}</div>
                    <div className="erp-stat-footer">Gross invoiced billings</div>
                  </div>

                  <div className="erp-stat-card">
                    <div className="erp-stat-header">Cost of Goods Sold (COGS)</div>
                    <div className="erp-stat-value">${financial.costOfGoodsSold.toLocaleString()}</div>
                    <div className="erp-stat-footer">Direct material & labor cost</div>
                  </div>

                  <div className="erp-stat-card">
                    <div className="erp-stat-header">Gross Margin</div>
                    <div className="erp-stat-value" style={{ color: '#10b981' }}>
                      {financial.grossMarginPercent}%
                    </div>
                    <div className="erp-stat-footer">Operating profitability</div>
                  </div>

                  <div className="erp-stat-card">
                    <div className="erp-stat-header">Operating Expenses (OPEX)</div>
                    <div className="erp-stat-value">${financial.operatingExpenses.toLocaleString()}</div>
                    <div className="erp-stat-footer">Overhead & administrative</div>
                  </div>

                  <div className="erp-stat-card" style={{ gridColumn: 'span 2' }}>
                    <div className="erp-stat-header">Net Net Income</div>
                    <div className="erp-stat-value" style={{ color: '#047857' }}>
                      ${financial.netIncome.toLocaleString()}
                    </div>
                    <div className="erp-stat-footer">Final retained bottom line earnings</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Procurement Spend */}
            {activeTab === 'procurement' && procurement && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                    Vendor Spend Distribution ({procurement.period})
                  </h4>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Total PO Spend: <strong>${procurement.totalPoSpend.toLocaleString()}</strong>
                  </span>
                </div>

                <div className="erp-table-responsive">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Supplier Organization</th>
                        <th>Cumulative Spend</th>
                        <th>% of Total Spend</th>
                        <th>On-Time Delivery Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {procurement.topSuppliers.map((s, idx) => {
                        const pct =
                          procurement.totalPoSpend > 0
                            ? Math.round((s.spend / procurement.totalPoSpend) * 100)
                            : 0;
                        return (
                          <tr key={idx}>
                            <td>
                              <strong>{s.supplier}</strong>
                            </td>
                            <td>${s.spend.toLocaleString()}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div className="erp-progress-track" style={{ width: 100 }}>
                                  <div className="erp-progress-bar" style={{ width: `${pct}%`, backgroundColor: '#3b82f6' }} />
                                </div>
                                <span style={{ fontSize: 12 }}>{pct}%</span>
                              </div>
                            </td>
                            <td>
                              <span className="erp-badge erp-badge-success">{s.onTimeDelivery}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Production & OEE */}
            {activeTab === 'production' && production && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                    Overall Equipment Effectiveness ({production.period})
                  </h4>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Generated: {new Date(production.generatedAt).toLocaleString()}
                  </span>
                </div>

                <div className="erp-stats-grid">
                  <div className="erp-stat-card">
                    <div className="erp-stat-header">OEE Score</div>
                    <div className="erp-stat-value" style={{ color: production.overallEquipmentEffectiveness >= 85 ? '#10b981' : '#f59e0b' }}>
                      {production.overallEquipmentEffectiveness}%
                    </div>
                    <div className="erp-stat-footer">World-class benchmark &gt; 85%</div>
                  </div>

                  <div className="erp-stat-card">
                    <div className="erp-stat-header">Total Units Produced</div>
                    <div className="erp-stat-value">{production.totalUnitsProduced.toLocaleString()}</div>
                    <div className="erp-stat-footer">Net accepted finished goods</div>
                  </div>

                  <div className="erp-stat-card">
                    <div className="erp-stat-header">Scrap Rate</div>
                    <div className="erp-stat-value" style={{ color: production.scrapRatePercent > 3 ? '#ef4444' : '#10b981' }}>
                      {production.scrapRatePercent}%
                    </div>
                    <div className="erp-stat-footer">Defect / scrap yield ratio</div>
                  </div>

                  <div className="erp-stat-card">
                    <div className="erp-stat-header">Line Downtime</div>
                    <div className="erp-stat-value">{production.downtimeHours} hrs</div>
                    <div className="erp-stat-footer">Unplanned maintenance & setup</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ErpLayout>
  );
};
