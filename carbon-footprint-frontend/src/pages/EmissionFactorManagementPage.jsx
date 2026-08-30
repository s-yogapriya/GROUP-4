import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

import {
  Activity,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Plus,
  Layers,
  AlertCircle,
  Car,
  Zap,
  Utensils,
  ShoppingBag,
  Truck,
  Flame,
  Factory,
  TreePine,
  Plane,
  Bike,
  Bus,
  Train,
  Home,
  Globe,
  Sun,
  Package,
  Leaf,
  Thermometer,
  Fuel,
  Gauge,
  ToggleLeft,
  ToggleRight,
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
  { name: 'Leaf', icon: Leaf },
  { name: 'Thermometer', icon: Thermometer },
  { name: 'Fuel', icon: Fuel },
  { name: 'Gauge', icon: Gauge },
];

const STANDARD_SOURCES = [
  'IPCC',
  'EPA',
  'DEFRA',
  'IEA',
  'Ecoinvent',
];

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'INACTIVE'];

const getTodayDate = () => {
  const now = new Date();
  const local = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );
  return local.toISOString().split('T')[0];
};

const normalizeDate = (value) => {
  if (!value) return '';
  return String(value).slice(0, 10);
};

const getErrorMessage = (error) => {
  if (!error) {
    return 'Unknown server error.';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error?.response?.data === 'string') {
    return error.response.data;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.message) {
    return error.message;
  }

  return 'Unknown server error.';
};

