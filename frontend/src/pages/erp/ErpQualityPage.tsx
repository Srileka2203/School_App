import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ErpLayout } from './ErpLayout';
import { erpService } from '../../services/erp.service';
import type { QualityInspection, QualityAudit, CreateInspectionPayload } from '../../types/erp.types';
import { PlusIcon, SearchIcon, RefreshCwIcon } from '../../components/common/Icons';

export const ErpQualityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inspections' | 'audits'>('inspections');
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [audits, setAudits] = useState<QualityAudit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  // Create Inspection Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newInspection, setNewInspection] = useState<CreateInspectionPayload>({
    inspectionCode: '',
    targetBatch: '',
    inspector: '',
    sampleSize: 50,
    defectsCount: 0,
    result: 'PASS',
    inspectionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [inspRes, auditRes] = await Promise.all([
        erpService.getInspections(),
        erpService.getAudits(),
      ]);
      const inspList = (inspRes as any)?.data || (Array.isArray(inspRes) ? inspRes : []);
      const auditList = (auditRes as any)?.data || (Array.isArray(auditRes) ? auditRes : []);
      setInspections(inspList);
      setAudits(auditList);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load quality assurance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredInspections = useMemo(() => {
    return inspections.filter(
      (i) =>
        (i.inspectionCode || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.targetBatch || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.inspector || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [inspections, search]);

  const filteredAudits = useMemo(() => {
    return audits.filter(
      (a) =>
        (a.title || a.auditTitle || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.auditor || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [audits, search]);

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInspection.targetBatch.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await erpService.createInspection(newInspection);
      setSuccess(`Quality inspection logged successfully.`);
      setShowModal(false);
      setNewInspection({
        inspectionCode: '',
        targetBatch: '',
        inspector: '',
        sampleSize: 50,
        defectsCount: 0,
        result: 'PASS',
        inspectionDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to log inspection');
    } finally {
      setSubmitting(false);
    }
  };

  const getInspectionBadge = (result: string) => {
    switch (result) {
      case 'PASS':
        return <span className="erp-badge erp-badge-success">PASS</span>;
      case 'FAIL':
        return <span className="erp-badge erp-badge-danger">FAIL</span>;
      case 'CONDITIONAL':
        return <span className="erp-badge erp-badge-warning">CONDITIONAL</span>;
      default:
        return <span className="erp-badge erp-badge-neutral">{result}</span>;
    }
  };

  const getAuditStatusBadge = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <span className="erp-badge erp-badge-success">PASSED</span>;
      case 'ACTION_REQUIRED':
        return <span className="erp-badge erp-badge-danger">ACTION REQUIRED</span>;
      case 'IN_PROGRESS':
        return <span className="erp-badge erp-badge-info">IN PROGRESS</span>;
      default:
        return <span className="erp-badge erp-badge-warning">{status}</span>;
    }
  };

  return (
    <ErpLayout
      title="Quality Assurance & Regulatory Audits"
      subtitle="Batch sampling inspections, defect thresholds, ISO standards compliance, and internal audits"
      activeTab="quality"
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
            <span>Log Inspection</span>
          </button>
        </div>
      }
    >
      <div className="erp-card">
        {/* Module Sub-tabs */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setActiveTab('inspections')}
            className={`erp-btn ${activeTab === 'inspections' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
          >
            Batch Inspections ({inspections.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audits')}
            className={`erp-btn ${activeTab === 'audits' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}
          >
            Quality Audits ({audits.length})
          </button>
        </div>

        {/* Filter bar */}
        <div className="erp-filter-bar">
          <div className="erp-search-wrap">
            <SearchIcon size={16} className="erp-search-icon" />
            <input
              type="text"
              placeholder={activeTab === 'inspections' ? 'Search by code, batch number, or QA inspector...' : 'Search audits by title or auditor...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-input erp-search-input"
            />
          </div>
        </div>

        {/* Tab 1: Inspections */}
        {activeTab === 'inspections' && (
          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Inspection Code</th>
                  <th>Target Batch</th>
                  <th>Inspector</th>
                  <th>Sample Size</th>
                  <th>Defects Found</th>
                  <th>Verdict</th>
                  <th>Inspection Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="erp-empty-cell">
                      Loading inspections...
                    </td>
                  </tr>
                ) : filteredInspections.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="erp-empty-cell">
                      No quality inspections recorded.
                    </td>
                  </tr>
                ) : (
                  filteredInspections.map((i) => (
                    <tr key={i.id}>
                      <td>
                        <strong>{i.inspectionCode}</strong>
                      </td>
                      <td>
                        <code>{i.targetBatch}</code>
                      </td>
                      <td>{i.inspector}</td>
                      <td>{i.sampleSize} units</td>
                      <td style={{ color: i.defectsCount > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                        {i.defectsCount} defects
                      </td>
                      <td>{getInspectionBadge(i.result)}</td>
                      <td>{new Date(i.inspectionDate).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Audits */}
        {activeTab === 'audits' && (
          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Audit Title</th>
                  <th>Lead Auditor</th>
                  <th>Audit Date</th>
                  <th>Audit Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="erp-empty-cell">
                      Loading audit registry...
                    </td>
                  </tr>
                ) : filteredAudits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="erp-empty-cell">
                      No quality audits logged.
                    </td>
                  </tr>
                ) : (
                  filteredAudits.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong>{a.title || a.auditTitle || 'Quality Audit'}</strong>
                        {a.notes && (
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{a.notes}</div>
                        )}
                      </td>
                      <td>{a.auditor}</td>
                      <td>{new Date(a.auditDate).toLocaleDateString()}</td>
                      <td>
                        {a.score !== undefined ? (
                          <strong style={{ color: a.score >= 90 ? '#10b981' : '#f59e0b' }}>
                            {a.score}%
                          </strong>
                        ) : (
                          'Pending'
                        )}
                      </td>
                      <td>{getAuditStatusBadge(a.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Inspection Modal */}
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
              <h3 className="erp-modal-title">Record Quality Inspection</h3>
              <button
                type="button"
                className="erp-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateInspection}>
              <div className="erp-modal-body">
                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Inspection Code (Auto if blank)</label>
                    <input
                      type="text"
                      value={newInspection.inspectionCode}
                      onChange={(e) => setNewInspection({ ...newInspection, inspectionCode: e.target.value })}
                      placeholder="QA-2026-XXXX"
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Target Batch / Lot # *</label>
                    <input
                      type="text"
                      required
                      value={newInspection.targetBatch}
                      onChange={(e) => setNewInspection({ ...newInspection, targetBatch: e.target.value })}
                      placeholder="e.g. BATCH-2026-904"
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Inspector Name</label>
                    <input
                      type="text"
                      value={newInspection.inspector}
                      onChange={(e) => setNewInspection({ ...newInspection, inspector: e.target.value })}
                      placeholder="e.g. Dr. H. Vance"
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Verdict</label>
                    <select
                      value={newInspection.result}
                      onChange={(e) => setNewInspection({ ...newInspection, result: e.target.value })}
                      className="erp-select"
                    >
                      <option value="PASS">PASS</option>
                      <option value="FAIL">FAIL</option>
                      <option value="CONDITIONAL">CONDITIONAL</option>
                      <option value="PENDING">PENDING</option>
                    </select>
                  </div>
                </div>

                <div className="erp-form-row">
                  <div className="erp-form-group">
                    <label className="erp-label">Sample Size (Units)</label>
                    <input
                      type="number"
                      min={1}
                      value={newInspection.sampleSize}
                      onChange={(e) => setNewInspection({ ...newInspection, sampleSize: Number(e.target.value) })}
                      className="erp-input"
                    />
                  </div>
                  <div className="erp-form-group">
                    <label className="erp-label">Defects Identified</label>
                    <input
                      type="number"
                      min={0}
                      value={newInspection.defectsCount}
                      onChange={(e) => setNewInspection({ ...newInspection, defectsCount: Number(e.target.value) })}
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="erp-form-group">
                  <label className="erp-label">Inspection Notes</label>
                  <textarea
                    rows={2}
                    value={newInspection.notes}
                    onChange={(e) => setNewInspection({ ...newInspection, notes: e.target.value })}
                    placeholder="Tolerance deviations, visual blemishes..."
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
                  {submitting ? 'Saving...' : 'Save Inspection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ErpLayout>
  );
};
