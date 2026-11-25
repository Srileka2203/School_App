import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmEmployeeExperience } from '../../../types/hrm.types';

export const EmployeeExperiencePage: React.FC = () => {
  const [exp, setExp] = useState<HrmEmployeeExperience[]>([]);
  const loadData = useCallback(async () => {
    const res = await hrmService.getExperience();
    setExp((res as any)?.data || (Array.isArray(res) ? res : []));
  }, []);
  useEffect(() => { loadData(); }, [loadData]);
  return (
    <HrmLayout title="Work Experience History" subtitle="Prior corporate roles, past companies, and employment tenure" activeTab="employee-experience">
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
              <th style={{ padding: '12px 16px' }}>JOB TITLE</th>
              <th style={{ padding: '12px 16px' }}>COMPANY</th>
              <th style={{ padding: '12px 16px' }}>DESCRIPTION</th>
            </tr>
          </thead>
          <tbody>
            {exp.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{item.jobTitle}</td>
                <td style={{ padding: '12px 16px', color: '#3b82f6', fontWeight: 500 }}>{item.companyName}</td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.description || 'Prior tenure'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HrmLayout>
  );
};
