import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmEmployeeSkill } from '../../../types/hrm.types';
import { PlusIcon } from '../../../components/common/Icons';

export const EmployeeSkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<HrmEmployeeSkill[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newSkill, setNewSkill] = useState({ skillName: '', proficiencyLevel: 'EXPERT' as const, yearsOfExperience: 5 });

  const loadData = useCallback(async () => {
    const res = await hrmService.getSkills();
    setSkills((res as any)?.data || (Array.isArray(res) ? res : []));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await hrmService.createSkill({ ...newSkill, employeeId: 'emp-101' });
    setShowModal(false);
    loadData();
  };

  return (
    <HrmLayout title="Skills & Competencies Matrix" subtitle="Workforce capability ratings, core technical skills, and talent inventory" activeTab="employee-skills" actions={<button type="button" onClick={() => setShowModal(true)} className="btn btn-primary"><PlusIcon size={16} /> Add Skill</button>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {skills.map((s) => (
          <div key={s.id} className="card" style={{ padding: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>{s.proficiencyLevel || s.proficiency}</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '6px 0' }}>{s.skillName}</h3>
            <p style={{ fontSize: 13, color: '#64748b' }}>Experience: {s.yearsOfExperience || 1} Years</p>
          </div>
        ))}
      </div>
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 24, background: '#fff', borderRadius: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Add Skill</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12 }}>Skill Name</label>
                <input type="text" required value={newSkill.skillName} onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12 }}>Years of Experience</label>
                <input type="number" value={newSkill.yearsOfExperience} onChange={(e) => setNewSkill({ ...newSkill, yearsOfExperience: parseInt(e.target.value) || 1 })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Skill</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
