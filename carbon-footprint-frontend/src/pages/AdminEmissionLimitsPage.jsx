import React, {
  useEffect,
  useState,
  useCallback,
} from 'react';

import api from '../api/axios';

import {
  Gauge,
  Save,
  Trash2,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Edit3,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { formatCreatedAt } from '../utils/dateTime';

import Pagination from '../components/Pagination';

import { paginate } from '../utils/clientPagination';

export default function AdminEmissionLimitsPage() {
  const [page, setPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(5);

  const [limits, setLimits] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('ALL');

  /*
   * Used for both Create and Edit.
   */
  const [editingLimit, setEditingLimit] =
    useState(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [form, setForm] =
    useState({
      categoryId: '',
      monthlyLimit: '',
      active: true,
    });

  const [errors, setErrors] =
    useState({});

  const [msg, setMsg] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [statusUpdatingId, setStatusUpdatingId] =
    useState(null);

  /*
   * ==========================================================
   * LOAD COMPLETE DATASET
   * ==========================================================
   */
  const load = useCallback(
    async () => {
      setLoading(true);

      try {
        const [
          limitResponse,
          categoryResponse,
        ] = await Promise.all([
          api
            .get(
              '/admin/emission-limits'
            )
            .catch(() => ({
              data: [],
            })),

          api
            .get(
              '/admin/categories'
            )
            .catch(() => ({
              data: [],
            })),
        ]);

        setLimits(
          Array.isArray(
            limitResponse?.data
          )
            ? limitResponse.data
            : []
        );

        setCategories(
          Array.isArray(
            categoryResponse?.data
          )
            ? categoryResponse.data
            : []
        );
      } catch (error) {
        setLimits([]);
        setCategories([]);

        setErrors({
          general:
            error?.message ||
            'Failed to load emission limits.',
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [
    searchQuery,
    statusFilter,
  ]);

  /*
   * ==========================================================
   * RESET / REFRESH
   * ==========================================================
   */
  const handleRefresh =
    async () => {
      setSearchQuery('');
      setStatusFilter('ALL');
      setPage(1);
      setErrors({});
      setMsg('');

      await load();
    };

  /*
   * ==========================================================
   * OPEN CREATE MODAL
   * ==========================================================
   */
  const openCreateModal = () => {
    setEditingLimit(null);

    setForm({
      categoryId: '',
      monthlyLimit: '',
      active: true,
    });

    setErrors({});
    setMsg('');
    setIsModalOpen(true);
  };

  /*
   * ==========================================================
   * OPEN EDIT MODAL
   * ==========================================================
   */
  const openEditModal = (
    limit
  ) => {
    setEditingLimit(limit);

    setForm({
      categoryId:
        limit?.categoryId || '',

      monthlyLimit:
        limit?.monthlyLimit ?? '',

      active:
        !!limit?.active,
    });

    setErrors({});
    setMsg('');
    setIsModalOpen(true);
  };

  /*
   * ==========================================================
   * FORM VALIDATION
   * ==========================================================
   */
  const validate = () => {
    const validationErrors = {};

    if (!form.categoryId) {
      validationErrors.categoryId =
        'Select a category.';
    }

    if (
      !form.monthlyLimit ||
      Number(form.monthlyLimit) <=
        0
    ) {
      validationErrors.monthlyLimit =
        'Limit must be greater than 0.';
    }

    setErrors(
      validationErrors
    );

    return (
      Object.keys(
        validationErrors
      ).length === 0
    );
  };

  /*
   * ==========================================================
   * SAVE / UPDATE
   * ==========================================================
   *
   * Create -> POST
   * Edit   -> PUT
   */
  const save = async (
    event
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    setMsg('');
    setErrors({});

    try {
      const payload = {
        categoryId: Number(
          form.categoryId
        ),

        monthlyLimit: Number(
          form.monthlyLimit
        ),

        active: !!form.active,
      };

      if (editingLimit) {
        /*
         * Existing emission-limit update.
         */
        await api.put(
          `/admin/emission-limits/${editingLimit.id}`,
          payload
        );

        setMsg(
          'Emission limit updated successfully.'
        );
      } else {
        /*
         * New emission-limit creation.
         */
        await api.post(
          '/admin/emission-limits',
          payload
        );

        setMsg(
          'Emission limit saved successfully.'
        );
      }

      setForm({
        categoryId: '',
        monthlyLimit: '',
        active: true,
      });

      setEditingLimit(null);
      setErrors({});

      setPage(1);

      await load();

      /*
       * Keep modal closed after successful save/update.
       */
      setIsModalOpen(false);
    } catch (error) {
      setErrors({
        general:
          error?.message ||
          `Failed to ${
            editingLimit
              ? 'update'
              : 'save'
          } emission limit.`,
      });
    } finally {
      setSaving(false);
    }
  };

  /*
   * ==========================================================
   * DIRECT ACTIVE / INACTIVE TOGGLE
   * ==========================================================
   */
  const toggleStatus = async (
    limit
  ) => {
    if (!limit?.id) {
      return;
    }

    const currentStatus =
      limit.active
        ? 'ACTIVE'
        : 'INACTIVE';

    const nextStatus =
      limit.active
        ? 'INACTIVE'
        : 'ACTIVE';

    const confirmed =
      window.confirm(
        `Change ${limit.categoryName || 'this emission limit'} from ${currentStatus} to ${nextStatus}?`
      );

    if (!confirmed) {
      return;
    }

    setStatusUpdatingId(
      limit.id
    );

    try {
      /*
       * Use PUT on the existing record so only
       * the active flag changes.
       */
      await api.put(
        `/admin/emission-limits/${limit.id}`,
        {
          categoryId: Number(
            limit.categoryId
          ),

          monthlyLimit: Number(
            limit.monthlyLimit
          ),

          active:
            !limit.active,
        }
      );

      setMsg(
        `Emission limit marked ${nextStatus}.`
      );

      await load();
    } catch (error) {
      setErrors({
        general:
          error?.message ||
          'Failed to update emission-limit status.',
      });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  /*
   * ==========================================================
   * DELETE
   * ==========================================================
   */
  const remove = async (
    id
  ) => {
    if (
      !window.confirm(
        'Delete this emission limit?'
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/admin/emission-limits/${id}`
      );

      setPage(1);

      setMsg(
        'Emission limit deleted successfully.'
      );

      await load();
    } catch (error) {
      setErrors({
        general:
          error?.message ||
          'Failed to delete emission limit.',
      });
    }
  };

  /*
   * ==========================================================
   * GLOBAL FILTERING
   * ==========================================================
   */
  const filteredLimits =
    limits.filter((limit) => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      const matchesSearch =
        !query ||
        [
          limit?.categoryName,
          limit?.unit,
          limit?.monthlyLimit,
          limit?.status,
        ].some((value) =>
          String(value ?? '')
            .toLowerCase()
            .includes(query)
        );

      const currentStatus =
        limit?.active
          ? 'ACTIVE'
          : 'INACTIVE';

      const matchesStatus =
        statusFilter === 'ALL' ||
        currentStatus ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  const safePage = Math.max(
    1,
    page
  );

  const paginatedLimits =
    paginate(
      filteredLimits,
      safePage,
      pageSize
    );

  /*
   * Chart uses complete filtered dataset.
   */
  const chartData =
    filteredLimits.map(
      (limit) => ({
        category:
          limit?.categoryName ||
          'Unknown',

        limit: Number(
          limit?.monthlyLimit ||
            0
        ),
      })
    );

  /*
   * Categories that don't already have a limit.
   *
   * During EDIT, the currently edited category is
   * allowed because it already belongs to that record.
   */
  const existingCategoryIds =
    new Set(
      limits
        .filter(
          (limit) =>
            !editingLimit ||
            String(
              limit?.id
            ) !==
              String(
                editingLimit?.id
              )
        )
        .map((limit) =>
          String(
            limit?.categoryId
          )
        )
    );

  const availableCategories =
    categories.filter(
      (category) =>
        !existingCategoryIds.has(
          String(
            category?.categoryId
          )
        ) ||
        String(
          category?.categoryId
        ) ===
          String(
            editingLimit?.categoryId
          )
    );

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-5 py-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-extrabold text-white">
            <Gauge className="h-7 w-7 text-emerald-400" />

            Emission Limits
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Configure monthly category emission limits. Warnings are triggered when users exceed these thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={
              handleRefresh
            }
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            title="Reset filters and refresh complete dataset"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading
                  ? 'animate-spin'
                  : ''
              }`}
            />

            {loading
              ? 'Refreshing...'
              : 'Refresh'}
          </button>

          <button
            type="button"
            onClick={
              openCreateModal
            }
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400"
          >
            <Save className="h-4 w-4" />

            Add Limit
          </button>
        </div>
      </div>

      {/* GLOBAL FILTER */}
      <section className="rounded-2xl border border-slate-700 bg-slate-800/40 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:w-80">
            <input
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search category..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              'ALL',
              'ACTIVE',
              'INACTIVE',
            ].map(
              (filter) => (
                <button
                  type="button"
                  key={filter}
                  onClick={() => {
                    setStatusFilter(
                      filter
                    );
                    setPage(1);
                  }}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                    statusFilter ===
                    filter
                      ? 'bg-emerald-500 text-slate-950'
                      : 'border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {filter}
                </button>
              )
            )}

            <span className="ml-1 text-xs text-slate-400">
              Showing{' '}
              {
                filteredLimits.length
              }{' '}
              of {limits.length}{' '}
              records
            </span>
          </div>
        </div>
      </section>

      {/* MESSAGE */}
      {errors.general && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-800 bg-rose-950/50 px-4 py-3 text-sm text-rose-300">
          <AlertCircle className="h-4 w-4" />

          {errors.general}
        </div>
      )}

      {msg && (
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/50 px-4 py-3 text-sm font-semibold text-emerald-300">
          {msg}
        </div>
      )}

      {/* MONTHLY LIMIT CHART */}
      {!loading &&
        filteredLimits.length >
          0 && (
          <section className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-xl">
            <div className="mb-5 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-400" />

              <div>
                <h2 className="font-bold text-white">
                  Monthly Limit Dataset
                </h2>

                <p className="text-xs text-slate-400">
                  Based on the complete filtered dataset
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    chartData
                  }
                  margin={{
                    top: 20,
                    right: 25,
                    left: 10,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid
                    stroke="#64748B"
                    strokeDasharray="4 4"
                    opacity={0.35}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="category"
                    tick={{
                      fill: '#F1F5F9',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                    tickLine={{
                      stroke:
                        '#94A3B8',
                    }}
                    axisLine={{
                      stroke:
                        '#94A3B8',
                    }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={75}
                  />

                  <YAxis
                    tick={{
                      fill: '#F1F5F9',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                    tickLine={{
                      stroke:
                        '#94A3B8',
                    }}
                    axisLine={{
                      stroke:
                        '#94A3B8',
                    }}
                    width={55}
                  />

                  <Tooltip
                    cursor={{
                      fill: '#64748B',
                      opacity: 0.18,
                    }}
                    contentStyle={{
                      backgroundColor:
                        '#0F172A',
                      border:
                        '1px solid #64748B',
                      borderRadius:
                        '10px',
                      color: '#F8FAFC',
                    }}
                    labelStyle={{
                      color: '#F8FAFC',
                      fontWeight: 700,
                      marginBottom:
                        '5px',
                    }}
                    itemStyle={{
                      color: '#34D399',
                      fontWeight: 700,
                    }}
                    formatter={(
                      value
                    ) => [
                      `${Number(
                        value
                      ).toFixed(
                        2
                      )} kg CO₂e`,
                      'Monthly Limit',
                    ]}
                  />

                  <Bar
                    dataKey="limit"
                    name="Monthly Limit"
                    fill="#34D399"
                    stroke="#A7F3D0"
                    strokeWidth={1}
                    radius={[
                      7,
                      7,
                      0,
                      0,
                    ]}
                    maxBarSize={65}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

      {/* SUMMARY CARDS */}
      {!loading &&
        filteredLimits.length >
          0 && (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {filteredLimits.map(
              (limit) => (
                <div
                  key={`summary-${limit.id}`}
                  className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {limit.categoryName ||
                          'Unknown'}
                      </p>

                      <p className="mt-1 text-2xl font-black text-emerald-400">
                        {Number(
                          limit.monthlyLimit ||
                            0
                        ).toFixed(
                          2
                        )}
                      </p>

                      <p className="text-xs text-slate-400">
                        {limit.unit ||
                          'kg CO₂e'}{' '}
                        / month
                      </p>
                    </div>

                    <Gauge className="h-5 w-5 shrink-0 text-teal-400" />
                  </div>

                  <span
                    className={`mt-4 inline-flex rounded-full border px-2 py-1 text-[10px] font-bold ${
                      limit.active
                        ? 'border-emerald-800 bg-emerald-950 text-emerald-400'
                        : 'border-rose-800 bg-rose-950 text-rose-400'
                    }`}
                  >
                    {limit.active
                      ? 'ACTIVE'
                      : 'INACTIVE'}
                  </span>
                </div>
              )
            )}
          </section>
        )}

      {/* TABLE */}
      <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60 shadow-xl">
        {loading ? (
          <div className="p-10 text-center text-slate-400">
            <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-400" />

            Loading emission limits...
          </div>
        ) : filteredLimits.length >
          0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-4">
                    Category
                  </th>

                  <th className="p-4 text-center">
                    Monthly Limit
                  </th>

                  <th className="p-4 text-center">
                    Unit
                  </th>

                  <th className="p-4 text-center">
                    Created
                  </th>

                  <th className="p-4 text-center">
                    Status
                  </th>

                  <th className="p-4 text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {paginatedLimits.map(
                  (limit) => {
                    const isUpdating =
                      statusUpdatingId ===
                      limit.id;

                    return (
                      <tr
                        key={limit.id}
                        className="transition hover:bg-slate-800/50"
                      >
                        <td className="p-4 font-semibold text-white">
                          {
                            limit.categoryName
                          }
                        </td>

                        <td className="p-4 text-center font-mono font-bold text-emerald-400">
                          {Number(
                            limit.monthlyLimit ||
                              0
                          ).toFixed(
                            2
                          )}
                        </td>

                        <td className="p-4 text-center text-slate-300">
                          {limit.unit ||
                            'kg CO₂e'}
                        </td>

                        <td className="p-4 text-center text-xs text-slate-400">
                          <span className="whitespace-nowrap">
                            {formatCreatedAt(
                              limit.createdAt
                            )}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            disabled={
                              isUpdating
                            }
                            onClick={() =>
                              toggleStatus(
                                limit
                              )
                            }
                            title={`Change to ${
                              limit.active
                                ? 'INACTIVE'
                                : 'ACTIVE'
                            }`}
                            className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold transition ${
                              limit.active
                                ? 'border-emerald-800 bg-emerald-950 text-emerald-400 hover:bg-emerald-900'
                                : 'border-rose-800 bg-rose-950 text-rose-400 hover:bg-rose-900'
                            } ${
                              isUpdating
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer'
                            }`}
                          >
                            {isUpdating ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : limit.active ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}

                            {isUpdating
                              ? 'UPDATING'
                              : limit.active
                              ? 'ACTIVE'
                              : 'INACTIVE'}
                          </button>
                        </td>

                        {/* ACTIONS */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  limit
                                )
                              }
                              className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-teal-400 transition hover:bg-slate-700"
                              title="Edit Emission Limit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                toggleStatus(
                                  limit
                                )
                              }
                              className={`rounded-lg border border-slate-700 bg-slate-800 p-2 transition ${
                                limit.active
                                  ? 'text-amber-400 hover:bg-amber-950/50'
                                  : 'text-emerald-400 hover:bg-emerald-950/50'
                              } disabled:opacity-50`}
                              title={
                                limit.active
                                  ? 'Set Inactive'
                                  : 'Set Active'
                              }
                            >
                              {isUpdating ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : limit.active ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                remove(
                                  limit.id
                                )
                              }
                              className="rounded-lg bg-rose-950/70 p-2 text-rose-400 transition hover:bg-rose-900"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <Gauge className="mx-auto mb-3 h-10 w-10 text-slate-600" />

            <p className="font-semibold text-slate-300">
              No emission limits found
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Try another search or status filter.
            </p>
          </div>
        )}
      </section>

      {/* PAGINATION */}
      <Pagination
        page={safePage}
        pageSize={pageSize}
        total={
          filteredLimits.length
        }
        onPageChange={setPage}
        onPageSizeChange={(
          newSize
        ) => {
          setPageSize(newSize);
          setPage(1);
        }}
      />

      {/* =====================================================
          ADD / EDIT LIMIT MODAL
         ===================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                  <Gauge className="h-5 w-5 text-emerald-400" />

                  {editingLimit
                    ? 'Edit Emission Limit'
                    : 'Add Emission Limit'}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Configure the monthly category threshold.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(
                    false
                  );
                  setEditingLimit(
                    null
                  );
                  setErrors({});
                  setMsg('');
                }}
                className="text-xl text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={save}
              className="space-y-5"
            >
              {/* CATEGORY */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Category *
                </label>

                <select
                  value={
                    form.categoryId
                  }
                  onChange={(event) => {
                    setForm(
                      (current) => ({
                        ...current,
                        categoryId:
                          event
                            .target
                            .value,
                      })
                    );

                    setErrors({});
                    setMsg('');
                  }}
                  className={`w-full rounded-xl border bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none ${
                    errors.categoryId
                      ? 'border-rose-500'
                      : 'border-slate-700 focus:border-emerald-500'
                  }`}
                >
                  <option value="">
                    -- Select Category --
                  </option>

                  {availableCategories.map(
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

                {errors.categoryId && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-rose-400">
                    <AlertCircle className="h-3 w-3" />

                    {
                      errors.categoryId
                    }
                  </p>
                )}
              </div>

              {/* MONTHLY LIMIT */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Monthly Limit (kg CO₂e) *
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    form.monthlyLimit
                  }
                  onChange={(event) => {
                    setForm(
                      (current) => ({
                        ...current,
                        monthlyLimit:
                          event
                            .target
                            .value,
                      })
                    );

                    setErrors({});
                    setMsg('');
                  }}
                  className={`w-full rounded-xl border bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:outline-none ${
                    errors.monthlyLimit
                      ? 'border-rose-500'
                      : 'border-slate-700 focus:border-emerald-500'
                  }`}
                  placeholder="e.g. 25.00"
                />

                {errors.monthlyLimit && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-rose-400">
                    <AlertCircle className="h-3 w-3" />

                    {
                      errors.monthlyLimit
                    }
                  </p>
                )}
              </div>

              {/* STATUS */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Status
                </label>

                <select
                  value={
                    form.active
                      ? 'ACTIVE'
                      : 'INACTIVE'
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        active:
                          event
                            .target
                            .value ===
                          'ACTIVE',
                      })
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ACTIVE">
                    ACTIVE
                  </option>

                  <option value="INACTIVE">
                    INACTIVE
                  </option>
                </select>
              </div>

              {errors.general && (
                <p className="flex items-center gap-1 text-xs text-rose-400">
                  <AlertCircle className="h-3.5 w-3.5" />

                  {errors.general}
                </p>
              )}

              {/* BUTTONS */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(
                      false
                    );
                    setEditingLimit(
                      null
                    );
                    setErrors({});
                  }}
                  className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  {saving
                    ? 'Saving...'
                    : editingLimit
                    ? 'Update Limit'
                    : 'Save Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}