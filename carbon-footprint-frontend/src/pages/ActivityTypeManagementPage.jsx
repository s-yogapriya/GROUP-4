import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  AlertCircle,
  Bike,
  Bus,
  Car,
  CheckCircle2,
  Edit3,
  Factory,
  Flame,
  Globe,
  Home,
  Layers,
  Package,
  Plane,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Sun,
  Trash2,
  Train,
  TreePine,
  Truck,
  Utensils,
  Wind,
  Zap,
  XCircle,
} from 'lucide-react';
import { formatCreatedAt } from '../utils/dateTime';
import Pagination from '../components/Pagination';
import { paginate } from '../utils/clientPagination';

const ICON_OPTIONS = [
  { name: 'Activity', icon: Activity },
  { name: 'Car', icon: Car },
  { name: 'Bus', icon: Bus },
  { name: 'Bike', icon: Bike },
  { name: 'Train', icon: Train },
  { name: 'Plane', icon: Plane },
  { name: 'Zap', icon: Zap },
  { name: 'Sun', icon: Sun },
  { name: 'Flame', icon: Flame },
  { name: 'Utensils', icon: Utensils },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Package', icon: Package },
  { name: 'Home', icon: Home },
  { name: 'Truck', icon: Truck },
  { name: 'Factory', icon: Factory },
  { name: 'TreePine', icon: TreePine },
  { name: 'Globe', icon: Globe },
  { name: 'Wind', icon: Wind },
];

const STANDARD_UNITS = [
  'km',
  'kWh',
  'meals',
  'items',
  'Liters',
  'kg',
  'hours',
  'trips',
];

