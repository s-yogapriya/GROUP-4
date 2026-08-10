import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import { Plus, Search, RefreshCw, Edit3, Trash2, AlertCircle, Github, Activity, Leaf } from 'lucide-react';


const EmissionFactorManagement = () => {
  const { showToast } = useAuth();
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paginated, setPaginated] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFactor, setEditingFactor] = useState(null);
  const [formData, setFormData] = useState({
    activityName: '',
    category: '',
    unit: 'CO2e',
    factorValue: '',
    source: '',
    status: 'ACTIVE',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deletingFactor, setDeletingFactor] = useState(null);

  const seedFactors = [
    { id: 1, activityName: 'Car (Petrol)', category: 'Transport', unit: 'kg CO2e/km', factorValue: 0.192, source: 'IPCC 2019', status: 'ACTIVE' },
    { id: 2, activityName: 'Car (Diesel)', category: 'Transport', unit: 'kg CO2e/km', factorValue: 0.171, source: 'IPCC 2019', status: 'ACTIVE' },
    { id: 3, activityName: 'Bus', category: 'Transport', unit: 'kg CO2e/km', factorValue: 0.103, source: 'DEFRA 2021', status: 'ACTIVE' },
    { id: 4, activityName: 'Domestic Flight', category: 'Transport', unit: 'kg CO2e/km', factorValue: 0.255, source: 'DEFRA 2021', status: 'ACTIVE' },
    { id: 5, activityName: 'Grid Electricity', category: 'Electricity', unit: 'kg CO2e/kWh', factorValue: 0.82, source: 'CEA 2022', status: 'ACTIVE' },
    { id: 6, activityName: 'Solar Power', category: 'Electricity', unit: 'kg CO2e/kWh', factorValue: 0.05, source: 'IPCC 2019', status: 'ACTIVE' },
    { id: 7, activityName: 'Veg Meal', category: 'Food', unit: 'kg CO2e/meal', factorValue: 1.2, source: 'Our World in Data', status: 'ACTIVE' },
    { id: 8, activityName: 'Beef Meal', category: 'Food', unit: 'kg CO2e/meal', factorValue: 7.2, source: 'Our World in Data', status: 'ACTIVE' },
    { id: 9, activityName: 'Vegan Meal', category: 'Food', unit: 'kg CO2e/meal', factorValue: 0.9, source: 'Our World in Data', status: 'ACTIVE' },
    { id: 10, activityName: 'Electronics', category: 'Shopping', unit: 'kg CO2e/unit', factorValue: 120, source: 'Ecoinvent', status: 'INACTIVE' },
    { id: 11, activityName: 'Clothes', category: 'Shopping', unit: 'kg CO2e/unit', factorValue: 8.5, source: 'Ecoinvent', status: 'ACTIVE' },
    { id: 12, activityName: 'Furniture', category: 'Shopping', unit: 'kg CO2e/unit', factorValue: 210, source: 'Ecoinvent', status: 'INACTIVE' },
  ];

  const fetchFactors = async () => {
    setLoading(true);
    try {
      setFactors(seedFactors);
      showToast('Loaded emission factors (mock data)', 'info');
    } catch (err) {
      setFactors(seedFactors);
      showToast('Backend not available - using mock data', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactors();
  }, []);

  const openAddModal = () => {
    setEditingFactor(null);
    setFormData({
      activityName: '',
      category: 'Transport',
      unit: 'kg CO2e/unit',
      factorValue: '',
      source: '',
      status: 'ACTIVE',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (factor) => {
    setEditingFactor(factor);
    setFormData({
      activityName: factor.activityName,
      category: factor.category,
      unit: factor.unit,
      factorValue: factor.factorValue,
      source: factor.source,
      status: factor.status,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.activityName.trim()) errors.activityName = 'Activity Name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.factorValue || Number(formData.factorValue) <= 0) {
      errors.factorValue = 'Emission factor must be a positive number';
    }
    if (!formData.source.trim()) errors.source = 'Data source is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    // Client-side CRUD (mock). 
    if (editingFactor) {
      setFactors((prev) =>
        prev.map((f) =>
          f.id === editingFactor.id ? { ...editingFactor, ...formData, factorValue: Number(formData.factorValue) } : f
        )
      );
      showToast('Emission factor updated successfully!', 'success');
    } else {
      const newFactor = {
        id: Date.now(),
        ...formData,
        factorValue: Number(formData.factorValue),
      };
      setFactors((prev) => [newFactor, ...prev]);
      showToast('Emission factor created successfully!', 'success');
    }
    setIsModalOpen(false);
    setSubmitting(false);
  };

  const handleDelete = () => {
    if (!deletingFactor) return;
    setFactors((prev) => prev.filter((f) => f.id !== deletingFactor.id));
    showToast('Emission factor deleted successfully!', 'info');
    setDeletingFactor(null);
  };

  const handleToggleStatus = (factor) => {
    setFactors((prev) =>
      prev.map((f) =>
        f.id === factor.id ? { ...f, status: f.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : f
      )
    );
    showToast(`Emission factor ${factor.activityName} status toggled!`, 'success');
  };

  const filteredFactors = factors.filter((f) => {
    const matchesSearch =
      f.activityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <Github className="w-7 h-7 text-emerald-400" />
              Emission Factor Management
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Manage CO₂e emission factors per activity type (kg CO2e per unit)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchFactors}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-900/30"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Emission Factor</span>
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">Local / Mock Data Mode</p>
            <p className="mt-0.5">{' '}
              <span className="text-blue-300"></span>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Factors</div>
            <div className="text-3xl font-black text-white mt-1">{factors.length}</div>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/20">
            <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Active</div>
            <div className="text-3xl font-black text-emerald-400 mt-1">
              {factors.filter((f) => f.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-amber-500/20">
            <div className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Inactive</div>
            <div className="text-3xl font-black text-amber-400 mt-1">
              {factors.filter((f) => f.status === 'INACTIVE').length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search activity, category, source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
              Loading emission factors...
            </div>
          ) : filteredFactors.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Leaf className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="font-semibold text-slate-300">No emission factors found</p>
              <p className="text-xs text-slate-500 mt-1">Try adding a new factor or adjusting filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="py-4 px-5">Activity</th>
                    <th className="py-4 px-5">Category</th>
                    <th className="py-4 px-5">Unit</th>
                    <th className="py-4 px-5 text-right">Factor Value</th>
                    <th className="py-4 px-5">Source</th>
                    <th className="py-4 px-5 text-center">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paginated.map((factor) => (
                    <tr key={factor.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400">
                            <Activity className="w-4 h-4" />
                          </div>
                          {factor.activityName}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-slate-200 border border-slate-700">
                          {factor.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono text-xs text-teal-400">{factor.unit}</td>
                      <td className="py-4 px-5 text-right font-mono text-sm font-bold text-white">
                        {factor.factorValue ?? '—'}
                      </td>
                      <td className="py-4 px-5 text-xs text-slate-400">{factor.source || '—'}</td>
                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() => handleToggleStatus(factor)}
                          title="Click to toggle status"
                          className="cursor-pointer"
                        >
                          <StatusBadge status={factor.status} />
                        </button>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(factor)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 transition-all"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingFactor(factor)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-rose-400 border border-slate-700 hover:border-rose-800/60 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filteredFactors.length > 0 && (
            <div className="p-4">
              <Pagination
                items={filteredFactors}
                onPaginated={setPaginated}
                resetKey={`${searchQuery}-${statusFilter}`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <Github className="w-5 h-5 text-emerald-400" />
                {editingFactor ? 'Update Emission Factor' : 'Add Emission Factor'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Activity Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.activityName}
                  onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                  placeholder="e.g. Car (Petrol)"
                  className={`w-full px-3.5 py-2.5 bg-slate-800 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none ${
                    formErrors.activityName ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                  }`}
                />
                {formErrors.activityName && <p className="text-rose-400 text-xs mt-1">{formErrors.activityName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Transport">Transport</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Food">Food</option>
                    <option value="Shopping">Shopping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="kg CO2e/unit"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-teal-400 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Factor Value <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.factorValue}
                    onChange={(e) => setFormData({ ...formData, factorValue: e.target.value })}
                    placeholder="e.g. 0.192"
                    className={`w-full px-3.5 py-2.5 bg-slate-800 border rounded-xl text-sm text-white font-mono focus:outline-none ${
                      formErrors.factorValue ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.factorValue && <p className="text-rose-400 text-xs mt-1">{formErrors.factorValue}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Source <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g. IPCC 2019"
                    className={`w-full px-3.5 py-2.5 bg-slate-800 border rounded-xl text-sm text-white focus:outline-none ${
                      formErrors.source ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.source && <p className="text-rose-400 text-xs mt-1">{formErrors.source}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-900/30">
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>{editingFactor ? 'Save Changes' : 'Create Factor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingFactor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-7 h-7" />
              <h3 className="text-lg font-bold text-white">Delete Emission Factor</h3>
            </div>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete emission factor{' '}
              <strong className="text-white">"{deletingFactor.activityName}"</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button onClick={() => setDeletingFactor(null)} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition-all shadow-lg shadow-rose-900/30">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmissionFactorManagement;
