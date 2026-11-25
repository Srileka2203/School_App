import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmEmploymentType } from '../../../types/hrm.types';

export const EmploymentTypesPage: React.FC = () => {
  const [types, setTypes] = useState<HrmEmploymentType[]>([]);
  const loadData = useCallback(async () => {
    const res = await hrmService.getEmploymentTypes();
    setTypes((res as any)?.data || (Array.isArray(res) ? res : []));
  }, []);
  useEffect(() => { loadData(); }, [loadData]);
  return (
    <HrmLayout title="Employment Types & Contracts" subtitle="Worker classifications, permanent roles, and contract categories" activeTab="employment-types">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {types.map((t) => (
          <div key={t.id} className="card" style={{ padding: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>{t.code || 'TYPE'}</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '6px 0' }}>{t.name}</h3>
            <p style={{ fontSize: 13, color: '#64748b' }}>{t.description || 'Standard corporate employment classification'}</p>
          </div>
        ))}
      </div>
    </HrmLayout>
  );
};
