import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { HrmLayout } from '../HrmLayout';
import { hrmService } from '../../../services/hrm.service';
import type { HrmAsset } from '../../../types/hrm.types';
import { PlusIcon, SearchIcon, RefreshCwIcon } from '../../../components/common/Icons';

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<HrmAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    assetName: '',
    assetTag: '',
    category: 'Hardware',
    serialNumber: '',
    cost: 1200,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmService.getAssets();
      if (res && res.data) setAssets(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await hrmService.createAsset(newAsset);
      setSuccess('Company asset registered');
      setShowModal(false);
      setNewAsset({ assetName: '', assetTag: '', category: 'Hardware', serialNumber: '', cost: 1200 });
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to register asset');
    }
  };

  const handleAssign = async (id: string) => {
    const employeeId = window.prompt('Enter Employee ID to assign this asset:') || '';
    if (!employeeId) return;
    try {
      setError(null);
      await hrmService.assignAsset(id, { employeeId });
      setSuccess('Asset assigned to employee');
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to assign asset');
    }
  };

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const name = a.assetName || a.name || '';
      return name.toLowerCase().includes(search.toLowerCase()) ||
        a.assetTag.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase());
    });
  }, [assets, search]);

  return (
    <HrmLayout title="Company Assets & Inventory" subtitle="Track IT equipment, laptops, monitors, serial numbers, and custodian custody">
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      <div className="card mb-6 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 w-full sm:w-auto">
            <SearchIcon className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search assets by tag, name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered w-full pl-9"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} className="btn btn-outline btn-sm gap-1" title="Refresh">
              <RefreshCwIcon size={14} /> Refresh
            </button>
            <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm gap-1">
              <PlusIcon size={14} /> Register Asset
            </button>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Serial Number</th>
                <th>Status</th>
                <th>Assigned Custodian</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">Loading company assets...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No company assets found.</td></tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="font-mono font-bold text-primary">{a.assetTag}</td>
                    <td className="font-semibold">{a.assetName || a.name}</td>
                    <td><span className="badge badge-outline">{a.category}</span></td>
                    <td className="font-mono text-xs">{a.serialNumber || '-'}</td>
                    <td>
                      <span className={`badge badge-sm ${a.status === 'AVAILABLE' ? 'badge-success' : a.status === 'ASSIGNED' ? 'badge-info' : 'badge-warning'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>{a.assignedToName || a.assignedToId || 'None (In Inventory)'}</td>
                    <td>
                      {a.status === 'AVAILABLE' && (
                        <button
                          onClick={() => handleAssign(a.id)}
                          className="btn btn-xs btn-outline btn-primary"
                        >
                          Assign
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Register New Asset</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro M3 16-inch"
                  value={newAsset.assetName}
                  onChange={(e) => setNewAsset({ ...newAsset, assetName: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Asset Tag *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AST-001"
                    value={newAsset.assetTag}
                    onChange={(e) => setNewAsset({ ...newAsset, assetTag: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="select select-bordered w-full"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Vehicle">Vehicle</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Serial Number</label>
                <input
                  type="text"
                  placeholder="e.g. C02X1234ABCD"
                  value={newAsset.serialNumber}
                  onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </HrmLayout>
  );
};
