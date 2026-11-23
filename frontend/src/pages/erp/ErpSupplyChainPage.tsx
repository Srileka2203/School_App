import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ErpLayout } from './ErpLayout';
import { erpService } from '../../services/erp.service';
import type { InventoryItem, LogisticsShipment, CreateShipmentPayload } from '../../types/erp.types';
import { PlusIcon, SearchIcon, RefreshCwIcon } from '../../components/common/Icons';

export const ErpSupplyChainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'shipments'>('inventory');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [shipments, setShipments] = useState<LogisticsShipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  // Create Shipment Modal
  const [showShipmentModal, setShowShipmentModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newShipment, setNewShipment] = useState<CreateShipmentPayload>({
    trackingNumber: '',
    carrier: 'DHL_EXPRESS',
    origin: 'Central DC (Austin, TX)',
    destination: '',
    status: 'IN_TRANSIT',
    estimatedArrival: '',
    notes: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [invRes, shipRes] = await Promise.all([
        erpService.getInventory(),
        erpService.getShipments(),
      ]);
      const invList = (invRes as any)?.data || (Array.isArray(invRes) ? invRes : []);
      const shipList = (shipRes as any)?.data || (Array.isArray(shipRes) ? shipRes : []);
      setInventory(invList);
      setShipments(shipList);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load supply chain data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(
      (item) =>
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.warehouseLocation.toLowerCase().includes(search.toLowerCase())
    );
  }, [inventory, search]);

  const filteredShipments = useMemo(() => {
    return shipments.filter(
      (s) =>
        s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.carrier.toLowerCase().includes(search.toLowerCase()) ||
        s.destination.toLowerCase().includes(search.toLowerCase())
    );
  }, [shipments, search]);

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShipment.destination.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await erpService.createShipment(newShipment);
      setSuccess(`Shipment created successfully.`);
      setShowShipmentModal(false);
      setNewShipment({
        trackingNumber: '',
        carrier: 'DHL_EXPRESS',
        origin: 'Central DC (Austin, TX)',
        destination: '',
        status: 'IN_TRANSIT',
        estimatedArrival: '',
        notes: '',
      });
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to dispatch shipment');
    } finally {
      setSubmitting(false);
    }
  };

  const getInventoryStatusBadge = (status: string) => {
    switch (status) {
      case 'OPTIMAL':
        return <span className="erp-badge erp-badge-success">OPTIMAL</span>;
      case 'LOW_STOCK':
        return <span className="erp-badge erp-badge-warning">LOW STOCK</span>;
      case 'CRITICAL':
        return <span className="erp-badge erp-badge-danger">CRITICAL</span>;
      case 'OVERSTOCK':
        return <span className="erp-badge erp-badge-info">OVERSTOCK</span>;
      default:
        return <span className="erp-badge erp-badge-neutral">{status}</span>;
    }
  };

  const getShipmentStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="erp-badge erp-badge-success">DELIVERED</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="erp-badge erp-badge-info">OUT FOR DELIVERY</span>;
      case 'IN_TRANSIT':
        return <span className="erp-badge erp-badge-warning">IN TRANSIT</span>;
      default:
        return <span className="erp-badge erp-badge-neutral">{status}</span>;
    }
  };

  return (
    <ErpLayout
      title="Supply Chain & Logistics"
      subtitle="Monitor multi-warehouse inventory levels, reorder triggers, dispatch logistics, and carrier tracking"
      activeTab="supply-chain"
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
            onClick={() => setShowShipmentModal(true)}
            className="erp-btn erp-btn-primary"
          >
            <PlusIcon size={16} />
            <span>Dispatch Shipment</span>
          </button>
        </div>
      }
    >
      <div className="erp-card">
        {/* Module Sub-tabs */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`erp-btn ${activeTab === 'inventory' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
          >
            Warehouse Inventory ({inventory.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shipments')}
            className={`erp-btn ${activeTab === 'shipments' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
          >
            Logistics & Shipments ({shipments.length})
          </button>
        </div>

        {/* Filter bar */}
        <div className="erp-filter-bar">
          <div className="erp-search-wrap">
            <SearchIcon size={16} className="erp-search-icon" />
            <input
              type="text"
              placeholder={activeTab === 'inventory' ? 'Search inventory by SKU, name, or aisle...' : 'Search shipments by tracking #, carrier, or destination...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-input erp-search-input"
            />
          </div>
        </div>

        {/* Tab 1: Inventory Table */}
        {activeTab === 'inventory' && (
          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product / Component</th>
                  <th>Location</th>
                  <th>Quantity on Hand</th>
                  <th>Reorder Level</th>
                  <th>Unit Cost</th>
                  <th>Stock Health</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="erp-empty-cell">
                      Loading inventory...
                    </td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="erp-empty-cell">
                      No inventory items found.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <code>{item.sku}</code>
                      </td>
                      <td>
                        <strong>{item.name}</strong>
                        {item.description && (
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{item.description}</div>
                        )}
                      </td>
                      <td>{item.warehouseLocation}</td>
                      <td>
                        <strong>{item.quantityOnHand}</strong> {item.unitOfMeasure}
                      </td>
                      <td>{item.reorderLevel} {item.unitOfMeasure}</td>
                      <td>${item.unitPrice.toFixed(2)}</td>
                      <td>{getInventoryStatusBadge(item.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Shipments Table */}
        {activeTab === 'shipments' && (
          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Tracking Number</th>
                  <th>Carrier</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Est. Arrival</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="erp-empty-cell">
                      Loading shipments...
                    </td>
                  </tr>
                ) : filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="erp-empty-cell">
                      No active shipments found.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.trackingNumber}</strong>
                      </td>
                      <td>
                        <span className="erp-badge erp-badge-neutral">{s.carrier}</span>
                      </td>
                      <td>{s.origin}</td>
                      <td>{s.destination}</td>
                      <td>{getShipmentStatusBadge(s.status)}</td>
                      <td>{s.estimatedArrival ? new Date(s.estimatedArrival).toLocaleDateString() : '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{s.notes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch Shipment Modal */}
      {showShipmentModal && (
        <div className="erp-modal-overlay">
          <div className="erp-modal">
            <div className="erp-modal-header">
              <h3 className="erp-modal-title">Dispatch Logistics Shipment</h3>
              <button
                type="button"
                className="erp-modal-close"
                onClick={() => setShowShipmentModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateShipment}>
              <div className="erp-modal-body">
                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Tracking Number (Auto if blank)</label>
                    <input
                      type="text"
                      value={newShipment.trackingNumber}
                      onChange={(e) => setNewShipment({ ...newShipment, trackingNumber: e.target.value })}
                      placeholder="TRK-XXXX-2026"
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Carrier</label>
                    <select
                      value={newShipment.carrier}
                      onChange={(e) => setNewShipment({ ...newShipment, carrier: e.target.value })}
                      className="erp-select"
                    >
                      <option value="DHL_EXPRESS">DHL Express</option>
                      <option value="FEDEX_FREIGHT">FedEx Freight</option>
                      <option value="UPS_SUPPLY_CHAIN">UPS Supply Chain</option>
                      <option value="MAERSK_LOGISTICS">Maersk Logistics</option>
                    </select>
                  </div>
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Origin Facility</label>
                    <input
                      type="text"
                      value={newShipment.origin}
                      onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })}
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Destination Facility / Customer *</label>
                    <input
                      type="text"
                      required
                      value={newShipment.destination}
                      onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                      placeholder="e.g. West Coast Fulfillment Center, Seattle WA"
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Estimated Arrival</label>
                    <input
                      type="date"
                      value={newShipment.estimatedArrival}
                      onChange={(e) => setNewShipment({ ...newShipment, estimatedArrival: e.target.value })}
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Status</label>
                    <select
                      value={newShipment.status}
                      onChange={(e) => setNewShipment({ ...newShipment, status: e.target.value })}
                      className="erp-select"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_TRANSIT">IN_TRANSIT</option>
                      <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                    </select>
                  </div>
                </div>

                <div className="erp-form-group">
                  <label className="erp-label">Dispatch Notes</label>
                  <textarea
                    rows={2}
                    value={newShipment.notes}
                    onChange={(e) => setNewShipment({ ...newShipment, notes: e.target.value })}
                    placeholder="Consignment specs, pallet IDs..."
                    className="erp-textarea"
                  />
                </div>
              </div>
              <div className="erp-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowShipmentModal(false)}
                  className="erp-btn erp-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="erp-btn erp-btn-primary"
                >
                  {submitting ? 'Dispatching...' : 'Dispatch Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpLayout>
  );
};
