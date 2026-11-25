import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmDesignation } from '../../../types/hrm.types';
import { PlusIcon } from '../../../components/common/Icons';

export const DesignationsPage: React.FC = () => {
  const [designations, setDesignations] = useState<HrmDesignation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newDes, setNewDes] = useState({ title: '', code: '', department: 'Engineering', jobGrade: 'L3', description: '', status: 'ACTIVE' as const });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmService.getDesignations();
      const list = (res as any)?.data || (Array.isArray(res) ? res : []);
      setDesignations(list);
    } catch (err: any) {
      setError(err?.message || 'Failed to load designations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDes.title.trim()) return;
    try {
      await hrmService.createDesignation(newDes);
      setSuccess(`Designation ${newDes.title} created!`);
      setShowModal(false);
      setNewDes({ title: '', code: '', department: 'Engineering', jobGrade: 'L3', description: '', status: 'ACTIVE' });
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to create designation');
    }
  };

  return (
    <HrmLayout
      title="Designations & Job Titles"
      subtitle="Standardized organizational roles, career grades, and department assignments"
      activeTab="designations"
      error={error}
      success={success}
      onDismissError={() => setError(null)}
      onDismissSuccess={() => setSuccess(null)}
      actions={
        <button type="button" onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PlusIcon size={16} />
          <span>Add Designation</span>
        </button>
      }
    >
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
              <th style={{ padding: '12px 16px' }}>CODE</th>
              <th style={{ padding: '12px 16px' }}>TITLE</th>
              <th style={{ padding: '12px 16px' }}>DEPARTMENT</th>
              <th style={{ padding: '12px 16px' }}>JOB GRADE</th>
              <th style={{ padding: '12px 16px' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {designations.map((d) => (
              <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#3b82f6' }}>{d.code || '—'}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{d.title}</td>
                <td style={{ padding: '12px 16px' }}>{d.department || 'All'}</td>
                <td style={{ padding: '12px 16px' }}>{d.jobGrade || 'L3'}</td>
                <td style={{ padding: '12px 16px' }}><span className="badge badge-success">{d.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: 24, background: '#fff', borderRadius: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Add New Designation</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Job Title *</label>
                <input type="text" required value={newDes.title} onChange={(e) => setNewDes({ ...newDes, title: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
              </div>
              {loading && <div style={{ marginBottom: 12, fontSize: 13, color: "#64748b" }}>Loading designations...</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Code</label>
                  <input type="text" value={newDes.code} onChange={(e) => setNewDes({ ...newDes, code: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Grade</label>
                  <input type="text" value={newDes.jobGrade} onChange={(e) => setNewDes({ ...newDes, jobGrade: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Department</label>
                <input type="text" value={newDes.department} onChange={(e) => setNewDes({ ...newDes, department: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Designation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
