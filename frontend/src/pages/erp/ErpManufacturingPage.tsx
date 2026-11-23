import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ErpLayout } from './ErpLayout';
import { erpService } from '../../services/erp.service';
import type { ManufacturingWorkOrder, BillOfMaterial, CreateWorkOrderPayload } from '../../types/erp.types';
import { PlusIcon, SearchIcon, RefreshCwIcon } from '../../components/common/Icons';

export const ErpManufacturingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'work-orders' | 'bom'>('work-orders');
  const [workOrders, setWorkOrders] = useState<ManufacturingWorkOrder[]>([]);
  const [bomList, setBomList] = useState<BillOfMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  // Create Work Order Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newOrder, setNewOrder] = useState<CreateWorkOrderPayload>({
    orderNumber: '',
    productName: '',
    quantityTarget: 500,
    quantityCompleted: 0,
    status: 'SCHEDULED',
    productionLine: 'Line 1 - Automated Assembly',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [woRes, bomRes] = await Promise.all([
        erpService.getWorkOrders(),
        erpService.getBillOfMaterials(),
      ]);
      const woList = (woRes as any)?.data || (Array.isArray(woRes) ? woRes : []);
      const boms = (bomRes as any)?.data || (Array.isArray(bomRes) ? bomRes : []);
      setWorkOrders(woList);
      setBomList(boms);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load manufacturing data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(
      (wo) =>
        (wo.orderNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (wo.productName || '').toLowerCase().includes(search.toLowerCase()) ||
        (wo.productionLine || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [workOrders, search]);

  const filteredBoms = useMemo(() => {
    return bomList.filter(
      (b) =>
        (b.bomCode || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.assemblyName || b.productName || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [bomList, search]);

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.productName.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await erpService.createWorkOrder(newOrder);
      setSuccess(`Work Order scheduled successfully.`);
      setShowModal(false);
      setNewOrder({
        orderNumber: '',
        productName: '',
        quantityTarget: 500,
        quantityCompleted: 0,
        status: 'SCHEDULED',
        productionLine: 'Line 1 - Automated Assembly',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: '',
      });
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to schedule work order');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="erp-badge erp-badge-success">COMPLETED</span>;
      case 'IN_PRODUCTION':
        return <span className="erp-badge erp-badge-info">IN PRODUCTION</span>;
      case 'ON_HOLD':
        return <span className="erp-badge erp-badge-danger">ON HOLD</span>;
      default:
        return <span className="erp-badge erp-badge-warning">SCHEDULED</span>;
    }
  };

  return (
    <ErpLayout
      title="Manufacturing & Production Control"
      subtitle="Shop-floor work orders, bill of materials (BOM), assembly queues, and production run yields"
      activeTab="manufacturing"
      error={error}
      success={success}
      onDismissError={() => setError(null)}
      onDismissSuccess={() => setSuccess(null)}
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="erp-btn erp-btn-secondary"
          >
            <RefreshCwIcon size={16} className={loading ? 'erp-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="erp-btn erp-btn-primary"
          >
            <PlusIcon size={16} />
            <span>Schedule Work Order</span>
          </button>
        </div>
      }
    >
      <div className="erp-card">
        {/* Module Sub-tabs */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setActiveTab('work-orders')}
            className={`erp-btn ${activeTab === 'work-orders' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
          >
            Work Orders ({workOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bom')}
            className={`erp-btn ${activeTab === 'bom' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
          >
            Bill of Materials (BOM) ({bomList.length})
          </button>
        </div>

        {/* Filter bar */}
        <div className="erp-filter-bar">
          <div className="erp-search-wrap">
            <SearchIcon size={16} className="erp-search-icon" />
            <input
              type="text"
              placeholder={activeTab === 'work-orders' ? 'Search work orders by code, product, line...' : 'Search BOMs by code or product...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-input erp-search-input"
            />
          </div>
        </div>

        {/* Tab 1: Work Orders Table */}
        {activeTab === 'work-orders' && (
          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Product Assembly</th>
                  <th>Production Line</th>
                  <th>Status</th>
                  <th>Output Progress</th>
                  <th>Start Date</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="erp-empty-cell">
                      Loading work orders...
                    </td>
                  </tr>
                ) : filteredWorkOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="erp-empty-cell">
                      No work orders found.
                    </td>
                  </tr>
                ) : (
                  filteredWorkOrders.map((wo) => {
                    const percent =
                      wo.quantityTarget > 0
                        ? Math.min(Math.round((wo.quantityCompleted / wo.quantityTarget) * 100), 100)
                        : 0;

                    return (
                      <tr key={wo.id}>
                        <td>
                          <strong>{wo.orderNumber}</strong>
                        </td>
                        <td>
                          <strong>{wo.productName}</strong>
                          {wo.notes && (
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{wo.notes}</div>
                          )}
                        </td>
                        <td>
                          <span className="erp-badge erp-badge-neutral">{wo.productionLine}</span>
                        </td>
                        <td>{getStatusBadge(wo.status)}</td>
                        <td>
                          <div style={{ minWidth: 160 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                              <span>{wo.quantityCompleted} / {wo.quantityTarget} units</span>
                              <span>{percent}%</span>
                            </div>
                            <div className="erp-progress-track">
                              <div
                                className="erp-progress-bar"
                                style={{
                                  width: `${percent}%`,
                                  backgroundColor: percent === 100 ? '#10b981' : '#3b82f6',
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>{new Date(wo.startDate).toLocaleDateString()}</td>
                        <td>{wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : 'Open'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: BOM Table */}
        {activeTab === 'bom' && (
          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>BOM Code</th>
                  <th>Assembly / Product</th>
                  <th>Revision</th>
                  <th>Components</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="erp-empty-cell">
                      Loading BOM configurations...
                    </td>
                  </tr>
                ) : filteredBoms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="erp-empty-cell">
                      No bill of materials found.
                    </td>
                  </tr>
                ) : (
                  filteredBoms.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <code>{b.bomCode}</code>
                      </td>
                      <td>
                        <strong>{b.assemblyName || b.productName || 'Subassembly'}</strong>
                      </td>
                      <td>
                        <span className="erp-badge erp-badge-neutral">{b.version || b.revision || 'v1.0'}</span>
                      </td>
                      <td>
                        {b.components && b.components.length > 0 ? (
                          <div style={{ fontSize: 12.5 }}>
                            {b.components.map((c) => `${c.componentName} (${c.qtyPerUnit ?? c.quantityRequired ?? 1} ${c.unit || 'pcs'})`).join(', ')}
                          </div>
                        ) : (
                          'Components configured'
                        )}
                      </td>
                      <td>
                        <span className="erp-badge erp-badge-success">{b.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Work Order Modal */}
      {showModal && (
        <div className="erp-modal-overlay">
          <div className="erp-modal">
            <div className="erp-modal-header">
              <h3 className="erp-modal-title">Schedule Manufacturing Work Order</h3>
              <button
                type="button"
                className="erp-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateWorkOrder}>
              <div className="erp-modal-body">
                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Order Number (Auto if blank)</label>
                    <input
                      type="text"
                      value={newOrder.orderNumber}
                      onChange={(e) => setNewOrder({ ...newOrder, orderNumber: e.target.value })}
                      placeholder="WO-2026-XXXX"
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={newOrder.productName}
                      onChange={(e) => setNewOrder({ ...newOrder, productName: e.target.value })}
                      placeholder="e.g. Precision Sensor Unit V4"
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Production Line</label>
                    <input
                      type="text"
                      value={newOrder.productionLine}
                      onChange={(e) => setNewOrder({ ...newOrder, productionLine: e.target.value })}
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Target Quantity (Units)</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={newOrder.quantityTarget}
                      onChange={(e) => setNewOrder({ ...newOrder, quantityTarget: Number(e.target.value) })}
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Start Date</label>
                    <input
                      type="date"
                      value={newOrder.startDate}
                      onChange={(e) => setNewOrder({ ...newOrder, startDate: e.target.value })}
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Target Due Date</label>
                    <input
                      type="date"
                      value={newOrder.dueDate}
                      onChange={(e) => setNewOrder({ ...newOrder, dueDate: e.target.value })}
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="erp-form-group">
                  <label className="erp-label">Production Notes</label>
                  <textarea
                    rows={2}
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                    placeholder="Assembly instructions, calibration requirements..."
                    className="erp-textarea"
                  />
                </div>
              </div>
              <div className="erp-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="erp-btn erp-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="erp-btn erp-btn-primary"
                >
                  {submitting ? 'Scheduling...' : 'Schedule Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpLayout>
  );
};
