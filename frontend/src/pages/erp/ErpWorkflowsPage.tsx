import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ErpLayout } from './ErpLayout';
import { erpService } from '../../services/erp.service';
import type { BusinessWorkflow, CreateWorkflowPayload } from '../../types/erp.types';
import { PlusIcon, SearchIcon, TrashIcon, RefreshCwIcon } from '../../components/common/Icons';

export const ErpWorkflowsPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<BusinessWorkflow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newWorkflow, setNewWorkflow] = useState<CreateWorkflowPayload>({
    name: '',
    category: 'PROCUREMENT',
    trigger: 'ON_ORDER_SUBMITTED',
    stepsCount: 3,
    status: 'ACTIVE',
  });

  const loadWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await erpService.getWorkflows();
      setWorkflows((res as any)?.data || (Array.isArray(res) ? res : []));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch business workflows');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    workflows.forEach((w) => {
      if (w.category) set.add(w.category);
    });
    return Array.from(set);
  }, [workflows]);

  const filteredWorkflows = useMemo(() => {
    return workflows.filter((w) => {
      const matchSearch =
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.trigger?.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'ALL' || w.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [workflows, search, filterCategory]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflow.name.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await erpService.createWorkflow(newWorkflow);
      setSuccess(`Workflow "${newWorkflow.name}" created successfully.`);
      setShowModal(false);
      setNewWorkflow({
        name: '',
        category: 'PROCUREMENT',
        trigger: 'ON_ORDER_SUBMITTED',
        stepsCount: 3,
        status: 'ACTIVE',
      });
      loadWorkflows();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create workflow');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete workflow "${name}"?`)) return;
    try {
      await erpService.deleteWorkflow(id);
      setSuccess(`Workflow "${name}" deleted.`);
      loadWorkflows();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to delete workflow');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="erp-badge erp-badge-success">ACTIVE</span>;
      case 'INACTIVE':
        return <span className="erp-badge erp-badge-neutral">INACTIVE</span>;
      default:
        return <span className="erp-badge erp-badge-warning">{status}</span>;
    }
  };

  return (
    <ErpLayout
      title="Business Workflows"
      subtitle="Automate approvals, notifications, status handoffs, and external system syncs"
      activeTab="workflows"
      error={error}
      success={success}
      onDismissError={() => setError(null)}
      onDismissSuccess={() => setSuccess(null)}
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={loadWorkflows}
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
            <span>Create Workflow</span>
          </button>
        </div>
      }
    >
      <div className="erp-card">
        {/* Search & Filter Toolbar */}
        <div className="erp-filter-bar">
          <div className="erp-search-wrap">
            <SearchIcon size={16} className="erp-search-icon" />
            <input
              type="text"
              placeholder="Search workflows by title or trigger..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-input erp-search-input"
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="erp-select"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Workflows Table */}
        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Workflow Name</th>
                <th>Category</th>
                <th>Trigger Event</th>
                <th>Steps</th>
                <th>Status</th>
                <th>Last Executed</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="erp-empty-cell">
                    Loading workflows...
                  </td>
                </tr>
              ) : filteredWorkflows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="erp-empty-cell">
                    No workflows found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredWorkflows.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>
                      <span className="erp-badge erp-badge-neutral">{item.category}</span>
                    </td>
                    <td>
                      <code>{item.trigger}</code>
                    </td>
                    <td>{item.stepsCount} steps</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                      {item.lastExecutedAt
                        ? new Date(item.lastExecutedAt).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.name)}
                        className="erp-btn-icon erp-btn-icon-danger"
                        title="Delete workflow"
                      >
                        <TrashIcon size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Workflow Modal */}
      {showModal && (
        <div className="erp-modal-overlay">
          <div className="erp-modal">
            <div className="erp-modal-header">
              <h3 className="erp-modal-title">New Business Workflow</h3>
              <button
                type="button"
                className="erp-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="erp-modal-body">
                <div className="erp-form-group">
                  <label className="erp-label">Workflow Name *</label>
                  <input
                    type="text"
                    required
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                    placeholder="e.g. High Value Purchase Order Approval"
                    className="erp-input"
                  />
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Category</label>
                    <input
                      type="text"
                      value={newWorkflow.category}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, category: e.target.value })}
                      placeholder="e.g. PROCUREMENT, FINANCE, LOGISTICS"
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Steps Count</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newWorkflow.stepsCount}
                      onChange={(e) =>
                        setNewWorkflow({ ...newWorkflow, stepsCount: Number(e.target.value) })
                      }
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Trigger Event</label>
                    <select
                      value={newWorkflow.trigger}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, trigger: e.target.value })}
                      className="erp-select"
                    >
                      <option value="ON_ORDER_SUBMITTED">ON_ORDER_SUBMITTED</option>
                      <option value="ON_INVOICE_GENERATED">ON_INVOICE_GENERATED</option>
                      <option value="ON_STOCK_LOW">ON_STOCK_LOW</option>
                      <option value="ON_QA_FAILURE">ON_QA_FAILURE</option>
                      <option value="MANUAL_DISPATCH">MANUAL_DISPATCH</option>
                    </select>
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Initial Status</label>
                    <select
                      value={newWorkflow.status}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, status: e.target.value })}
                      className="erp-select"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="DRAFT">DRAFT</option>
                    </select>
                  </div>
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
                  {submitting ? 'Creating...' : 'Create Workflow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpLayout>
  );
};
