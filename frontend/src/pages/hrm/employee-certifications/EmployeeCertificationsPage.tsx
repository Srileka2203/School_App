import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmEmployeeCertification } from '../../../types/hrm.types';

export const EmployeeCertificationsPage: React.FC = () => {
  const [certs, setCerts] = useState<HrmEmployeeCertification[]>([]);
  const loadData = useCallback(async () => {
    const res = await hrmService.getCertifications();
    setCerts((res as any)?.data || (Array.isArray(res) ? res : []));
  }, []);
  useEffect(() => { loadData(); }, [loadData]);
  return (
    <HrmLayout title="Professional Certifications & Accreditations" subtitle="Industry certifications, credentials, and compliance licensing" activeTab="employee-certifications">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {certs.map((c) => (
          <div key={c.id} className="card" style={{ padding: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>{c.issuingOrganization}</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '6px 0' }}>{c.certificationName}</h3>
            <p style={{ fontSize: 12, color: '#64748b' }}>Credential ID: {c.credentialId || 'VERIFIED'}</p>
          </div>
        ))}
      </div>
    </HrmLayout>
  );
};
