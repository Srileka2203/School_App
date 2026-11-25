import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmJobGrade } from '../../../types/hrm.types';
import { PlusIcon } from '../../../components/common/Icons';

export const JobGradesPage: React.FC = () => {
  const [grades, setGrades] = useState<HrmJobGrade[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newG, setNewG] = useState({ gradeName: '', gradeLevel: 'L4', minSalary: 80000, maxSalary: 120000 });

  const loadData = useCallback(async () => {
    const res = await hrmService.getJobGrades();
    setGrades((res as any)?.data || (Array.isArray(res) ? res : []));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await hrmService.createJobGrade(newG);
    setShowModal(false);
    loadData();
  };

  return (
    <HrmLayout title="Job Grades & Salary Bands" subtitle="Hierarchical compensation levels and structured salary ranges" activeTab="job-grades" actions={<button type="button" onClick={() => setShowModal(true)} className="btn btn-primary"><PlusIcon size={16} /> Add Job Grade</button>}>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
              <th style={{ padding: '12px 16px' }}>LEVEL</th>
              <th style={{ padding: '12px 16px' }}>GRADE NAME</th>
              <th style={{ padding: '12px 16px' }}>MIN SALARY</th>
              <th style={{ padding: '12px 16px' }}>MAX SALARY</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g) => (
              <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#3b82f6' }}>{g.gradeLevel || '—'}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{g.gradeName}</td>
                <td style={{ padding: '12px 16px' }}>${(g.minSalary || 0).toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>${(g.maxSalary || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 24, background: '#fff', borderRadius: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Add Job Grade</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12 }}>Grade Name</label>
                <input type="text" required value={newG.gradeName} onChange={(e) => setNewG({ ...newG, gradeName: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12 }}>Grade Level (e.g. L3)</label>
                <input type="text" value={newG.gradeLevel} onChange={(e) => setNewG({ ...newG, gradeLevel: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
