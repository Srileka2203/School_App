import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmDepartment } from '../../../types/hrm.types';
import { PlusIcon, RefreshCwIcon, TrashIcon } from '../../../components/common/Icons';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<HrmDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '', headOfDepartment: '', description: '', status: 'ACTIVE' as const });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmService.getDepartments();
      const list = (res as any)?.data || (Array.isArray(res) ? res : []);
      setDepartments(list);
    } catch (err: any) {
      setError(err?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name.trim()) return;
    try {
      setError(null);
      await hrmService.createDepartment(newDept);
      setSuccess(`Department ${newDept.name} created successfully!`);
      setShowModal(false);
      setNewDept({ name: '', code: '', headOfDepartment: '', description: '', status: 'ACTIVE' });
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to create department');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await hrmService.deleteDepartment(id);
      setSuccess('Department deleted successfully.');
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete department');
    }
  };

  return (
    <HrmLayout
      title="Department Management"
      subtitle="Organize business divisions, assign leadership, and track departmental staffing"
      activeTab="departments"
      error={error}
      success={success}
      onDismissError={() => setError(null)}
      onDismissSuccess={() => setSuccess(null)}
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PlusIcon size={16} />
            <span>Add Department</span>
          </button>
          <button type="button" onClick={loadData} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCwIcon size={16} />
            <span>Refresh</span>
          </button>
        </div>
      }
    >
      {loading && <div style={{ marginBottom: 12, fontSize: 13, color: "#64748b" }}>Loading departments...</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {departments.map((dept) => (
          <div key={dept.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', letterSpacing: 0.5 }}>{dept.code || 'DEPT'}</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '4px 0 8px 0', color: '#0f172a' }}>{dept.name}</h3>
              </div>
              <button type="button" onClick={() => handleDelete(dept.id)} className="btn btn-icon" style={{ color: '#ef4444' }} title="Delete">
                <TrashIcon size={14} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', minHeight: 38 }}>{dept.description || 'General organizational division'}</p>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#64748b' }}>Head: <strong style={{ color: '#0f172a' }}>{dept.headOfDepartment || 'Unassigned'}</strong></span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>{dept.status}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: 24, background: '#fff', borderRadius: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Add New Department</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Department Name *</label>
                <input type="text" required value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Department Code (e.g. ENG, FIN)</label>
                <input type="text" value={newDept.code} onChange={(e) => setNewDept({ ...newDept, code: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Head of Department</label>
                <input type="text" value={newDept.headOfDepartment} onChange={(e) => setNewDept({ ...newDept, headOfDepartment: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Description</label>
                <textarea value={newDept.description} onChange={(e) => setNewDept({ ...newDept, description: e.target.value })} rows={3} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
