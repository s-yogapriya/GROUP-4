import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Activity, Plus, Calendar, Leaf, Trash2, Edit3, Search, RefreshCw, AlertCircle,
  Car, Zap, Utensils, ShoppingBag, Truck, Flame, Factory, TreePine,
  Wind, Plane, Bike, Bus, Train, Trash, Home, Globe, CheckCircle2, Layers, Sun, Package } from 'lucide-react';

const ICON_MAP = {
  Car, Zap, Utensils, ShoppingBag, Truck, Flame, Factory, TreePine,
  Wind, Plane, Bike, Bus, Train, Trash, Home, Globe, Activity, Sun, Package,
};

const ActivityLoggingPage = () => {
  const { showToast, showWarning } = useAuth();
  const location = useLocation();
  const isHistory = location.pathname.endsWith('/history');
  const [categories, setCategories] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [allActivityTypes, setAllActivityTypes] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typesLoading, setTypesLoading] = useState(false);
  const [categoryLoadError, setCategoryLoadError] = useState('');
  const [typeLoadError, setTypeLoadError] = useState('');
  const [emissionFactor, setEmissionFactor] = useState(null);
  const [factorLoading, setFactorLoading] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedActivityType, setSelectedActivityType] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    activityTypeId: '',
    quantity: '',
    activityDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const [editingLog, setEditingLog] = useState(null);
  const [deletingLog, setDeletingLog] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [activityFilter, setActivityFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, typeRes, logRes] = await Promise.all([
        api.get('/user/data/categories'),
        api.get('/user/data/activity-types'),
        api.get('/user/activities'),
      ]);
      setCategories(catRes.data || []);
      setAllActivityTypes(typeRes.data || []);
      setActivityLogs(logRes.data || []);
      setCategoryLoadError('');
    } catch (err) {
      setCategoryLoadError('Unable to load active categories. Please refresh and try again.');
      showToast('Unable to load activity data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) { setActivityTypes([]); setTypeLoadError(''); return; }
    const loadTypes = async () => {
      setTypesLoading(true); setTypeLoadError(''); setActivityTypes([]);
      try {
        const response = await api.get(`/user/data/activity-types/category/${selectedCategoryId}`);
        setActivityTypes(response.data || []);
      } catch {
        setTypeLoadError('Unable to load activity types. Please select the category again or refresh.');
      } finally { setTypesLoading(false); }
    };
    loadTypes();
  }, [selectedCategoryId]);

  useEffect(() => {
    if (!selectedActivityType?.activityTypeId) { setEmissionFactor(null); return; }
    let cancelled = false;
    const loadFactor = async () => {
      setFactorLoading(true); setEmissionFactor(null);
      try {
        const response = await api.get(
          `/user/data/emission-factor/${selectedActivityType.activityTypeId}`,
          { params: { activityDate: formData.activityDate } }
        );
        // response is the ApiResponse wrapper; response.data is the EmissionFactorDto (or null)
        if (!cancelled) {
          const ef = response.data ?? null;
          setEmissionFactor(ef);
          if (ef) {
            setFormErrors(prev => {
              if (prev.activityTypeId?.includes('emission factor')) {
                return { ...prev, activityTypeId: undefined };
              }
              return prev;
            });
          }
        }
      } catch {
        if (!cancelled) setEmissionFactor(null);
      } finally {
        if (!cancelled) setFactorLoading(false);
      }
    };
    loadFactor();
    return () => { cancelled = true; };
  }, [selectedActivityType?.activityTypeId, formData.activityDate]);

  const handleActivityTypeChange = (act) => {
    if (!act) return;
    setSelectedActivityType(act);
    setFormErrors((previous) => ({ ...previous, activityTypeId: undefined }));
    setFormData((prev) => ({
      ...prev,
      activityTypeId: act.activityTypeId,
      unit: act.unit,
      quantity: prev.quantity || (act.defaultQuantity ?? ''),
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.categoryId) errors.categoryId = 'Please select a category.';
    if (!formData.activityTypeId) errors.activityTypeId = 'Please select an activity type.';
    const quantity = Number(formData.quantity);
    if (formData.quantity === '' || !Number.isFinite(quantity)) errors.quantity = 'Quantity is required.';
    else if (quantity <= 0) errors.quantity = 'Quantity must be greater than 0.';
    else if (selectedActivityType?.minQuantity != null && quantity < selectedActivityType.minQuantity) errors.quantity = `Quantity must be at least ${selectedActivityType.minQuantity} ${selectedActivityType.unit}.`;
    else if (selectedActivityType?.maxQuantity != null && quantity > selectedActivityType.maxQuantity) errors.quantity = `Quantity cannot exceed ${selectedActivityType.maxQuantity} ${selectedActivityType.unit}.`;
    if (selectedActivityType && !factorLoading && !emissionFactor) errors.activityTypeId = 'No active emission factor is configured for this activity. Please contact the administrator.';
    if (!formData.activityDate) errors.activityDate = 'Activity date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (editingLog && !window.confirm('Save the changes to this activity log?')) return;

    setSubmitting(true);
    setResult(null);
    setFormErrors({});

    try {
      const payload = {
        ...formData,
        categoryId: Number(formData.categoryId),
        activityTypeId: Number(formData.activityTypeId),
        quantity: Number(formData.quantity),
      };

      let res;
      if (editingLog) {
        res = await api.put(`/user/activities/${editingLog.activityLogId}`, payload);
        showToast(res.message || 'Activity updated successfully!', 'success');
        setEditingLog(null);
      } else {
        res = await api.post('/user/activities', payload);
        showToast(res.message || 'Activity logged successfully!', 'success');
      }

      setResult(res.data);
      setFormData({
        categoryId: '',
        activityTypeId: '',
        quantity: '',
        activityDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setSelectedCategoryId('');
      setSelectedActivityType(null);
      fetchData();
      // Check for new high-emission warnings
      try {
        const alertsRes = await api.get('/user/alerts');
        const allAlerts = alertsRes.data || [];
        const newUnread = allAlerts.filter(a => !a.read);
        newUnread.forEach(a => showWarning(a));
      } catch {}
    } catch (err) {
      const msg = typeof err === 'string' ? err : (err?.message || 'Unable to save activity. Please try again.');
      const serverFields = err?.data && typeof err.data === 'object' ? err.data : null;
      if (serverFields) setFormErrors(serverFields);
      else if (msg.toLowerCase().includes('factor')) setFormErrors((prev) => ({ ...prev, activityTypeId: 'No active emission factor is configured for this activity. Please contact the administrator.' }));
      else if (msg.toLowerCase().includes('quantity')) setFormErrors((prev) => ({ ...prev, quantity: msg }));
      else if (msg.toLowerCase().includes('activity')) setFormErrors((prev) => ({ ...prev, activityTypeId: msg }));
      else if (msg.toLowerCase().includes('category')) setFormErrors((prev) => ({ ...prev, categoryId: msg }));
      else showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setSelectedCategoryId(log.categoryId);
    // Pass the full activity type object so selectedActivityType has all fields
    // (unit, min/maxQuantity, etc.) needed for validation and factor lookup.
    // allActivityTypes is loaded on mount and contains every active type.
    const fullType = allActivityTypes.find(
      (a) => String(a.activityTypeId) === String(log.activityTypeId)
    ) || { activityTypeId: log.activityTypeId, unit: log.unit };
    handleActivityTypeChange(fullType);
    setFormData({
      categoryId: log.categoryId,
      activityTypeId: log.activityTypeId,
      quantity: log.quantity,
      activityDate: log.activityDate,
      notes: log.notes || '',
    });
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deletingLog) return;
    try {
      const res = await api.delete(`/user/activities/${deletingLog.activityLogId}`);
      showToast(res.message || 'Activity deleted successfully!', 'info');
      setDeletingLog(null);
      fetchData();
    } catch (err) {
      showToast('Deletion failed: ' + err.toString(), 'error');
    }
  };

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.activityTypeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !dateFilter || log.activityDate === dateFilter;
    const matchesCategory = categoryFilter === 'ALL' || String(log.categoryId) === String(categoryFilter);
    const matchesActivity = activityFilter === 'ALL' || String(log.activityTypeId) === String(activityFilter);
    const matchesRange = (!startDate || log.activityDate >= startDate) && (!endDate || log.activityDate <= endDate);
    return matchesSearch && matchesDate && matchesCategory && matchesActivity && matchesRange;
  });

  const totalEmission = activityLogs.reduce((sum, log) => sum + (log.totalEmission || 0), 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <Activity className="w-7 h-7 text-emerald-400" />
              {isHistory ? 'Activity History & Analytics' : 'Log Daily Activity'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {isHistory ? 'Review, filter, update, or remove your saved activity records.' : 'Choose an activity in three simple steps. Calculations are always confirmed by the server.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Activities</div>
            <div className="text-3xl font-black text-white mt-1">{activityLogs.length}</div>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-emerald-500/20">
            <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Total Emission</div>
            <div className="text-3xl font-black text-emerald-400 mt-1">
              {totalEmission.toFixed(2)} <span className="text-sm font-normal">kg CO₂e</span>
            </div>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-teal-500/20">
            <div className="text-teal-400 text-xs font-semibold uppercase tracking-wider">Categories</div>
            <div className="text-3xl font-black text-teal-400 mt-1">
              {new Set(activityLogs.map((l) => l.categoryId)).size}
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-8 ${isHistory ? '' : 'lg:grid-cols-3'}`}>
          {/* Form Column */}
          <div className={isHistory ? 'hidden' : 'lg:col-span-1'}>
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/80 p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <Plus className="w-5 h-5 text-emerald-400" />
                {editingLog ? 'Edit Activity' : 'Log New Activity'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* STEP 1: Category Selection */}
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-slate-950">1</span>
                    Choose Category
                  </div>
                  {loading ? (
                    <p className="text-xs text-slate-400">Loading categories...</p>
                  ) : categories.length === 0 ? (
                    <p className="text-xs text-rose-400">{categoryLoadError || 'No active categories available.'}</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {categories.map((cat) => {
                        const IconComp = ICON_MAP[cat.icon] || Layers;
                        const isSelected = String(formData.categoryId) === String(cat.categoryId);
                        return (
                          <button
                            key={cat.categoryId}
                            type="button"
                            onClick={() => {
                              setSelectedCategoryId(cat.categoryId);
                              setFormData({ ...formData, categoryId: cat.categoryId, activityTypeId: '', quantity: '' });
                              setSelectedActivityType(null);
                              setEmissionFactor(null);
                              setFormErrors((prev) => ({ ...prev, categoryId: undefined, activityTypeId: undefined, quantity: undefined }));
                            }}
                            className={`relative flex flex-col items-center gap-2 p-3.5 rounded-xl border text-center transition-all ${
                              isSelected
                                ? 'bg-emerald-950/60 border-emerald-500/70 shadow-lg shadow-emerald-950/30'
                                : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                            }`}
                          >
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isSelected ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
                              <IconComp className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                            </div>
                            <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-300' : 'text-slate-300'}`}>{cat.categoryName}</span>
                            {isSelected && <CheckCircle2 className="absolute top-2 right-2 w-3.5 h-3.5 text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {formErrors.categoryId && (
                    <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.categoryId}
                    </p>
                  )}
                </div>

                {/* STEP 2: Activity Type Selection */}
                {selectedCategoryId && (
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-slate-950">2</span>
                      Choose Activity
                    </div>
                    {typesLoading ? (
                      <p className="text-xs text-slate-400">Loading activity types...</p>
                    ) : activityTypes.length === 0 ? (
                      <p className="text-xs text-rose-400">{typeLoadError || 'No active activity types available for this category.'}</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {activityTypes.map((act) => {
                          const isSelected = String(formData.activityTypeId) === String(act.activityTypeId);
                          const ActIcon = ICON_MAP[act.icon] || Activity;
                          return (
                            <button
                              key={act.activityTypeId}
                              type="button"
                              onClick={() => handleActivityTypeChange(act)}
                              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                                isSelected
                                  ? 'bg-emerald-950/60 border-emerald-500/70 shadow-lg shadow-emerald-950/30'
                                  : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                              }`}
                            >
                              <ActIcon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                              <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-300' : 'text-slate-300'}`}>{act.activityName}</span>
                              {isSelected && <CheckCircle2 className="absolute top-2 right-2 w-3.5 h-3.5 text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {formErrors.activityTypeId && (
                      <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {formErrors.activityTypeId}
                      </p>
                    )}
                  </div>
                )}

                {/* STEP 3: Activity Details */}
                {selectedActivityType && (
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-slate-950">3</span>
                      Activity Details
                    </div>

                    <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <Leaf className="w-3.5 h-3.5" />
                        <span className="font-semibold">Unit: {selectedActivityType.unit}</span>
                        {selectedActivityType.minQuantity != null && (
                          <span className="text-slate-400">| Min: {selectedActivityType.minQuantity}</span>
                        )}
                        {selectedActivityType.maxQuantity != null && (
                          <span className="text-slate-400">| Max: {selectedActivityType.maxQuantity}</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                          Quantity <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min={selectedActivityType?.minQuantity ?? undefined}
                          max={selectedActivityType?.maxQuantity ?? undefined}
                          placeholder={`Enter quantity in ${selectedActivityType?.unit || 'unit'}`}
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-xl text-sm text-white focus:outline-none ${
                            formErrors.quantity ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                          }`}
                        />
                        {formErrors.quantity && (
                          <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {formErrors.quantity}
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-3 text-xs">
                        {factorLoading ? <span className="text-slate-400">Loading emission factor...</span> : emissionFactor ? <>
                          <p className="font-semibold text-emerald-400">Emission factor: {emissionFactor.emissionFactor} kg CO₂e/{selectedActivityType.unit}</p>
                          {formData.quantity !== '' && Number.isFinite(Number(formData.quantity)) && <p className="mt-1 text-slate-300">Estimated emission: <span className="font-bold text-emerald-300">{(Number(formData.quantity) * emissionFactor.emissionFactor).toFixed(2)} kg CO₂e</span></p>}
                        </> : <p className="text-rose-400">No active emission factor is configured for this activity. Please contact the administrator.</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                          Activity Date <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                          <input
                            type="date"
                            value={formData.activityDate}
                            onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
                            className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border rounded-xl text-sm text-white focus:outline-none ${
                              formErrors.activityDate ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                            }`}
                          />
                        </div>
                        {formErrors.activityDate && (
                          <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {formErrors.activityDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                          Notes (Optional)
                        </label>
                        <textarea
                          rows="2"
                          placeholder="Add any additional details..."
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || factorLoading || (!!selectedActivityType && !emissionFactor)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingLog ? 'Update Activity' : 'Log Activity'}
                </button>
              </form>

              {result && (
                <div className="mt-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50">
                  <div className="text-xs text-emerald-400 uppercase tracking-wider font-semibold mb-2">
                    Carbon Emission Calculation
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">
                      {result.totalEmission.toFixed(2)}
                    </span>
                    <span className="text-sm text-emerald-400">kg CO₂e</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    Factor: {result.emissionFactor} × Quantity: {result.quantity} {result.unit}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* History Column */}
          <div className={isHistory ? '' : 'lg:col-span-2'}>
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="text-base font-bold text-white">Activity History</h3>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search activities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setActivityFilter('ALL'); }} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"><option value="ALL">All categories</option>{categories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}</select>
                  <select value={activityFilter} onChange={(e) => setActivityFilter(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"><option value="ALL">All activities</option>{allActivityTypes.filter((a) => categoryFilter === 'ALL' || String(a.categoryId) === String(categoryFilter)).map((a) => <option key={a.activityTypeId} value={a.activityTypeId}>{a.activityName}</option>)}</select>
                  {isHistory && <><input aria-label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-200" /><input aria-label="End date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-200" /></>}
                </div>
              </div>
              <p className="px-4 pt-3 text-xs text-slate-500">Showing {filteredLogs.length} record{filteredLogs.length === 1 ? '' : 's'}</p>

              {loading ? (
                <div className="p-12 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
                  Loading activities...
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Activity className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                  <p className="font-semibold text-slate-300">No activities logged yet</p>
                  <p className="text-xs text-slate-500 mt-1">Start by logging your first activity above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Activity</th>
                        <th className="py-3 px-4 text-right">Quantity</th>
                        <th className="py-3 px-4 text-right">Emission</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredLogs.map((log) => (
                        <tr key={log.activityLogId} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-slate-400">{log.activityDate}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-900 text-slate-200 border border-slate-700">
                              {log.categoryName}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">{log.activityTypeName}</td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-400">
                            {log.quantity} {log.unit}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                            {log.totalEmission.toFixed(2)} kg
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(log)}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-teal-400 transition-all"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingLog(log)}
                                className="p-1.5 rounded bg-slate-800 hover:bg-rose-900/60 text-rose-400 transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {deletingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-7 h-7" />
              <h3 className="text-lg font-bold text-white">Delete Activity</h3>
            </div>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete activity <strong className="text-white">{deletingLog.activityTypeName}</strong> on <strong className="text-emerald-400">{deletingLog.activityDate}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setDeletingLog(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition-all shadow-lg shadow-rose-900/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ActivityLoggingPage;