const ActivityTypeManagementPage = () => {
  const { showToast } = useAuth();

  const [categories, setCategories] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [deletingActivity, setDeletingActivity] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const emptyForm = {
    categoryId: '',
    activityCode: '',
    activityName: '',
    description: '',
    unit: 'km',
    minQuantity: 0.1,
    maxQuantity: 5000,
    defaultQuantity: 1,
    displayOrder: 1,
    icon: 'Activity',
    status: 'ACTIVE',
    remarks: '',
  };

  const [formData, setFormData] = useState(emptyForm);

  const readArray = (response) => {
    const payload = response?.data;
    return Array.isArray(payload) ? payload : Array.isArray(payload?.content) ? payload.content : [];
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoryResponse, activityResponse] = await Promise.all([
        api.get('/admin/categories'),
        api.get('/admin/activity-types'),
      ]);

      setCategories(readArray(categoryResponse));
      setActivityTypes(readArray(activityResponse));
    } catch (error) {
      setCategories([]);
      setActivityTypes([]);
      showToast(
        error?.response?.data?.message || error?.message || 'Failed to load activity type data',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedCategoryId, searchQuery, statusFilter]);

  const filteredActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activityTypes
      .filter((activity) => {
        const matchesCategory =
          selectedCategoryId === 'ALL' ||
          String(activity.categoryId) === String(selectedCategoryId);

        const searchable = [
          activity.activityCode,
          activity.activityName,
          activity.categoryCode,
          activity.categoryName,
          activity.description,
        ]
          .map((value) => String(value || '').toLowerCase())
          .join(' ');

        const matchesSearch = !query || searchable.includes(query);
        const matchesStatus = statusFilter === 'ALL' || activity.status === statusFilter;

        return matchesCategory && matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const categoryA = `${a.categoryCode || ''}|${a.categoryName || ''}`;
        const categoryB = `${b.categoryCode || ''}|${b.categoryName || ''}`;
        return (
          categoryA.localeCompare(categoryB) ||
          String(a.activityName || '').localeCompare(String(b.activityName || ''))
        );
      });
  }, [activityTypes, selectedCategoryId, searchQuery, statusFilter]);

  const pagedActivities = paginate(filteredActivities, page, pageSize);

  const renderIcon = (iconName) => {
    const match = ICON_OPTIONS.find((item) => item.name === iconName);
    const Icon = match?.icon || Activity;
    return <Icon className="h-5 w-5 text-emerald-400" />;
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setEditingActivity(null);
    setFormErrors({});
    setFormData(emptyForm);
  };

  const openAddModal = () => {
    setEditingActivity(null);
    setFormErrors({});
    setFormData({
      ...emptyForm,
      categoryId: categories[0]?.categoryId || '',
      displayOrder: activityTypes.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (activity) => {
    setEditingActivity(activity);
    setFormErrors({});
    setFormData({
      categoryId: activity.categoryId || '',
      activityCode: activity.activityCode || '',
      activityName: activity.activityName || '',
      description: activity.description || '',
      unit: activity.unit || 'km',
      minQuantity: activity.minQuantity ?? 0.1,
      maxQuantity: activity.maxQuantity ?? 5000,
      defaultQuantity: activity.defaultQuantity ?? 1,
      displayOrder: activity.displayOrder ?? 1,
      icon: activity.icon || 'Activity',
      status: activity.status || 'ACTIVE',
      remarks: activity.remarks || '',
    });
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    const min = Number(formData.minQuantity);
    const max = Number(formData.maxQuantity);
    const def = Number(formData.defaultQuantity);
    const order = Number(formData.displayOrder);

    if (!formData.categoryId) errors.categoryId = 'Category is required';
    if (!formData.activityName.trim()) errors.activityName = 'Activity name is required';
    if (!formData.unit.trim()) errors.unit = 'Unit is required';

    if (formData.activityCode && !/^[A-Z0-9_]{2,20}$/.test(formData.activityCode.toUpperCase())) {
      errors.activityCode = 'Use 2-20 uppercase letters, digits or underscores';
    }

    if (!Number.isFinite(min) || min < 0) errors.minQuantity = 'Minimum quantity must be a valid non-negative number';
    if (!Number.isFinite(max) || max <= min) errors.maxQuantity = 'Maximum quantity must be greater than minimum quantity';
    if (!Number.isFinite(def) || def < min || def > max) errors.defaultQuantity = 'Default quantity must be between minimum and maximum';
    if (!Number.isInteger(order) || order < 1) errors.displayOrder = 'Display order must be a positive integer';
    if (!['ACTIVE', 'INACTIVE'].includes(formData.status)) errors.status = 'Invalid status';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    if (
      editingActivity &&
      !window.confirm(`Update activity type "${editingActivity.activityName}"?`)
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        categoryId: Number(formData.categoryId),
        activityCode: formData.activityCode.trim().toUpperCase(),
        activityName: formData.activityName.trim(),
        description: formData.description.trim(),
        unit: formData.unit.trim(),
        minQuantity: Number(formData.minQuantity),
        maxQuantity: Number(formData.maxQuantity),
        defaultQuantity: Number(formData.defaultQuantity),
        displayOrder: Number(formData.displayOrder),
        icon: formData.icon,
        status: formData.status,
        remarks: formData.remarks.trim(),
      };

      if (editingActivity) {
        await api.put(`/admin/activity-types/${editingActivity.activityTypeId}`, payload);
        showToast('Activity type updated successfully!', 'success');
      } else {
        await api.post('/admin/activity-types', payload);
        showToast('Activity type created successfully!', 'success');
      }

      resetModal();
      await fetchData();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to save activity type';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (activity) => {
    try {
      await api.put(`/admin/activity-types/${activity.activityTypeId}`, {
        categoryId: Number(activity.categoryId),
        activityCode: activity.activityCode || '',
        activityName: activity.activityName,
        description: activity.description || '',
        unit: activity.unit,
        minQuantity: activity.minQuantity,
        maxQuantity: activity.maxQuantity,
        defaultQuantity: activity.defaultQuantity,
        displayOrder: activity.displayOrder,
        icon: activity.icon || 'Activity',
        status: activity.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        remarks: activity.remarks || '',
      });

      showToast('Activity status updated successfully!', 'success');
      await fetchData();
    } catch (error) {
      showToast(
        error?.response?.data?.message || error?.message || 'Unable to update activity status',
        'error'
      );
    }
  };

  const deleteActivity = async () => {
    if (!deletingActivity) return;

    try {
      await api.delete(`/admin/activity-types/${deletingActivity.activityTypeId}`);
      showToast('Activity type deleted successfully!', 'success');
      setDeletingActivity(null);
      await fetchData();
    } catch (error) {
      showToast(
        error?.response?.data?.message || error?.message || 'Unable to delete activity type',
        'error'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <main className="mx-auto w-full max-w-7xl space-y-8 px-5 py-8 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-extrabold text-white sm:text-3xl">
              <Activity className="h-7 w-7 text-emerald-400" />
              Activity Type Management
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage activities under each category with unit and quantity ranges.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={fetchData}
              className="rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-slate-300 hover:bg-slate-700"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" />
              Add Activity Type
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setSelectedCategoryId('ALL')}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold ${
                selectedCategoryId === 'ALL'
                  ? 'bg-emerald-600 text-slate-950'
                  : 'border border-slate-700 bg-slate-800 text-slate-400'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              All Categories ({activityTypes.length})
            </button>

            {categories.map((category) => {
              const count = activityTypes.filter(
                (activity) => String(activity.categoryId) === String(category.categoryId)
              ).length;

              return (
                <button
                  type="button"
                  key={category.categoryId}
                  onClick={() => setSelectedCategoryId(category.categoryId)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold ${
                    String(selectedCategoryId) === String(category.categoryId)
                      ? 'bg-emerald-600 text-slate-950'
                      : 'border border-slate-700 bg-slate-800 text-slate-400'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {category.categoryCode} · {category.categoryName} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-800/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search activity, code, category..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold ${
                    statusFilter === status
                      ? 'bg-emerald-600 text-slate-950'
                      : 'border border-slate-700 bg-slate-800 text-slate-400'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-400" />
              Loading activity types...
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Activity className="mx-auto mb-3 h-10 w-10 text-slate-700" />
              <p className="font-semibold text-slate-300">No activity types found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="border-b border-slate-700 bg-slate-950 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Category Code / Name</th>
                    <th className="px-5 py-4">Activity Name</th>
                    <th className="px-5 py-4">Unit</th>
                    <th className="px-5 py-4 text-center">Quantity (Min / Max / Default)</th>
                    <th className="px-5 py-4">Created At</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {pagedActivities.map((activity) => (
                    <tr key={activity.activityTypeId} className="hover:bg-slate-800/40">
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="w-fit rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 font-mono text-xs font-bold text-emerald-400">
                            {activity.categoryCode || 'CATEGORY'}
                          </span>
                          <span className="text-xs font-semibold text-slate-300">
                            {activity.categoryName || '-'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-950">
                            {renderIcon(activity.icon)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white">{activity.activityName}</div>
                            {activity.activityCode && (
                              <div className="font-mono text-[10px] text-slate-500">{activity.activityCode}</div>
                            )}
                            {activity.description && (
                              <div className="max-w-xs truncate text-xs font-normal text-slate-400">{activity.description}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs font-bold text-teal-400">{activity.unit}</td>

                      <td className="px-5 py-4 text-center font-mono text-xs text-slate-300">
                        {activity.minQuantity ?? 0} / {activity.maxQuantity ?? '∞'} /{' '}
                        <span className="font-bold text-emerald-400">{activity.defaultQuantity ?? 1}</span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-400">
                        {formatCreatedAt(activity.createdAt)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStatus(activity)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                            activity.status === 'ACTIVE'
                              ? 'border-emerald-700/60 bg-emerald-950/80 text-emerald-300'
                              : 'border-rose-700/60 bg-rose-950/80 text-rose-300'
                          }`}
                        >
                          {activity.status === 'ACTIVE' ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          {activity.status}
                        </button>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(activity)}
                            className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-teal-300 hover:bg-slate-700"
                            title="Edit activity"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingActivity(activity)}
                            className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-rose-300 hover:bg-rose-950/50"
                            title="Delete activity"
                          >
                            <Trash2 className="h-4 w-4" />
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

        <Pagination
          page={page}
          pageSize={pageSize}
          total={filteredActivities.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <Activity className="h-5 w-5 text-emerald-400" />
                {editingActivity ? 'Update Activity Type' : 'Add New Activity Type'}
              </h2>
              <button type="button" onClick={resetModal} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(event) => setFormData({ ...formData, categoryId: event.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryCode} · {category.categoryName}
                    </option>
                  ))}
                </select>
                {formErrors.categoryId && <p className="mt-1 text-xs text-rose-400">{formErrors.categoryId}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">Activity Code</label>
                  <input
                    value={formData.activityCode}
                    onChange={(event) => setFormData({ ...formData, activityCode: event.target.value.toUpperCase() })}
                    placeholder="e.g. AGRI_FERTILIZER"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 font-mono text-sm text-white outline-none focus:border-emerald-500"
                  />
                  {formErrors.activityCode && <p className="mt-1 text-xs text-rose-400">{formErrors.activityCode}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">Activity Name *</label>
                  <input
                    value={formData.activityName}
                    onChange={(event) => setFormData({ ...formData, activityName: event.target.value })}
                    placeholder="e.g. Fertilizer Use"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                  />
                  {formErrors.activityName && <p className="mt-1 text-xs text-rose-400">{formErrors.activityName}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">Unit *</label>
                  <input
                    value={formData.unit}
                    onChange={(event) => setFormData({ ...formData, unit: event.target.value })}
                    placeholder="e.g. kg, km, kWh"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {STANDARD_UNITS.map((unit) => (
                      <button
                        type="button"
                        key={unit}
                        onClick={() => setFormData({ ...formData, unit })}
                        className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 hover:bg-slate-700"
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                  {formErrors.unit && <p className="mt-1 text-xs text-rose-400">{formErrors.unit}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(event) => setFormData({ ...formData, icon: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                  >
                    {ICON_OPTIONS.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-300">Min Quantity</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.minQuantity}
                    onChange={(event) => setFormData({ ...formData, minQuantity: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono text-white outline-none focus:border-emerald-500"
                  />
                  {formErrors.minQuantity && <p className="mt-1 text-xs text-rose-400">{formErrors.minQuantity}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-300">Max Quantity</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.maxQuantity}
                    onChange={(event) => setFormData({ ...formData, maxQuantity: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono text-white outline-none focus:border-emerald-500"
                  />
                  {formErrors.maxQuantity && <p className="mt-1 text-xs text-rose-400">{formErrors.maxQuantity}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-300">Default Quantity</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.defaultQuantity}
                    onChange={(event) => setFormData({ ...formData, defaultQuantity: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500"
                  />
                  {formErrors.defaultQuantity && <p className="mt-1 text-xs text-rose-400">{formErrors.defaultQuantity}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(event) => setFormData({ ...formData, displayOrder: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                  />
                  {formErrors.displayOrder && <p className="mt-1 text-xs text-rose-400">{formErrors.displayOrder}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">Remarks</label>
                <input
                  value={formData.remarks}
                  onChange={(event) => setFormData({ ...formData, remarks: event.target.value })}
                  placeholder="Optional internal remarks"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button type="button" onClick={resetModal} className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700">Cancel</button>
                <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-500 disabled:opacity-60">
                  {submitting && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {editingActivity ? 'Save Changes' : 'Create Activity Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="h-7 w-7" />
              <h3 className="text-lg font-bold text-white">Delete Activity Type</h3>
            </div>
            <p className="mt-4 text-sm text-slate-300">
              Are you sure you want to delete <strong className="text-white">{deletingActivity.activityName}</strong>?
            </p>
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button type="button" onClick={() => setDeletingActivity(null)} className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700">Cancel</button>
              <button type="button" onClick={deleteActivity} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-500">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTypeManagementPage;
