import React, { useEffect, useState, useCallback } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmLocation } from '../../../types/hrm.types';
import { PlusIcon } from '../../../components/common/Icons';

export const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<HrmLocation[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newLoc, setNewLoc] = useState({ name: '', code: '', city: 'New York', country: 'United States', isHeadquarters: false });

  const loadData = useCallback(async () => {
    const res = await hrmService.getLocations();
    const list = (res as any)?.data || (Array.isArray(res) ? res : []);
    setLocations(list);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await hrmService.createLocation(newLoc);
    setShowModal(false);
    loadData();
  };

  return (
    <HrmLayout title="Office Locations & Regional Hubs" subtitle="Corporate facilities, regional branches, and workspace hubs" activeTab="locations" actions={<button type="button" onClick={() => setShowModal(true)} className="btn btn-primary"><PlusIcon size={16} /> Add Location</button>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {locations.map((loc) => (
          <div key={loc.id} className="card" style={{ padding: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>{loc.code || 'LOC'}</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '6px 0' }}>{loc.name}</h3>
            <p style={{ fontSize: 13, color: '#64748b' }}>{loc.city}, {loc.country}</p>
            {loc.isHeadquarters && <span className="badge badge-primary" style={{ marginTop: 8 }}>Global Headquarters</span>}
          </div>
        ))}
      </div>
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 24, background: '#fff', borderRadius: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Add Location</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12 }}>Location Name</label>
                <input type="text" required value={newLoc.name} onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12 }}>City</label>
                <input type="text" value={newLoc.city} onChange={(e) => setNewLoc({ ...newLoc, city: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Location</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
