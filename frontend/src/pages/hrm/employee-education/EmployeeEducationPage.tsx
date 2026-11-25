import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmEmployeeEducation } from '../../../types/hrm.types';

export const EmployeeEducationPage: React.FC = () => {
  const [edu, setEdu] = useState<HrmEmployeeEducation[]>([]);
  const loadData = useCallback(async () => {
    const res = await hrmService.getEducation();
    setEdu((res as any)?.data || (Array.isArray(res) ? res : []));
  }, []);
  useEffect(() => { loadData(); }, [loadData]);
  return (
    <HrmLayout title="Academic & Educational Qualifications" subtitle="Employee degrees, universities, and academic certifications" activeTab="employee-education">
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
              <th style={{ padding: '12px 16px' }}>DEGREE</th>
              <th style={{ padding: '12px 16px' }}>INSTITUTION</th>
              <th style={{ padding: '12px 16px' }}>FIELD OF STUDY</th>
              <th style={{ padding: '12px 16px' }}>GRADE / GPA</th>
            </tr>
          </thead>
          <tbody>
            {edu.map((e) => (
              <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{e.degree}</td>
                <td style={{ padding: '12px 16px' }}>{e.institutionName}</td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>{e.fieldOfStudy || '—'}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{e.grade || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HrmLayout>
  );
};
