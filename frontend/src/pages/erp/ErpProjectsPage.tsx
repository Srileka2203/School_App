import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ErpLayout } from './ErpLayout';
import { erpService } from '../../services/erp.service';
import type { ErpProject, CreateProjectPayload } from '../../types/erp.types';
import { PlusIcon, SearchIcon, RefreshCwIcon } from '../../components/common/Icons';

export const ErpProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ErpProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Create Project Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newProject, setNewProject] = useState<CreateProjectPayload>({
    projectCode: '',
    name: '',
    client: '',
    status: 'PLANNING',
    budgetTotal: 50000,
    spentTotal: 0,
    startDate: new Date().toISOString().split('T')[0],
    targetEndDate: '',
    milestonesCount: 3,
  });

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await erpService.getProjects();
      setProjects((res as any)?.data || (Array.isArray(res) ? res : []));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.projectCode.toLowerCase().includes(search.toLowerCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.client.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projects, search, statusFilter]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await erpService.createProject(newProject);
      setSuccess(`Project "${newProject.name}" created successfully.`);
      setShowModal(false);
      setNewProject({
        projectCode: '',
        name: '',
        client: '',
        status: 'PLANNING',
        budgetTotal: 50000,
        spentTotal: 0,
        startDate: new Date().toISOString().split('T')[0],
        targetEndDate: '',
        milestonesCount: 3,
      });
      loadProjects();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="erp-badge erp-badge-success">COMPLETED</span>;
      case 'IN_PROGRESS':
        return <span className="erp-badge erp-badge-info">IN PROGRESS</span>;
      case 'ON_HOLD':
        return <span className="erp-badge erp-badge-danger">ON HOLD</span>;
      default:
        return <span className="erp-badge erp-badge-warning">PLANNING</span>;
    }
  };

  return (
    <ErpLayout
      title="Project Portfolio & Capital Expenditure"
      subtitle="Track milestone progress, scope deliverables, project budget burn, and client account deliveries"
      activeTab="projects"
      error={error}
      success={success}
      onDismissError={() => setError(null)}
      onDismissSuccess={() => setSuccess(null)}
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={loadProjects}
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
            <span>New Project</span>
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
              placeholder="Search by code, title, or client..."
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
            <option value="ALL">All Project Statuses</option>
            <option value="PLANNING">PLANNING</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="ON_HOLD">ON_HOLD</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>

        {/* Projects Table */}
        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Project Name</th>
                <th>Client</th>
                <th>Status</th>
                <th>Budget Utilization</th>
                <th>Schedule</th>
                <th>Milestones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="erp-empty-cell">
                    Loading projects...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="erp-empty-cell">
                    No projects found.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const percent =
                    p.budgetTotal > 0
                      ? Math.min(Math.round((p.spentTotal / p.budgetTotal) * 100), 100)
                      : 0;

                  return (
                    <tr key={p.id}>
                      <td>
                        <code>{p.projectCode}</code>
                      </td>
                      <td>
                        <strong>{p.name}</strong>
                        {p.description && (
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{p.description}</div>
                        )}
                      </td>
                      <td>{p.client}</td>
                      <td>{getStatusBadge(p.status)}</td>
                      <td>
                        <div style={{ minWidth: 160 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                            <span>${(p.spentTotal ?? 0).toLocaleString()} spent</span>
                            <span>${(p.budgetTotal ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="erp-progress-track">
                            <div
                              className="erp-progress-bar"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: percent > 90 ? '#ef4444' : percent > 75 ? '#f59e0b' : '#10b981',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12.5 }}>
                          {new Date(p.startDate).toLocaleDateString()}
                          {p.targetEndDate ? ` → ${new Date(p.targetEndDate).toLocaleDateString()}` : ''}
                        </div>
                      </td>
                      <td>
                        <span className="erp-badge erp-badge-neutral">{p.milestonesCount} milestones</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div
          className="erp-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="erp-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="erp-modal-header">
              <h3 className="erp-modal-title">Initiate New Project</h3>
              <button
                type="button"
                className="erp-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="erp-modal-body">
                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Project Code (Auto if blank)</label>
                    <input
                      type="text"
                      value={newProject.projectCode}
                      onChange={(e) => setNewProject({ ...newProject, projectCode: e.target.value })}
                      placeholder="PRJ-2026-XXXX"
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Project Name *</label>
                    <input
                      type="text"
                      required
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="e.g. Enterprise Cloud Migration"
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Client / Department *</label>
                    <input
                      type="text"
                      required
                      value={newProject.client}
                      onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                      placeholder="e.g. Global Logistics Inc"
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Status</label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                      className="erp-select"
                    >
                      <option value="PLANNING">PLANNING</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="ON_HOLD">ON_HOLD</option>
                    </select>
                  </div>
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Budget Total ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={newProject.budgetTotal}
                      onChange={(e) => setNewProject({ ...newProject, budgetTotal: Number(e.target.value) })}
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Initial Spend ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={newProject.spentTotal}
                      onChange={(e) => setNewProject({ ...newProject, spentTotal: Number(e.target.value) })}
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Start Date</label>
                    <input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Target Completion</label>
                    <input
                      type="date"
                      value={newProject.targetEndDate}
                      onChange={(e) => setNewProject({ ...newProject, targetEndDate: e.target.value })}
                      className="erp-input"
                    />
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
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpLayout>
  );
};
