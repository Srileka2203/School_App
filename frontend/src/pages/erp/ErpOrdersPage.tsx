import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ErpLayout } from './ErpLayout';
import { erpService } from '../../services/erp.service';
import type { ErpSalesOrder, CreateSalesOrderPayload } from '../../types/erp.types';
import { PlusIcon, SearchIcon, RefreshCwIcon } from '../../components/common/Icons';

export const ErpOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<ErpSalesOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Create Order Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newOrder, setNewOrder] = useState<CreateSalesOrderPayload>({
    orderNumber: '',
    customerName: '',
    orderTotal: 1200,
    currency: 'USD',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    lineItemsCount: 1,
    shippingAddress: '',
  });

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await erpService.getSalesOrders();
      setOrders(res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch sales orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customerName.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await erpService.createSalesOrder(newOrder);
      setSuccess(`Sales order for "${newOrder.customerName}" created successfully.`);
      setShowModal(false);
      setNewOrder({
        orderNumber: '',
        customerName: '',
        orderTotal: 1200,
        currency: 'USD',
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        lineItemsCount: 1,
        shippingAddress: '',
      });
      loadOrders();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create sales order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await erpService.updateOrderStatus(id, newStatus);
      setSuccess(`Order status updated to ${newStatus}.`);
      loadOrders();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update order status');
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="erp-badge erp-badge-success">PAID</span>;
      case 'PARTIAL':
        return <span className="erp-badge erp-badge-warning">PARTIAL</span>;
      default:
        return <span className="erp-badge erp-badge-danger">UNPAID</span>;
    }
  };

  return (
    <ErpLayout
      title="Sales Order Management"
      subtitle="Track customer order lifecycles, payment captures, fulfillment queues, and dispatch handoffs"
      activeTab="orders"
      error={error}
      success={success}
      onDismissError={() => setError(null)}
      onDismissSuccess={() => setSuccess(null)}
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={loadOrders}
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
            <span>New Sales Order</span>
          </button>
        </div>
      }
    >
      <div className="erp-card">
        {/* Filter bar */}
        <div className="erp-filter-bar">
          <div className="erp-search-wrap">
            <SearchIcon size={16} className="erp-search-icon" />
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-input erp-search-input"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="erp-select"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="FULFILLED">FULFILLED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Table */}
        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer Name</th>
                <th>Order Total</th>
                <th>Payment</th>
                <th>Fulfillment Status</th>
                <th>Items</th>
                <th>Date Placed</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="erp-empty-cell">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="erp-empty-cell">
                    No sales orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong>{o.orderNumber}</strong>
                    </td>
                    <td>{o.customerName}</td>
                    <td>
                      <strong>${o.orderTotal.toLocaleString()}</strong> <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{o.currency}</span>
                    </td>
                    <td>{getPaymentBadge(o.paymentStatus)}</td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                        className="erp-select"
                        style={{ padding: '3px 8px', fontSize: 12.5 }}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="FULFILLED">FULFILLED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td>{o.lineItemsCount} items</td>
                    <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="erp-modal-overlay">
          <div className="erp-modal">
            <div className="erp-modal-header">
              <h3 className="erp-modal-title">Create Sales Order</h3>
              <button
                type="button"
                className="erp-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateOrder}>
              <div className="erp-modal-body">
                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Order Number (Optional, auto-generated)</label>
                    <input
                      type="text"
                      value={newOrder.orderNumber}
                      onChange={(e) => setNewOrder({ ...newOrder, orderNumber: e.target.value })}
                      placeholder="SO-2026-XXXX"
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={newOrder.customerName}
                      onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                      placeholder="e.g. Acme Enterprises Corp"
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Order Total ($)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      required
                      value={newOrder.orderTotal}
                      onChange={(e) => setNewOrder({ ...newOrder, orderTotal: Number(e.target.value) })}
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Payment Status</label>
                    <select
                      value={newOrder.paymentStatus}
                      onChange={(e) => setNewOrder({ ...newOrder, paymentStatus: e.target.value })}
                      className="erp-select"
                    >
                      <option value="PAID">PAID</option>
                      <option value="UNPAID">UNPAID</option>
                      <option value="PARTIAL">PARTIAL</option>
                    </select>
                  </div>
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Initial Fulfillment Status</label>
                    <select
                      value={newOrder.status}
                      onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                      className="erp-select"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                    </select>
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Item Count</label>
                    <input
                      type="number"
                      min={1}
                      value={newOrder.lineItemsCount}
                      onChange={(e) => setNewOrder({ ...newOrder, lineItemsCount: Number(e.target.value) })}
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="erp-form-group">
                  <label className="erp-label">Shipping Address</label>
                  <textarea
                    rows={2}
                    value={newOrder.shippingAddress}
                    onChange={(e) => setNewOrder({ ...newOrder, shippingAddress: e.target.value })}
                    placeholder="Destination address..."
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
                  {submitting ? 'Creating...' : 'Create Sales Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpLayout>
  );
};
