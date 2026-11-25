import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmEmployeeDocument } from '../../../types/hrm.types';

export const EmployeeDocumentsPage: React.FC = () => {
  const [docs, setDocs] = useState<HrmEmployeeDocument[]>([]);
  const loadData = useCallback(async () => {
    const res = await hrmService.getDocuments();
    setDocs((res as any)?.data || (Array.isArray(res) ? res : []));
  }, []);
  useEffect(() => { loadData(); }, [loadData]);
  return (
    <HrmLayout title="Employee Documents & Contracts" subtitle="Digital personnel records, identification files, and contracts repository" activeTab="employee-documents">
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
              <th style={{ padding: '12px 16px' }}>DOCUMENT TYPE</th>
              <th style={{ padding: '12px 16px' }}>DOC NUMBER</th>
              <th style={{ padding: '12px 16px' }}>FILE ATTACHMENT</th>
              <th style={{ padding: '12px 16px' }}>ISSUE DATE</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{d.documentType}</td>
                <td style={{ padding: '12px 16px', color: '#3b82f6' }}>{d.documentNumber || '—'}</td>
                <td style={{ padding: '12px 16px' }}><a href={d.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>View Document</a></td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>{d.issueDate ? String(d.issueDate).split('T')[0] : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HrmLayout>
  );
};
