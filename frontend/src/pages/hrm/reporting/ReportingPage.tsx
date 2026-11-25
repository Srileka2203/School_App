import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';

export const ReportingPage: React.FC = () => {
  const [hierarchy, setHierarchy] = useState<any[]>([]);
  const loadData = useCallback(async () => {
    const res = await hrmService.getReportingHierarchy();
    setHierarchy((res as any)?.data || (Array.isArray(res) ? res : []));
  }, []);
  useEffect(() => { loadData(); }, [loadData]);
  return (
    <HrmLayout title="Organizational Hierarchy & Reporting Lines" subtitle="Direct reports, management structure, and organizational tree" activeTab="reporting">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {hierarchy.map((mgr) => (
          <div key={mgr.id} className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{mgr.name}</h3>
            <span style={{ fontSize: 13, color: '#3b82f6', fontWeight: 600 }}>{mgr.designation} ({mgr.department})</span>
            <div style={{ marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>DIRECT REPORTS ({mgr.reportsCount || (mgr.directReports ? mgr.directReports.length : 0)})</div>
              {mgr.directReports?.map((r: any) => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #f1f5f9', fontSize: 13 }}>
                  <span>{r.name}</span>
                  <span style={{ color: '#64748b' }}>{r.designation}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </HrmLayout>
  );
};
