import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ErpLayout } from './ErpLayout';
import { erpService } from '../../services/erp.service';
import type { PurchaseOrder, Vendor, CreatePurchaseOrderPayload } from '../../types/erp.types';
import { PlusIcon, SearchIcon, RefreshCwIcon } from '../../components/common/Icons';

export const ErpProcurementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'vendors'>('orders');
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Create PO Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newPo, setNewPo] = useState<CreatePurchaseOrderPayload>({
    poNumber: '',
    vendorName: '',
    totalAmount: 5000,
    currency: 'USD',
    status: 'SUBMITTED',
    expectedDelivery: '',
    lineItemsCount: 1,
    notes: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordersRes, vendorsRes] = await Promise.all([
        erpService.getPurchaseOrders(),
        erpService.getVendors(),
      ]);
      const ordersList = (ordersRes as any)?.data || (Array.isArray(ordersRes) ? ordersRes : []);
      const vendorsList = (vendorsRes as any)?.data || (Array.isArray(vendorsRes) ? vendorsRes : []);
      setOrders(ordersList);
      setVendors(vendorsList);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load procurement data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredOrders = useMemo(() => {
    return orders.filter((po) => {
      const poNum = po.poNumber || '';
      const vName = po.vendorName || (po.vendor as any)?.name || '';
      const matchSearch =
        poNum.toLowerCase().includes(search.toLowerCase()) ||
        vName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || po.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) =>
      (v.name || '').toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase()) ||
      v.phone?.toLowerCase().includes(search.toLowerCase())
    );
  }, [vendors, search]);

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPo.vendorName.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await erpService.createPurchaseOrder(newPo);
      setSuccess(`Purchase Order created successfully.`);
      setShowModal(false);
      setNewPo({
        poNumber: '',
        vendorName: '',
        totalAmount: 5000,
        currency: 'USD',
        status: 'SUBMITTED',
        expectedDelivery: '',
        lineItemsCount: 1,
        notes: '',
      });
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  const getPoStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
      case 'APPROVED':
        return <span className="erp-badge erp-badge-success">{status}</span>;
      case 'CANCELLED':
        return <span className="erp-badge erp-badge-danger">{status}</span>;
      case 'SUBMITTED':
        return <span className="erp-badge erp-badge-info">{status}</span>;
      default:
        return <span className="erp-badge erp-badge-warning">{status}</span>;
    }
  };

  const getVendorStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="erp-badge erp-badge-success">ACTIVE</span>;
      case 'BLOCKED':
        return <span className="erp-badge erp-badge-danger">BLOCKED</span>;
      default:
        return <span className="erp-badge erp-badge-neutral">{status}</span>;
    }
  };

  return (
    <ErpLayout
      title="Procurement & Vendor Management"
      subtitle="Issue purchase requisitions, manage commercial vendor directories, and audit PO fulfillment"
      activeTab="procurement"
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
            <span>Create Purchase Order</span>
          </button>
        </div>
      }
    >
      <div className="erp-card">
        {/* Module Sub-tabs */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`erp-btn ${activeTab === 'orders' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
          >
            Purchase Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vendors')}
            className={`erp-btn ${activeTab === 'vendors' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
          >
            Vendor Directory ({vendors.length})
          </button>
        </div>

        {/* Filter bar */}
        <div className="erp-filter-bar">
          <div className="erp-search-wrap">
            <SearchIcon size={16} className="erp-search-icon" />
            <input
              type="text"
              placeholder={activeTab === 'orders' ? 'Search POs by number or vendor...' : 'Search vendors by name, email or phone...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-input erp-search-input"
            />
          </div>

          {activeTab === 'orders' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="erp-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="RECEIVED">RECEIVED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          )}
        </div>

        {/* Tab 1: Orders Table */}
        {activeTab === 'orders' && (
          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Order Date</th>
                  <th>Expected Delivery</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="erp-empty-cell">
                      Loading purchase orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="erp-empty-cell">
                      No purchase orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((po) => (
                    <tr key={po.id}>
                      <td>
                        <strong>{po.poNumber}</strong>
                      </td>
                      <td>{po.vendorName}</td>
                      <td>
                        <strong>${po.totalAmount.toLocaleString()}</strong> <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{po.currency}</span>
                      </td>
                      <td>{po.lineItemsCount} items</td>
                      <td>{getPoStatusBadge(po.status)}</td>
                      <td>{new Date(po.orderDate).toLocaleDateString()}</td>
                      <td>{po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : 'TBD'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Vendors Table */}
        {activeTab === 'vendors' && (
          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Vendor Organization</th>
                  <th>Contact Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Rating</th>
                  <th>Contracts</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="erp-empty-cell">
                      Loading vendor directory...
                    </td>
                  </tr>
                ) : filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="erp-empty-cell">
                      No vendors found.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <strong>{v.name}</strong>
                      </td>
                      <td>{v.email || '—'}</td>
                      <td>{v.phone || '—'}</td>
                      <td>{v.address || '—'}</td>
                      <td>
                        <span style={{ color: '#d97706', fontWeight: 600 }}>★ {v.rating}</span> / 5.0
                      </td>
                      <td>{v.activeContracts} active</td>
                      <td>{getVendorStatusBadge(v.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create PO Modal */}
      {showModal && (
        <div className="erp-modal-overlay">
          <div className="erp-modal">
            <div className="erp-modal-header">
              <h3 className="erp-modal-title">Create Purchase Order</h3>
              <button
                type="button"
                className="erp-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreatePo}>
              <div className="erp-modal-body">
                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">PO Number (Optional, auto-generated)</label>
                    <input
                      type="text"
                      value={newPo.poNumber}
                      onChange={(e) => setNewPo({ ...newPo, poNumber: e.target.value })}
                      placeholder="PO-2026-XXXX"
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Vendor Name *</label>
                    <input
                      type="text"
                      required
                      value={newPo.vendorName}
                      onChange={(e) => setNewPo({ ...newPo, vendorName: e.target.value })}
                      placeholder="e.g. Apex Industrial Components Ltd."
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Total Amount ($)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      required
                      value={newPo.totalAmount}
                      onChange={(e) => setNewPo({ ...newPo, totalAmount: Number(e.target.value) })}
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Line Items Count</label>
                    <input
                      type="number"
                      min={1}
                      value={newPo.lineItemsCount}
                      onChange={(e) => setNewPo({ ...newPo, lineItemsCount: Number(e.target.value) })}
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Expected Delivery Date</label>
                    <input
                      type="date"
                      value={newPo.expectedDelivery}
                      onChange={(e) => setNewPo({ ...newPo, expectedDelivery: e.target.value })}
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Status</label>
                    <select
                      value={newPo.status}
                      onChange={(e) => setNewPo({ ...newPo, status: e.target.value })}
                      className="erp-select"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="SUBMITTED">SUBMITTED</option>
                      <option value="APPROVED">APPROVED</option>
                    </select>
                  </div>
                </div>

                <div className="erp-form-group">
                  <label className="erp-label">Notes & Specifications</label>
                  <textarea
                    rows={2}
                    value={newPo.notes}
                    onChange={(e) => setNewPo({ ...newPo, notes: e.target.value })}
                    placeholder="Enter delivery specifications, FOB terms..."
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
                  {submitting ? 'Creating...' : 'Issue Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpLayout>
  );
};