const EmissionFactorManagementPage = () => {
  const { showToast } = useAuth();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [activityTypes, setActivityTypes] = useState([]);
  const [emissionFactors, setEmissionFactors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedActivityTypeId, setSelectedActivityTypeId] =
    useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFactor, setEditingFactor] = useState(null);

  const [factorCategoryId, setFactorCategoryId] = useState('ALL');

  const [formData, setFormData] = useState({
    activityTypeId: '',
    emissionFactor: '',
    unit: '',
    sourceName: 'IPCC',
    sourceVersion: '',
    effectiveFrom: getTodayDate(),
    effectiveTo: '',
    status: 'ACTIVE',
    remarks: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deletingFactor, setDeletingFactor] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const asArray = (value) => {
    return Array.isArray(value) ? value : [];
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const [activityResponse, factorResponse] = await Promise.all([
        api.get('/admin/activity-types'),
        api.get('/admin/emission-factors'),
      ]);

      setActivityTypes(asArray(activityResponse?.data));
      setEmissionFactors(asArray(factorResponse?.data));
    } catch (error) {
      console.error(
        'Emission factor load error:',
        error?.response?.data || error
      );

      setActivityTypes([]);
      setEmissionFactors([]);

      showToast(
        getErrorMessage(error),
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
  }, [
    selectedActivityTypeId,
    statusFilter,
    searchQuery,
  ]);

  const findActivityType = (activityTypeId) => {
    return asArray(activityTypes).find(
      (activity) =>
        String(activity?.activityTypeId) === String(activityTypeId)
    );
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setEditingFactor(null);
    setFactorCategoryId('ALL');
    setFormErrors({});
    setSubmitting(false);
  };

  const openAddModal = () => {
    const firstActivity = asArray(activityTypes)[0] || null;

    setEditingFactor(null);
    setFactorCategoryId(firstActivity?.categoryId || 'ALL');

    setFormData({
      activityTypeId: firstActivity?.activityTypeId || '',
      emissionFactor: '',
      unit: firstActivity?.unit || '',
      sourceName: 'IPCC',
      sourceVersion: '',
      effectiveFrom: getTodayDate(),
      effectiveTo: '',
      status: 'ACTIVE',
      remarks: '',
    });

    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (factor) => {
    const activity = findActivityType(factor?.activityTypeId);

    setEditingFactor(factor);
    setFactorCategoryId(activity?.categoryId || 'ALL');

    setFormData({
      activityTypeId: factor?.activityTypeId || '',
      emissionFactor: factor?.emissionFactor ?? '',
      unit: factor?.unit || activity?.unit || '',
      sourceName: factor?.sourceName || 'IPCC',
      sourceVersion: factor?.sourceVersion || '',
      effectiveFrom:
        normalizeDate(
          factor?.effectiveFrom || factor?.effective_from
        ) || getTodayDate(),
      effectiveTo: normalizeDate(
        factor?.effectiveTo || factor?.effective_to
      ),
      status: factor?.status || 'ACTIVE',
      remarks: factor?.remarks || '',
    });

    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleActivityChange = (activityTypeId) => {
    const activity = findActivityType(activityTypeId);

    setFormData((previous) => ({
      ...previous,
      activityTypeId,
      unit: activity?.unit || '',
    }));

    if (activity?.categoryId) {
      setFactorCategoryId(activity.categoryId);
    }

    setFormErrors((previous) => ({
      ...previous,
      activityTypeId: undefined,
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setFactorCategoryId(categoryId);

    setFormData((previous) => ({
      ...previous,
      activityTypeId: '',
      unit: '',
    }));

    setFormErrors((previous) => ({
      ...previous,
      activityTypeId: undefined,
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.activityTypeId) {
      errors.activityTypeId = 'Activity type is required.';
    }

    const factorValue = Number(formData.emissionFactor);

    if (
      formData.emissionFactor === '' ||
      !Number.isFinite(factorValue) ||
      factorValue <= 0
    ) {
      errors.emissionFactor =
        'Emission factor must be greater than 0.';
    }

    if (!formData.unit?.trim()) {
      errors.unit = 'Unit is required.';
    }

    if (!formData.sourceName?.trim()) {
      errors.sourceName = 'Source name is required.';
    }

    if (!formData.effectiveFrom) {
      errors.effectiveFrom = 'Effective From date is required.';
    }

    if (!['ACTIVE', 'INACTIVE'].includes(formData.status)) {
      errors.status = 'Status must be ACTIVE or INACTIVE.';
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const applyBackendErrors = (error) => {
    const responseData = error?.response?.data;

    if (
      responseData &&
      typeof responseData === 'object' &&
      !Array.isArray(responseData)
    ) {
      const fieldErrors = {};

      Object.entries(responseData).forEach(([key, value]) => {
        if (typeof value === 'string') {
          fieldErrors[key] = value;
        }
      });

      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors(fieldErrors);
        return true;
      }
    }

    const message = getErrorMessage(error);
    const lower = message.toLowerCase();

    if (lower.includes('activity')) {
      setFormErrors({
        activityTypeId: message,
      });
      return true;
    }

    if (
      lower.includes('emission factor') ||
      lower.includes('emissionfactor')
    ) {
      setFormErrors({
        emissionFactor: message,
      });
      return true;
    }

    if (lower.includes('unit')) {
      setFormErrors({
        unit: message,
      });
      return true;
    }

    if (lower.includes('source')) {
      setFormErrors({
        sourceName: message,
      });
      return true;
    }

    if (lower.includes('effective')) {
      setFormErrors({
        effectiveFrom: message,
      });
      return true;
    }

    if (lower.includes('status')) {
      setFormErrors({
        status: message,
      });
      return true;
    }

    return false;
  };

  const buildCompletePayload = ({
    factor,
    statusOverride,
    form,
  }) => {
    const sourceVersion =
      form?.sourceVersion?.trim() ||
      factor?.sourceVersion ||
      '';

    return {
      activityTypeId: Number(
        form?.activityTypeId ?? factor?.activityTypeId
      ),
      emissionFactor: Number(
        form?.emissionFactor ?? factor?.emissionFactor
      ),
      unit: String(
        form?.unit ?? factor?.unit ?? ''
      ).trim(),
      sourceName: String(
        form?.sourceName ?? factor?.sourceName ?? 'IPCC'
      ).trim(),
      ...(sourceVersion
        ? { sourceVersion: sourceVersion.trim() }
        : {}),
      effectiveFrom:
        normalizeDate(
          form?.effectiveFrom ??
            factor?.effectiveFrom ??
            factor?.effective_from
        ) || getTodayDate(),
      effectiveTo: normalizeDate(
        form?.effectiveTo ??
          factor?.effectiveTo ??
          factor?.effective_to
      ) || null,
      status:
        statusOverride ||
        form?.status ||
        factor?.status ||
        'ACTIVE',
      remarks: String(
        form?.remarks ?? factor?.remarks ?? ''
      ).trim(),
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (
      editingFactor &&
      !window.confirm(
        `Update emission factor for "${editingFactor.activityTypeName || 'this activity'}"?`
      )
    ) {
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      const payload = buildCompletePayload({
        factor: editingFactor,
        form: formData,
        statusOverride: formData.status,
      });

      if (editingFactor) {
        const response = await api.put(
          `/admin/emission-factors/${editingFactor.emissionFactorId}`,
          payload
        );

        showToast(
          response?.message ||
            'Emission factor updated successfully!',
          'success'
        );
      } else {
        const response = await api.post(
          '/admin/emission-factors',
          payload
        );

        showToast(
          response?.message ||
            'Emission factor created successfully!',
          'success'
        );
      }

      resetModal();
      await fetchData();
    } catch (error) {
      console.error(
        'Emission factor save error:',
        error?.response?.data || error
      );

      if (!applyBackendErrors(error)) {
        showToast(
          getErrorMessage(error),
          'error'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (factor) => {
    if (!factor?.emissionFactorId) {
      return;
    }

    const currentStatus =
      factor.status === 'ACTIVE'
        ? 'ACTIVE'
        : 'INACTIVE';

    const nextStatus =
      currentStatus === 'ACTIVE'
        ? 'INACTIVE'
        : 'ACTIVE';

    const confirmed = window.confirm(
      `Change this emission factor from ${currentStatus} to ${nextStatus}?`
    );

    if (!confirmed) {
      return;
    }

    setStatusUpdatingId(factor.emissionFactorId);

    try {
      /*
       * IMPORTANT:
       * Send the complete update DTO.
       * Do not send only { status: 'INACTIVE' }.
       */
      const payload = buildCompletePayload({
        factor,
        statusOverride: nextStatus,
      });

      /*
       * Client-side validation before request.
       */
      if (!payload.activityTypeId) {
        throw new Error(
          'Activity type is missing from this emission factor.'
        );
      }

      if (
        !Number.isFinite(payload.emissionFactor) ||
        payload.emissionFactor <= 0
      ) {
        throw new Error(
          'Emission factor value is invalid.'
        );
      }

      if (!payload.unit) {
        throw new Error(
          'Unit is missing from this emission factor.'
        );
      }

      if (!payload.sourceName) {
        throw new Error(
          'Source name is missing from this emission factor.'
        );
      }

      if (!payload.effectiveFrom) {
        throw new Error(
          'Effective From date is missing from this emission factor.'
        );
      }

      const response = await api.put(
        `/admin/emission-factors/${factor.emissionFactorId}`,
        payload
      );

      showToast(
        response?.message ||
          `Emission factor changed to ${nextStatus}.`,
        'success'
      );

      await fetchData();
    } catch (error) {
      console.error(
        'Emission factor status update error:',
        error?.response?.data || error
      );

      showToast(
        getErrorMessage(error),
        'error'
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingFactor?.emissionFactorId) {
      return;
    }

    try {
      const response = await api.delete(
        `/admin/emission-factors/${deletingFactor.emissionFactorId}`
      );

      showToast(
        response?.message ||
          'Emission factor deleted successfully!',
        'success'
      );

      setDeletingFactor(null);
      await fetchData();
    } catch (error) {
      console.error(
        'Emission factor delete error:',
        error?.response?.data || error
      );

      showToast(
        getErrorMessage(error),
        'error'
      );
    }
  };

  const filteredFactors = asArray(
    emissionFactors
  ).filter((factor) => {
    const query = searchQuery.trim().toLowerCase();

    const searchableValues = [
      factor?.activityTypeName,
      factor?.categoryName,
      factor?.sourceName,
      factor?.remarks,
      factor?.unit,
      factor?.emissionFactor,
    ];

    const matchesSearch =
      !query ||
      searchableValues.some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(query)
      );

    const matchesActivity =
      selectedActivityTypeId === 'ALL' ||
      String(factor?.activityTypeId) ===
        String(selectedActivityTypeId);

    const matchesStatus =
      statusFilter === 'ALL' ||
      factor?.status === statusFilter;

    return (
      matchesSearch &&
      matchesActivity &&
      matchesStatus
    );
  });

  const safePage = Math.max(1, page);

  const paginatedFactors = paginate(
    filteredFactors,
    safePage,
    pageSize
  );

  const uniqueCategories = [
    ...new Map(
      asArray(activityTypes)
        .filter(Boolean)
        .map((activity) => [
          activity.categoryId,
          activity,
        ])
    ).values(),
  ];

  const availableActivities =
    asArray(activityTypes).filter(
      (activity) =>
        factorCategoryId === 'ALL' ||
        String(activity?.categoryId) ===
          String(factorCategoryId)
    );

  const renderIcon = (activityName = '') => {
    const text = String(
      activityName
    ).toLowerCase();

    const Icon =
      ICON_OPTIONS.find((item) =>
        text.includes(
          item.name.toLowerCase()
        )
      )?.icon || Activity;

    return (
      <Icon className="h-4 w-4 text-emerald-400" />
    );
  };

  const totalFactors =
    emissionFactors.length;

  const activeFactors =
    emissionFactors.filter(
      (factor) =>
        factor?.status === 'ACTIVE'
    ).length;

  const inactiveFactors =
    emissionFactors.filter(
      (factor) =>
        factor?.status === 'INACTIVE'
    ).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <main className="mx-auto w-full max-w-7xl space-y-8 px-5 py-8 lg:px-8">

        {/* HEADER */}
        <section className="flex flex-col items-start justify-between gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-extrabold text-white sm:text-3xl">
              <Leaf className="h-7 w-7 text-emerald-400" />
              Emission Factor Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Configure emission factors for each activity type.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                className={
                  loading
                    ? 'h-4 w-4 animate-spin'
                    : 'h-4 w-4'
                }
              />
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" />
              Add Emission Factor
            </button>
          </div>
        </section>


        {/* SUMMARY */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Factors
            </p>

            <p className="mt-1 text-3xl font-black text-white">
              {totalFactors}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-slate-800/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Active Factors
            </p>

            <p className="mt-1 text-3xl font-black text-emerald-400">
              {activeFactors}
            </p>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-slate-800/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              Inactive Factors
            </p>

            <p className="mt-1 text-3xl font-black text-rose-400">
              {inactiveFactors}
            </p>
          </div>

        </section>


        {/* ACTIVITY FILTER */}
        <section className="space-y-4">

          <div className="flex gap-2 overflow-x-auto border-b border-slate-800 pb-2">

            <button
              type="button"
              onClick={() => {
                setSelectedActivityTypeId('ALL');
                setPage(1);
              }}
              className={
                selectedActivityTypeId === 'ALL'
                  ? 'flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-slate-950'
                  : 'flex shrink-0 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-400'
              }
            >
              <Layers className="h-3.5 w-3.5" />
              All Activity Types ({activityTypes.length})
            </button>

            {activityTypes.map((activity) => (
              <button
                type="button"
                key={activity.activityTypeId}
                onClick={() => {
                  setSelectedActivityTypeId(
                    activity.activityTypeId
                  );
                  setPage(1);
                }}
                className={
                  String(
                    selectedActivityTypeId
                  ) ===
                  String(
                    activity.activityTypeId
                  )
                    ? 'flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-slate-950'
                    : 'flex shrink-0 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-400'
                }
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                {activity.activityName}
                {' ('}
                {activity.categoryName}
                {')'}
              </button>
            ))}
          </div>


          {/* SEARCH + STATUS */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-800/40 p-4 sm:flex-row">

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(
                    event.target.value
                  );
                  setPage(1);
                }}
                placeholder="Search activity, source..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                  className={
                    statusFilter === status
                      ? 'rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-slate-950'
                      : 'rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-400'
                  }
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </section>


        {/* TABLE */}
        <section className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-800/50 shadow-xl">

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-400" />
              Loading emission factors...
            </div>
          ) : filteredFactors.length === 0 ? (
            <div className="p-12 text-center">
              <Leaf className="mx-auto mb-3 h-12 w-12 text-slate-600" />

              <p className="font-semibold text-slate-300">
                No emission factors found
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Try another search or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1180px] table-fixed text-sm">

                <thead className="border-b border-slate-700 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">

                  <tr>

                    <th className="w-[280px] px-5 py-4 text-left">
                      Activity
                    </th>

                    <th className="w-[130px] px-5 py-4 text-center">
                      Factor
                    </th>

                    <th className="w-[110px] px-5 py-4 text-center">
                      Unit
                    </th>

                    <th className="w-[180px] px-5 py-4 text-left">
                      Source
                    </th>

                    <th className="w-[190px] px-5 py-4 text-center">
                      Status
                    </th>

                    <th className="w-[180px] px-5 py-4 text-center">
                      Created At
                    </th>

                    <th className="w-[180px] px-5 py-4 text-center">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-800">

                  {paginatedFactors.map((factor) => {

                    const updating =
                      statusUpdatingId ===
                      factor.emissionFactorId;

                    return (
                      <tr
                        key={
                          factor.emissionFactorId
                        }
                        className="transition hover:bg-slate-800/40"
                      >

                        {/* ACTIVITY */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900">
                              {renderIcon(
                                factor.activityTypeName
                              )}
                            </div>

                            <div className="min-w-0">

                              <p className="truncate font-semibold text-white">
                                {
                                  factor.activityTypeName
                                }
                              </p>

                              <p className="truncate text-xs text-slate-400">
                                {
                                  factor.categoryName
                                }
                              </p>

                            </div>

                          </div>
                        </td>


                        {/* FACTOR */}

                        <td className="px-5 py-4 text-center font-mono font-bold text-emerald-400">
                          {
                            factor.emissionFactor
                          }
                        </td>


                        {/* UNIT */}

                        <td className="px-5 py-4 text-center font-mono text-xs text-teal-400">
                          {factor.unit}
                        </td>


                        {/* SOURCE */}

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            {factor.sourceName || 'IPCC'}
                          </span>
                        </td>


                        {/* STATUS */}

                        <td className="px-5 py-4 text-center">

                          <button
                            type="button"
                            onClick={() =>
                              toggleStatus(factor)
                            }
                            disabled={updating}
                            title={
                              factor.status === 'ACTIVE'
                                ? 'Click to deactivate'
                                : 'Click to activate'
                            }
                            className={
                              factor.status === 'ACTIVE'
                                ? 'inline-flex items-center gap-1.5 rounded-full border border-emerald-700/60 bg-emerald-950/80 px-3 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-900/60 disabled:cursor-not-allowed disabled:opacity-50'
                                : 'inline-flex items-center gap-1.5 rounded-full border border-rose-700/60 bg-rose-950/80 px-3 py-1.5 text-xs font-bold text-rose-300 transition hover:bg-rose-900/60 disabled:cursor-not-allowed disabled:opacity-50'
                            }
                          >

                            {updating ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : factor.status === 'ACTIVE' ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}

                            {updating
                              ? 'UPDATING'
                              : factor.status}

                          </button>

                        </td>


                        {/* CREATED */}

                        <td className="whitespace-nowrap px-5 py-4 text-center text-xs text-slate-400">
                          {formatCreatedAt(
                            factor.createdAt
                          )}
                        </td>


                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-center gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  factor
                                )
                              }
                              disabled={updating}
                              title="Edit Factor"
                              className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-teal-400 transition hover:bg-slate-700 disabled:opacity-50"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                toggleStatus(
                                  factor
                                )
                              }
                              disabled={updating}
                              title={
                                factor.status === 'ACTIVE'
                                  ? 'Set Inactive'
                                  : 'Set Active'
                              }
                              className={
                                factor.status === 'ACTIVE'
                                  ? 'rounded-lg border border-slate-700 bg-slate-800 p-2 text-amber-400 transition hover:bg-amber-950/50 disabled:opacity-50'
                                  : 'rounded-lg border border-slate-700 bg-slate-800 p-2 text-emerald-400 transition hover:bg-emerald-950/50 disabled:opacity-50'
                              }
                            >
                              {updating ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : factor.status === 'ACTIVE' ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                setDeletingFactor(
                                  factor
                                )
                              }
                              disabled={updating}
                              title="Delete Factor"
                              className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-rose-400 transition hover:bg-rose-900/60 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>
            </div>
          )}

        </section>


        {/* PAGINATION */}

        <Pagination
          page={safePage}
          pageSize={pageSize}
          total={filteredFactors.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />

      </main>


      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">

              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <Leaf className="h-5 w-5 text-emerald-400" />

                {editingFactor
                  ? 'Update Emission Factor'
                  : 'Add New Emission Factor'}
              </h2>

              <button
                type="button"
                onClick={resetModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="space-y-5 pt-5"
            >

              {/* INFO */}

              <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-3 text-xs leading-5 text-teal-100">
                <span className="font-bold text-teal-300">
                  Calculation:
                </span>{' '}
                Carbon emission = quantity × emission factor.
              </div>


              {/* CATEGORY */}

              <div>

                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Category
                </label>

                <select
                  value={factorCategoryId}
                  onChange={(event) =>
                    handleCategoryChange(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                >
                  <option value="ALL">
                    All categories
                  </option>

                  {uniqueCategories.map(
                    (category) => (
                      <option
                        key={
                          category.categoryId
                        }
                        value={
                          category.categoryId
                        }
                      >
                        {
                          category.categoryName
                        }
                      </option>
                    )
                  )}
                </select>

              </div>


              {/* ACTIVITY */}

              <div>

                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Activity Type *
                </label>

                <select
                  value={
                    formData.activityTypeId
                  }
                  onChange={(event) =>
                    handleActivityChange(
                      event.target.value
                    )
                  }
                  className={
                    formErrors.activityTypeId
                      ? 'w-full rounded-xl border border-rose-500 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none'
                      : 'w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500'
                  }
                >

                  <option value="">
                    -- Select Activity Type --
                  </option>

                  {availableActivities.map(
                    (activity) => (
                      <option
                        key={
                          activity.activityTypeId
                        }
                        value={
                          activity.activityTypeId
                        }
                      >
                        {
                          activity.activityName
                        }
                        {' ('}
                        {
                          activity.categoryName
                        }
                        {')'}
                      </option>
                    )
                  )}

                </select>


                {formErrors.activityTypeId && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-rose-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {
                      formErrors.activityTypeId
                    }
                  </p>
                )}

              </div>


              {/* FACTOR + UNIT */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Emission Factor *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={
                      formData.emissionFactor
                    }
                    onChange={(event) =>
                      setFormData(
                        (previous) => ({
                          ...previous,
                          emissionFactor:
                            event.target.value,
                        })
                      )
                    }
                    className={
                      formErrors.emissionFactor
                        ? 'w-full rounded-xl border border-rose-500 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none'
                        : 'w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500'
                    }
                    placeholder="e.g. 0.21"
                  />

                  {formErrors.emissionFactor && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-rose-400">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {
                        formErrors.emissionFactor
                      }
                    </p>
                  )}

                </div>


                <div>

                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Unit *
                  </label>

                  <input
                    type="text"
                    readOnly
                    value={
                      formData.unit
                    }
                    className={
                      formErrors.unit
                        ? 'w-full rounded-xl border border-rose-500 bg-slate-800 px-3.5 py-2.5 font-mono text-sm text-teal-400 outline-none'
                        : 'w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 font-mono text-sm text-teal-400'
                    }
                  />

                  {formErrors.unit && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-rose-400">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {formErrors.unit}
                    </p>
                  )}

                </div>

              </div>


              {/* SOURCE */}

              <div>

                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Source Name *
                </label>

                <select
                  value={
                    formData.sourceName
                  }
                  onChange={(event) =>
                    setFormData(
                      (previous) => ({
                        ...previous,
                        sourceName:
                          event.target.value,
                      })
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                >

                  {STANDARD_SOURCES.map(
                    (source) => (
                      <option
                        key={source}
                        value={source}
                      >
                        {source}
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* SOURCE VERSION */}

              <div>

                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Source Version
                  <span className="ml-2 text-[10px] font-normal normal-case text-slate-500">
                    optional
                  </span>
                </label>

                <input
                  type="text"
                  value={
                    formData.sourceVersion
                  }
                  onChange={(event) =>
                    setFormData(
                      (previous) => ({
                        ...previous,
                        sourceVersion:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="e.g. IPCC 2006"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
                />

              </div>

              {/* STATUS */}

              <div>

                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Status *
                </label>

                <select
                  value={
                    formData.status
                  }
                  onChange={(event) =>
                    setFormData(
                      (previous) => ({
                        ...previous,
                        status:
                          event.target.value,
                      })
                    )
                  }
                  className={
                    formErrors.status
                      ? 'w-full rounded-xl border border-rose-500 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none'
                      : 'w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500'
                  }
                >

                  <option value="ACTIVE">
                    ACTIVE
                  </option>

                  <option value="INACTIVE">
                    INACTIVE
                  </option>

                </select>

                {formErrors.status && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-rose-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {formErrors.status}
                  </p>
                )}

              </div>


              {/* REMARKS */}

              <div>

                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Remarks
                </label>

                <input
                  type="text"
                  value={
                    formData.remarks
                  }
                  onChange={(event) =>
                    setFormData(
                      (previous) => ({
                        ...previous,
                        remarks:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="Optional notes..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
                />

              </div>


              {/* FORM ERROR */}

              {Object.keys(formErrors).length > 0 &&
                formErrors.general && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-900/50 bg-rose-950/30 px-4 py-3 text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4" />
                    {formErrors.general}
                  </div>
                )}


              {/* BUTTONS */}

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-5">

                <button
                  type="button"
                  onClick={resetModal}
                  disabled={submitting}
                  className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {submitting && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}

                  {editingFactor
                    ? 'Save Changes'
                    : 'Create Factor'}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {deletingFactor && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="flex items-center gap-3 text-rose-400">

              <AlertCircle className="h-7 w-7" />

              <h3 className="text-lg font-bold text-white">
                Delete Emission Factor
              </h3>

            </div>


            <p className="text-sm leading-6 text-slate-300">

              Are you sure you want to delete emission factor{' '}

              <strong className="text-white">
                {
                  deletingFactor.emissionFactor
                }
              </strong>{' '}

              for{' '}

              <strong className="text-emerald-400">
                {
                  deletingFactor.activityTypeName
                }
              </strong>
              ?

            </p>


            <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">

              <button
                type="button"
                onClick={() =>
                  setDeletingFactor(null)
                }
                className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDelete
                }
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-500"
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

export default EmissionFactorManagementPage;