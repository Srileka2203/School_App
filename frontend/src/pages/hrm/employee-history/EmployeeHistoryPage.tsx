import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmEmployeeHistoryItem } from '../../../types/hrm.types';

export const EmployeeHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HrmEmployeeHistoryItem[]>([]);
  const loadData = useCallback(async () => {
    const res = await hrmService.getHistory();
    setHistory((res as any)?.data || (Array.isArray(res) ? res : []));
  }, []);
  useEffect(() => { loadData(); }, [loadData]);
  return (
    <HrmLayout title="Employee Progression & Lifecycle History" subtitle="Promotions, compensation reviews, role transitions, and department transfers" activeTab="employee-history">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {history.map((h) => (
          <div key={h.id} className="card" style={{ padding: 16, borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6' }}>{h.eventType}</span>
              <span style={{ fontSize: 12, color: '#64748b' }}>{h.effectiveDate}</span>
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 600, margin: '6px 0' }}>{h.description}</h4>
            <div style={{ fontSize: 13, color: '#475569' }}>
              From: <del>{h.previousValue}</del> &rarr; <strong style={{ color: '#16a34a' }}>{h.newValue}</strong>
            </div>
          </div>
        ))}
      </div>
    </HrmLayout>
  );
};
