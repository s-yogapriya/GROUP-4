import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

import {
  Activity,
  Plus,
  Calendar,
  Leaf,
  Trash2,
  Edit3,
  Search,
  RefreshCw,
  AlertCircle,
  Car,
  Zap,
  Utensils,
  ShoppingBag,
  Truck,
  Flame,
  Factory,
  TreePine,
  Wind,
  Plane,
  Bike,
  Bus,
  Train,
  Trash,
  Home,
  Globe,
  CheckCircle2,
  Layers,
  Sun,
  Package,
  TrendingUp,
  X,
} from 'lucide-react';

import { formatCreatedAt } from '../utils/dateTime';
import Pagination from '../components/Pagination';

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';


/* =========================================================
   ICON MAP
========================================================= */

const ICON_MAP = {
  Car,
  Zap,
  Utensils,
  ShoppingBag,
  Truck,
  Flame,
  Factory,
  TreePine,
  Wind,
  Plane,
  Bike,
  Bus,
  Train,
  Trash,
  Home,
  Globe,
  Activity,
  Sun,
  Package,
};


/* =========================================================
   CHART COLORS
========================================================= */

const CATEGORY_CHART_COLORS = [
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#f59e0b',
  '#f97316',
  '#a855f7',
  '#ec4899',
  '#14b8a6',
  '#84cc16',
  '#ef4444',
  '#8b5cf6',
  '#eab308',
];


/* =========================================================
   HELPERS
========================================================= */

const getTodayDate = () => {
  return new Date()
    .toISOString()
    .split('T')[0];
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

  if (error?.data?.message) {
    return error.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'Unable to complete the request.';
};


/* =========================================================
   COMPONENT
========================================================= */

const ActivityLoggingPage = () => {
  const { showToast } = useAuth();
  const location = useLocation();

  const isHistory =
    location.pathname.endsWith('/history');


  /* =======================================================
     PAGINATION
  ======================================================= */

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);


  /* =======================================================
     DATA
  ======================================================= */

  const [categories, setCategories] = useState([]);

  const [activityTypes, setActivityTypes] =
    useState([]);

  const [allActivityTypes, setAllActivityTypes] =
    useState([]);

  const [activityLogs, setActivityLogs] =
    useState([]);

  const [allActivityLogs, setAllActivityLogs] =
    useState([]);

  const [totalRecords, setTotalRecords] =
    useState(0);


  /* =======================================================
     LOADING
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [typesLoading, setTypesLoading] =
    useState(false);

  const [factorLoading, setFactorLoading] =
    useState(false);


  /* =======================================================
     LOAD ERRORS
  ======================================================= */

  const [categoryLoadError, setCategoryLoadError] =
    useState('');

  const [typeLoadError, setTypeLoadError] =
    useState('');


  /* =======================================================
     EMISSION FACTOR
  ======================================================= */

  const [emissionFactor, setEmissionFactor] =
    useState(null);


  /* =======================================================
     FORM STATE
  ======================================================= */

  const [selectedCategoryId, setSelectedCategoryId] =
    useState('');

  const [selectedActivityType, setSelectedActivityType] =
    useState(null);

  const [formData, setFormData] = useState({
    categoryId: '',
    activityTypeId: '',
    quantity: '',
    activityDate: getTodayDate(),
    notes: '',
  });

  const [formErrors, setFormErrors] =
    useState({});

  const [submitting, setSubmitting] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [editingLog, setEditingLog] =
    useState(null);


  /* =======================================================
     DELETE
  ======================================================= */

  const [deletingLog, setDeletingLog] =
    useState(null);


  /* =======================================================
     HISTORY FILTERS
  ======================================================= */

  const [searchQuery, setSearchQuery] =
    useState('');

  /*
   * Only ONE date filter.
   */
  const [dateFilter, setDateFilter] =
    useState('');

  const [categoryFilter, setCategoryFilter] =
    useState('ALL');

  const [activityFilter, setActivityFilter] =
    useState('ALL');


  /* =======================================================
     FETCH DATA
  ======================================================= */

  const fetchData = async () => {
    setLoading(true);

    try {
      const [
        categoryResponse,
        activityTypeResponse,
        pageResponse,
        allLogResponse,
      ] = await Promise.all([
        api.get(
          '/user/data/categories'
        ),

        api.get(
          '/user/data/activity-types'
        ),

        api.get(
          `/user/activities/page?page=${page - 1}&size=${pageSize}`
        ),

        api.get(
          '/user/activities'
        ),
      ]);


      setCategories(
        Array.isArray(
          categoryResponse?.data
        )
          ? categoryResponse.data
          : []
      );


      setAllActivityTypes(
        Array.isArray(
          activityTypeResponse?.data
        )
          ? activityTypeResponse.data
          : []
      );


      setActivityLogs(
        Array.isArray(
          pageResponse?.data?.content
        )
          ? pageResponse.data.content
          : []
      );


      setAllActivityLogs(
        Array.isArray(
          allLogResponse?.data
        )
          ? allLogResponse.data
          : []
      );


      setTotalRecords(
        Number(
          pageResponse?.data?.totalElements ||
          0
        )
      );


      setCategoryLoadError('');

    } catch (error) {

      console.error(
        'Activity data loading failed:',
        error?.response?.data || error
      );


      setCategoryLoadError(
        'Unable to load activity data. Please refresh and try again.'
      );


      setCategories([]);
      setAllActivityTypes([]);
      setActivityLogs([]);
      setAllActivityLogs([]);
      setTotalRecords(0);


      showToast(
        getErrorMessage(error),
        'error'
      );

    } finally {
      setLoading(false);
    }
  };


  /* =======================================================
     LOAD DATA ON PAGE/PAGE SIZE CHANGE
  ======================================================= */

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);


  /* =======================================================
     LOAD ACTIVITY TYPES WHEN CATEGORY CHANGES
  ======================================================= */

  useEffect(() => {

    if (!selectedCategoryId) {
      setActivityTypes([]);
      setTypeLoadError('');
      return;
    }


    let cancelled = false;


    const loadTypes = async () => {
      setTypesLoading(true);
      setTypeLoadError('');
      setActivityTypes([]);


      try {
        const response =
          await api.get(
            `/user/data/activity-types/category/${selectedCategoryId}`
          );


        if (!cancelled) {
          setActivityTypes(
            Array.isArray(
              response?.data
            )
              ? response.data
              : []
          );
        }

      } catch (error) {

        console.error(
          'Activity type loading failed:',
          error?.response?.data || error
        );


        if (!cancelled) {
          setTypeLoadError(
            'Unable to load activity types. Please select the category again or refresh.'
          );
        }

      } finally {

        if (!cancelled) {
          setTypesLoading(false);
        }
      }
    };


    loadTypes();


    return () => {
      cancelled = true;
    };

  }, [selectedCategoryId]);


  /* =======================================================
     LOAD EMISSION FACTOR
  ======================================================= */

  useEffect(() => {

    if (
      !selectedActivityType?.activityTypeId
    ) {
      setEmissionFactor(null);
      setFactorLoading(false);
      return;
    }


    let cancelled = false;


    const loadFactor = async () => {

      setFactorLoading(true);
      setEmissionFactor(null);


      try {

        const response =
          await api.get(
            `/user/data/emission-factor/${selectedActivityType.activityTypeId}`,
            {
              params: {
                activityDate:
                  formData.activityDate,
              },
            }
          );


        if (!cancelled) {

          const factor =
            response?.data ??
            null;


          setEmissionFactor(
            factor
          );


          if (factor) {

            setFormErrors(
              (previous) => {

                if (
                  String(
                    previous.activityTypeId ||
                      ''
                  )
                    .toLowerCase()
                    .includes(
                      'emission factor'
                    )
                ) {
                  return {
                    ...previous,
                    activityTypeId:
                      undefined,
                  };
                }

                return previous;
              }
            );
          }
        }

      } catch (error) {

        console.error(
          'Emission factor loading failed:',
          error?.response?.data || error
        );


        if (!cancelled) {
          setEmissionFactor(null);
        }

      } finally {

        if (!cancelled) {
          setFactorLoading(false);
        }
      }
    };


    loadFactor();


    return () => {
      cancelled = true;
    };

  }, [
    selectedActivityType?.activityTypeId,
    formData.activityDate,
  ]);


  /* =======================================================
     ACTIVITY TYPE CHANGE
  ======================================================= */

  const handleActivityTypeChange = (activity) => {

    if (!activity) {
      return;
    }


    setSelectedActivityType(
      activity
    );


    setFormData(
      (previous) => ({
        ...previous,

        activityTypeId:
          activity.activityTypeId,

        quantity:
          previous.quantity ||
          (
            activity.defaultQuantity ??
            ''
          ),
      })
    );


    setFormErrors(
      (previous) => ({
        ...previous,
        activityTypeId:
          undefined,
      })
    );
  };


  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {

    setEditingLog(null);

    setSelectedCategoryId('');
    setSelectedActivityType(null);

    setActivityTypes([]);

    setEmissionFactor(null);

    setFormData({
      categoryId: '',
      activityTypeId: '',
      quantity: '',
      activityDate: getTodayDate(),
      notes: '',
    });

    setFormErrors({});
    setResult(null);
  };


  /* =======================================================
     CANCEL EDIT
  ======================================================= */

  const handleCancelEdit = () => {
    resetForm();
  };


  /* =======================================================
     VALIDATE FORM
  ======================================================= */

  const validateForm = () => {

    const errors = {};


    if (!formData.categoryId) {
      errors.categoryId =
        'Please select a category.';
    }


    if (!formData.activityTypeId) {
      errors.activityTypeId =
        'Please select an activity type.';
    }


    const quantity =
      Number(
        formData.quantity
      );


    if (
      formData.quantity === '' ||
      !Number.isFinite(quantity)
    ) {

      errors.quantity =
        'Quantity is required.';

    } else if (
      quantity <= 0
    ) {

      errors.quantity =
        'Quantity must be greater than 0.';

    } else if (
      selectedActivityType?.minQuantity !=
        null &&
      quantity <
        Number(
          selectedActivityType.minQuantity
        )
    ) {

      errors.quantity =
        `Quantity must be at least ${selectedActivityType.minQuantity} ${selectedActivityType.unit}.`;

    } else if (
      selectedActivityType?.maxQuantity !=
        null &&
      quantity >
        Number(
          selectedActivityType.maxQuantity
        )
    ) {

      errors.quantity =
        `Quantity cannot exceed ${selectedActivityType.maxQuantity} ${selectedActivityType.unit}.`;
    }


    if (
      selectedActivityType &&
      !factorLoading &&
      !emissionFactor
    ) {

      errors.activityTypeId =
        'No active emission factor is configured for this activity. Please contact the administrator.';
    }


    if (!formData.activityDate) {

      errors.activityDate =
        'Activity date is required.';
    }


    setFormErrors(errors);


    return (
      Object.keys(errors).length === 0
    );
  };


  /* =======================================================
     SUBMIT ADD / UPDATE
  ======================================================= */

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    if (!validateForm()) {
      return;
    }


    if (
      editingLog &&
      !window.confirm(
        'Save the changes to this activity log?'
      )
    ) {
      return;
    }


    setSubmitting(true);
    setResult(null);
    setFormErrors({});


    try {

      const payload = {
        categoryId:
          Number(
            formData.categoryId
          ),

        activityTypeId:
          Number(
            formData.activityTypeId
          ),

        quantity:
          Number(
            formData.quantity
          ),

        activityDate:
          formData.activityDate,

        notes:
          formData.notes?.trim() ||
          '',
      };


      let response;


      if (editingLog) {

        response =
          await api.put(
            `/user/activities/${editingLog.activityLogId}`,
            payload
          );


        showToast(
          response?.message ||
            'Activity updated successfully!',
          'success'
        );

      } else {

        response =
          await api.post(
            '/user/activities',
            payload
          );


        showToast(
          response?.message ||
            'Activity logged successfully!',
          'success'
        );
      }


      setResult(
        response?.data
      );


      /*
       * Leave the history page usable after update.
       */
      resetForm();


      await fetchData();

    } catch (error) {

      console.error(
        'Activity save failed:',
        error?.response?.data || error
      );


      /*
       * Handle validation response returned from backend.
       */
      const serverData =
        error?.response?.data ||
        error?.data;


      if (
        serverData &&
        typeof serverData === 'object' &&
        !Array.isArray(
          serverData
        )
      ) {

        const fieldErrors = {};

        Object.entries(
          serverData
        ).forEach(
          ([key, value]) => {

            if (
              typeof value === 'string'
            ) {
              fieldErrors[key] =
                value;
            }

          }
        );


        if (
          Object.keys(
            fieldErrors
          ).length > 0
        ) {
          setFormErrors(
            fieldErrors
          );
        } else {
          showToast(
            getErrorMessage(
              error
            ),
            'error'
          );
        }

      } else {

        const message =
          getErrorMessage(
            error
          );

        const lower =
          message.toLowerCase();


        if (
          lower.includes(
            'factor'
          )
        ) {

          setFormErrors(
            (previous) => ({
              ...previous,
              activityTypeId:
                'No active emission factor is configured for this activity. Please contact the administrator.',
            })
          );

        } else if (
          lower.includes(
            'quantity'
          )
        ) {

          setFormErrors(
            (previous) => ({
              ...previous,
              quantity:
                message,
            })
          );

        } else if (
          lower.includes(
            'activity'
          )
        ) {

          setFormErrors(
            (previous) => ({
              ...previous,
              activityTypeId:
                message,
            })
          );

        } else if (
          lower.includes(
            'category'
          )
        ) {

          setFormErrors(
            (previous) => ({
              ...previous,
              categoryId:
                message,
            })
          );

        } else {

          showToast(
            message,
            'error'
          );
        }
      }

    } finally {
      setSubmitting(false);
    }
  };


  /* =======================================================
     EDIT LOG
  ======================================================= */

  const handleEdit = (
    log
  ) => {

    if (!log) {
      return;
    }


    /*
     * Make the edit form visible on the History page.
     */
    setEditingLog(
      log
    );


    setFormErrors({});
    setResult(null);


    const categoryId =
      log.categoryId;


    const activityId =
      log.activityTypeId;


    setSelectedCategoryId(
      categoryId
    );


    /*
     * First use all activity types already loaded,
     * because those contain min/max/unit data.
     */
    const fullActivity =
      allActivityTypes.find(
        (activity) =>
          String(
            activity.activityTypeId
          ) ===
          String(
            activityId
          )
      );


    const fallbackActivity =
      fullActivity ||
      {
        activityTypeId:
          activityId,

        activityName:
          log.activityTypeName,

        unit:
          log.unit || '',

        minQuantity:
          null,

        maxQuantity:
          null,
      };


    setSelectedActivityType(
      fallbackActivity
    );


    setFormData({
      categoryId:
        categoryId,

      activityTypeId:
        activityId,

      quantity:
        log.quantity ??
        '',

      activityDate:
        log.activityDate ||
        getTodayDate(),

      notes:
        log.notes ||
        '',
    });


    /*
     * Load the activity list for the selected category.
     */
    setTypesLoading(true);
    setTypeLoadError('');


    api.get(
      `/user/data/activity-types/category/${categoryId}`
    )
      .then(
        (response) => {

          const types =
            Array.isArray(
              response?.data
            )
              ? response.data
              : [];


          setActivityTypes(
            types
          );


          /*
           * Replace the fallback with the actual
           * category activity object if available.
           */
          const matched =
            types.find(
              (activity) =>
                String(
                  activity.activityTypeId
                ) ===
                String(
                  activityId
                )
            );


          if (matched) {
            setSelectedActivityType(
              matched
            );
          }

        }
      )
      .catch(
        (error) => {

          console.error(
            'Failed to load edit activity types:',
            error?.response?.data ||
              error
          );


          setTypeLoadError(
            'Unable to load activity types for this record.'
          );

        }
      )
      .finally(
        () => {
          setTypesLoading(false);
        }
      );


    /*
     * Make the edit form easy to find.
     */
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };


  /* =======================================================
     DELETE LOG
  ======================================================= */

  const handleDelete = async () => {

    if (!deletingLog) {
      return;
    }


    try {

      const response =
        await api.delete(
          `/user/activities/${deletingLog.activityLogId}`
        );


      showToast(
        response?.message ||
          'Activity deleted successfully!',
        'info'
      );


      setDeletingLog(
        null
      );


      /*
       * If the last record on a page was deleted,
       * move one page back when necessary.
       */
      if (
        activityLogs.length === 1 &&
        page > 1
      ) {
        setPage(
          page - 1
        );
      } else {
        await fetchData();
      }

    } catch (error) {

      console.error(
        'Activity deletion failed:',
        error?.response?.data || error
      );


      showToast(
        `Deletion failed: ${getErrorMessage(
          error
        )}`,
        'error'
      );
    }
  };


  /* =======================================================
     CATEGORY FILTER OPTIONS
  ======================================================= */

  const filteredActivityOptions =
    useMemo(() => {

      if (
        categoryFilter ===
        'ALL'
      ) {
        return allActivityTypes;
      }


      return allActivityTypes.filter(
        (activity) =>
          String(
            activity.categoryId
          ) ===
          String(
            categoryFilter
          )
      );

    }, [
      allActivityTypes,
      categoryFilter,
    ]);


  /* =======================================================
     HISTORY FILTERING
  ======================================================= */

  const filteredLogs =
    useMemo(() => {

      const query =
        searchQuery
          .trim()
          .toLowerCase();


      return activityLogs.filter(
        (log) => {

          const searchableText = [
            log.activityTypeName,
            log.categoryName,
            log.notes,
            log.quantity,
            log.unit,
          ]
            .filter(
              (value) =>
                value !==
                  null &&
                value !==
                  undefined
            )
            .join(' ')
            .toLowerCase();


          const matchesSearch =
            !query ||
            searchableText.includes(
              query
            );


          /*
           * Single exact activity-date filter.
           */
          const matchesDate =
            !dateFilter ||
            String(
              log.activityDate
            ).slice(0, 10) ===
              dateFilter;


          const matchesCategory =
            categoryFilter ===
              'ALL' ||
            String(
              log.categoryId
            ) ===
              String(
                categoryFilter
              );


          const matchesActivity =
            activityFilter ===
              'ALL' ||
            String(
              log.activityTypeId
            ) ===
              String(
                activityFilter
              );


          return (
            matchesSearch &&
            matchesDate &&
            matchesCategory &&
            matchesActivity
          );
        }
      );

    }, [
      activityLogs,
      searchQuery,
      dateFilter,
      categoryFilter,
      activityFilter,
    ]);


  /* =======================================================
     SAFE PAGE
  ======================================================= */

  const safePage =
    Math.max(
      1,
      page
    );


  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalEmission =
    activityLogs.reduce(
      (
        sum,
        log
      ) =>
        sum +
        Number(
          log.totalEmission ||
            0
        ),
      0
    );


  const categoryCount =
    new Set(
      activityLogs
        .map(
          (log) =>
            log.categoryId
        )
        .filter(
          (value) =>
            value !==
              null &&
            value !==
              undefined
        )
    ).size;


  /* =======================================================
     CATEGORY CHART DATA
  ======================================================= */

  const categoryChartData =
    useMemo(() => {

      const grouped =
        allActivityLogs.reduce(
          (
            map,
            log
          ) => {

            const category =
              log.categoryName ||
              'Other';


            map[category] =
              (
                map[category] ||
                0
              ) +
              Number(
                log.totalEmission ||
                  0
              );


            return map;

          },
          {}
        );


      return Object.entries(
        grouped
      ).map(
        (
          [
            name,
            emission,
          ],
          index
        ) => ({
          name,

          emission:
            Number(
              Number(
                emission
              ).toFixed(
                2
              )
            ),

          fill:
            CATEGORY_CHART_COLORS[
              index %
                CATEGORY_CHART_COLORS.length
            ],
        })
      );

    }, [
      allActivityLogs,
    ]);


  /* =======================================================
     TREND DATA
  ======================================================= */

  const trendChartData =
    useMemo(() => {

      const grouped =
        allActivityLogs.reduce(
          (
            map,
            log
          ) => {

            const date =
              log.activityDate ||
              'Unknown';


            map[date] =
              (
                map[date] ||
                0
              ) +
              Number(
                log.totalEmission ||
                  0
              );


            return map;

          },
          {}
        );


      return Object.entries(
        grouped
      )
        .sort(
          (
            [
              dateA,
            ],
            [
              dateB,
            ]
          ) =>
            String(
              dateA
            ).localeCompare(
              String(
                dateB
              )
            )
        )
        .map(
          (
            [
              date,
              emission,
            ]
          ) => ({
            date,

            emission:
              Number(
                Number(
                  emission
                ).toFixed(
                  2
                )
              ),
          })
        );

    }, [
      allActivityLogs,
    ]);


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="
      min-h-screen
      bg-slate-900
      text-slate-100
      flex
      flex-col
    ">

      <main className="
        flex-1
        w-full
        max-w-7xl
        mx-auto
        px-5
        py-8
        space-y-8
        lg:px-8
      ">


        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="
          flex
          flex-col
          gap-4
          border-b
          border-slate-800
          pb-6
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">

          <div>

            <h1 className="
              flex
              items-center
              gap-3
              text-2xl
              font-extrabold
              text-white
              sm:text-3xl
            ">

              <Activity className="
                h-7
                w-7
                text-emerald-400
              " />

              {isHistory
                ? 'Activity History & Analytics'
                : editingLog
                  ? 'Edit Activity'
                  : 'Log Daily Activity'}

            </h1>


            <p className="
              mt-1
              text-xs
              text-slate-400
              sm:text-sm
            ">

              {isHistory
                ? 'Review, filter, update, or remove your saved activity records.'
                : editingLog
                  ? 'Update the selected activity record and recalculate its carbon emission.'
                  : 'Choose an activity, enter its quantity, and record its carbon footprint.'}

            </p>

          </div>


          <button
            type="button"
            onClick={
              fetchData
            }
            disabled={
              loading
            }
            className="
              flex
              w-fit
              items-center
              gap-2
              rounded-xl
              border
              border-slate-700
              bg-slate-800
              px-3.5
              py-2.5
              text-sm
              font-semibold
              text-slate-300
              transition
              hover:bg-slate-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            <RefreshCw className={`
              h-4
              w-4
              ${
                loading
                  ? 'animate-spin'
                  : ''
              }
            `} />

            Refresh

          </button>

        </div>


        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-3
        ">

          <div className="
            rounded-2xl
            border
            border-slate-700/60
            bg-slate-800/60
            p-5
          ">

            <p className="
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-slate-400
            ">
              Total Activities
            </p>

            <p className="
              mt-1
              text-3xl
              font-black
              text-white
            ">
              {
                activityLogs.length
              }
            </p>

          </div>


          <div className="
            rounded-2xl
            border
            border-emerald-500/20
            bg-slate-800/60
            p-5
          ">

            <p className="
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-emerald-400
            ">
              Total Emission
            </p>

            <p className="
              mt-1
              text-3xl
              font-black
              text-emerald-400
            ">

              {
                totalEmission.toFixed(
                  2
                )
              }

              <span className="
                ml-1
                text-sm
                font-normal
              ">
                kg CO₂e
              </span>

            </p>

          </div>


          <div className="
            rounded-2xl
            border
            border-teal-500/20
            bg-slate-800/60
            p-5
          ">

            <p className="
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-teal-400
            ">
              Categories
            </p>

            <p className="
              mt-1
              text-3xl
              font-black
              text-teal-400
            ">
              {categoryCount}
            </p>

          </div>

        </div>


        {/* =================================================
            CHARTS
        ================================================= */}

        {isHistory &&
          allActivityLogs.length >
            0 && (

          <section className="
            grid
            gap-5
            xl:grid-cols-2
          ">

            {/* CATEGORY */}

            <div className="
              rounded-2xl
              border
              border-slate-700/80
              bg-slate-800/50
              p-5
              shadow-xl
            ">

              <div className="
                mb-4
                flex
                items-center
                gap-2
              ">

                <Layers className="
                  h-5
                  w-5
                  text-emerald-400
                " />

                <h2 className="
                  font-bold
                  text-white
                ">
                  Emissions by Category
                </h2>

              </div>


              <div className="
                h-64
                w-full
              ">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={
                      categoryChartData
                    }
                    margin={{
                      top: 10,
                      right: 15,
                      left: 0,
                      bottom: 55,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#64748b"
                      strokeOpacity={0.18}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fill: '#cbd5e1',
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                      interval={0}
                      angle={-18}
                      textAnchor="end"
                      height={70}
                    />

                    <YAxis
                      tick={{
                        fill: '#cbd5e1',
                        fontSize: 10,
                      }}
                    />

                    <Tooltip
                      cursor={{
                        fill: '#94a3b8',
                        opacity: 0.08,
                      }}
                      contentStyle={{
                        backgroundColor:
                          '#0f172a',
                        border:
                          '1px solid #334155',
                        borderRadius:
                          '10px',
                        color:
                          '#f8fafc',
                      }}
                      labelStyle={{
                        color:
                          '#f8fafc',
                        fontWeight:
                          700,
                      }}
                      formatter={(
                        value
                      ) => [
                        `${value} kg CO₂e`,
                        'Emission',
                      ]}
                    />


                    <Bar
                      dataKey="emission"
                      name="Emission"
                      radius={[
                        7,
                        7,
                        0,
                        0,
                      ]}
                    >

                      {categoryChartData.map(
                        (
                          entry,
                          index
                        ) => (

                          <Cell
                            key={
                              `category-cell-${index}`
                            }
                            fill={
                              entry.fill
                            }
                          />

                        )
                      )}

                    </Bar>

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>


            {/* TREND */}

            <div className="
              rounded-2xl
              border
              border-slate-700/80
              bg-slate-800/50
              p-5
              shadow-xl
            ">

              <div className="
                mb-4
                flex
                items-center
                gap-2
              ">

                <TrendingUp className="
                  h-5
                  w-5
                  text-teal-400
                " />

                <h2 className="
                  font-bold
                  text-white
                ">
                  Emission Trend by Activity Date
                </h2>

              </div>


              <div className="
                h-64
                w-full
              ">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={
                      trendChartData
                    }
                    margin={{
                      top: 15,
                      right: 15,
                      left: 0,
                      bottom: 20,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#64748b"
                      strokeOpacity={0.18}
                    />

                    <XAxis
                      dataKey="date"
                      tick={{
                        fill: '#cbd5e1',
                        fontSize: 10,
                      }}
                    />

                    <YAxis
                      tick={{
                        fill: '#cbd5e1',
                        fontSize: 10,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          '#0f172a',
                        border:
                          '1px solid #334155',
                        borderRadius:
                          '10px',
                        color:
                          '#f8fafc',
                      }}
                      formatter={(
                        value
                      ) => [
                        `${value} kg CO₂e`,
                        'Emission',
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="emission"
                      stroke="#22d3ee"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: '#22d3ee',
                        stroke: '#082f49',
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 6,
                        fill: '#67e8f9',
                      }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            </div>

          </section>
        )}


        {/* =================================================
            MAIN AREA
        ================================================= */}

        <div className="
          grid
          grid-cols-1
          gap-8
        ">


          {/* =================================================
              FORM
          ================================================= */}

          <div
            className={
              isHistory &&
              !editingLog
                ? 'hidden'
                : ''
            }
          >

            <div className="
              rounded-2xl
              border
              border-slate-700/80
              bg-slate-800/50
              p-6
              shadow-xl
            ">

              <div className="
                mb-6
                flex
                items-center
                justify-between
                gap-3
              ">

                <h2 className="
                  flex
                  items-center
                  gap-2
                  text-lg
                  font-bold
                  text-white
                ">

                  <Plus className="
                    h-5
                    w-5
                    text-emerald-400
                  " />

                  {
                    editingLog
                      ? 'Edit Activity'
                      : 'Log New Activity'
                  }

                </h2>


                {editingLog && (

                  <button
                    type="button"
                    onClick={
                      handleCancelEdit
                    }
                    className="
                      flex
                      items-center
                      gap-1.5
                      rounded-lg
                      border
                      border-slate-700
                      bg-slate-900
                      px-3
                      py-1.5
                      text-xs
                      font-semibold
                      text-slate-400
                      transition
                      hover:bg-slate-800
                      hover:text-white
                    "
                  >

                    <X className="
                      h-3.5
                      w-3.5
                    " />

                    Cancel Edit

                  </button>

                )}

              </div>


              <form
                onSubmit={
                  handleSubmit
                }
                className="
                  space-y-5
                "
              >


                {/* STEP 1 */}

                <div>

                  <div className="
                    mb-3
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-emerald-400
                  ">

                    <span className="
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-emerald-500
                      text-[10px]
                      text-slate-950
                    ">
                      1
                    </span>

                    Choose Category

                  </div>


                  {loading ? (

                    <p className="
                      text-xs
                      text-slate-400
                    ">
                      Loading categories...
                    </p>

                  ) : categories.length === 0 ? (

                    <p className="
                      text-xs
                      text-rose-400
                    ">
                      {
                        categoryLoadError ||
                        'No active categories available.'
                      }
                    </p>

                  ) : (

                    <div className="
                      grid
                      grid-cols-2
                      gap-2.5
                      sm:grid-cols-4
                    ">

                      {categories.map(
                        (category) => {

                          const Icon =
                            ICON_MAP[
                              category.icon
                            ] ||
                            Layers;


                          const isSelected =
                            String(
                              formData.categoryId
                            ) ===
                            String(
                              category.categoryId
                            );


                          return (
                            <button
                              type="button"
                              key={
                                category.categoryId
                              }
                              onClick={() => {

                                setSelectedCategoryId(
                                  category.categoryId
                                );

                                setActivityTypes(
                                  []
                                );

                                setSelectedActivityType(
                                  null
                                );

                                setEmissionFactor(
                                  null
                                );

                                setFormData(
                                  (
                                    previous
                                  ) => ({
                                    ...previous,

                                    categoryId:
                                      category.categoryId,

                                    activityTypeId:
                                      '',

                                    quantity:
                                      '',
                                  })
                                );

                                setFormErrors(
                                  (
                                    previous
                                  ) => ({
                                    ...previous,

                                    categoryId:
                                      undefined,

                                    activityTypeId:
                                      undefined,

                                    quantity:
                                      undefined,
                                  })
                                );

                              }}
                              className={`
                                relative
                                flex
                                flex-col
                                items-center
                                gap-2
                                rounded-xl
                                border
                                p-3.5
                                text-center
                                transition-all
                                ${
                                  isSelected
                                    ? 'border-emerald-500/70 bg-emerald-950/60 shadow-lg shadow-emerald-950/30'
                                    : 'border-slate-700 bg-slate-900 hover:border-slate-500 hover:bg-slate-800'
                                }
                              `}
                            >

                              <div className={`
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-xl
                                ${
                                  isSelected
                                    ? 'bg-emerald-500/20'
                                    : 'bg-slate-800'
                                }
                              `}>

                                <Icon
                                  className={`
                                    h-5
                                    w-5
                                    ${
                                      isSelected
                                        ? 'text-emerald-400'
                                        : 'text-slate-400'
                                    }
                                  `}
                                />

                              </div>


                              <span className={`
                                text-xs
                                font-semibold
                                ${
                                  isSelected
                                    ? 'text-emerald-300'
                                    : 'text-slate-300'
                                }
                              `}>
                                {
                                  category.categoryName
                                }
                              </span>


                              {isSelected && (

                                <CheckCircle2 className="
                                  absolute
                                  right-2
                                  top-2
                                  h-3.5
                                  w-3.5
                                  text-emerald-400
                                " />

                              )}

                            </button>
                          );
                        }
                      )}

                    </div>
                  )}


                  {formErrors.categoryId && (

                    <p className="
                      mt-1.5
                      flex
                      items-center
                      gap-1
                      text-xs
                      text-rose-400
                    ">

                      <AlertCircle className="
                        h-3.5
                        w-3.5
                      " />

                      {
                        formErrors.categoryId
                      }

                    </p>

                  )}

                </div>


                {/* STEP 2 */}

                {selectedCategoryId && (

                  <div>

                    <div className="
                      mb-3
                      flex
                      items-center
                      gap-2
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-emerald-400
                    ">

                      <span className="
                        flex
                        h-5
                        w-5
                        items-center
                        justify-center
                        rounded-full
                        bg-emerald-500
                        text-[10px]
                        text-slate-950
                      ">
                        2
                      </span>

                      Choose Activity

                    </div>


                    {typesLoading ? (

                      <p className="
                        text-xs
                        text-slate-400
                      ">
                        Loading activity types...
                      </p>

                    ) : activityTypes.length === 0 ? (

                      <p className="
                        text-xs
                        text-rose-400
                      ">
                        {
                          typeLoadError ||
                          'No active activity types available for this category.'
                        }
                      </p>

                    ) : (

                      <div className="
                        grid
                        grid-cols-2
                        gap-2.5
                        sm:grid-cols-3
                      ">

                        {activityTypes.map(
                          (activity) => {

                            const Icon =
                              ICON_MAP[
                                activity.icon
                              ] ||
                              Activity;


                            const isSelected =
                              String(
                                formData.activityTypeId
                              ) ===
                              String(
                                activity.activityTypeId
                              );


                            return (
                              <button
                                key={
                                  activity.activityTypeId
                                }
                                type="button"
                                onClick={() =>
                                  handleActivityTypeChange(
                                    activity
                                  )
                                }
                                className={`
                                  relative
                                  flex
                                  flex-col
                                  items-center
                                  gap-1.5
                                  rounded-xl
                                  border
                                  p-3
                                  text-center
                                  transition-all
                                  ${
                                    isSelected
                                      ? 'border-emerald-500/70 bg-emerald-950/60 shadow-lg shadow-emerald-950/30'
                                      : 'border-slate-700 bg-slate-900 hover:border-slate-500 hover:bg-slate-800'
                                  }
                                `}
                              >

                                <Icon
                                  className={`
                                    h-4
                                    w-4
                                    ${
                                      isSelected
                                        ? 'text-emerald-400'
                                        : 'text-slate-400'
                                    }
                                  `}
                                />


                                <span className={`
                                  text-xs
                                  font-semibold
                                  ${
                                    isSelected
                                      ? 'text-emerald-300'
                                      : 'text-slate-300'
                                  }
                                `}>
                                  {
                                    activity.activityName
                                  }
                                </span>


                                {isSelected && (

                                  <CheckCircle2 className="
                                    absolute
                                    right-2
                                    top-2
                                    h-3.5
                                    w-3.5
                                    text-emerald-400
                                  " />

                                )}

                              </button>
                            );
                          }
                        )}

                      </div>

                    )}


                    {formErrors.activityTypeId && (

                      <p className="
                        mt-1.5
                        flex
                        items-center
                        gap-1
                        text-xs
                        text-rose-400
                      ">

                        <AlertCircle className="
                          h-3.5
                          w-3.5
                        " />

                        {
                          formErrors.activityTypeId
                        }

                      </p>

                    )}

                  </div>
                )}


                {/* STEP 3 */}

                {selectedActivityType && (

                  <div>

                    <div className="
                      mb-3
                      flex
                      items-center
                      gap-2
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-emerald-400
                    ">

                      <span className="
                        flex
                        h-5
                        w-5
                        items-center
                        justify-center
                        rounded-full
                        bg-emerald-500
                        text-[10px]
                        text-slate-950
                      ">
                        3
                      </span>

                      Activity Details

                    </div>


                    <div className="
                      mb-4
                      rounded-xl
                      border
                      border-emerald-900/50
                      bg-emerald-950/30
                      p-3
                    ">

                      <div className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                        text-xs
                        text-emerald-400
                      ">

                        <Leaf className="
                          h-3.5
                          w-3.5
                        " />

                        <span className="
                          font-semibold
                        ">
                          Unit:
                          {' '}
                          {
                            selectedActivityType.unit ||
                            'unit'
                          }
                        </span>


                        {selectedActivityType.minQuantity !=
                          null && (

                          <span className="
                            text-slate-400
                          ">
                            Min:
                            {' '}
                            {
                              selectedActivityType.minQuantity
                            }
                          </span>

                        )}


                        {selectedActivityType.maxQuantity !=
                          null && (

                          <span className="
                            text-slate-400
                          ">
                            Max:
                            {' '}
                            {
                              selectedActivityType.maxQuantity
                            }
                          </span>

                        )}

                      </div>

                    </div>


                    <div className="
                      space-y-4
                    ">


                      {/* QUANTITY */}

                      <div>

                        <label className="
                          mb-1.5
                          block
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          text-slate-300
                        ">

                          Quantity

                          {' '}

                          <span className="
                            text-rose-400
                          ">
                            *
                          </span>

                        </label>


                        <input
                          type="number"
                          step="0.01"
                          min={
                            selectedActivityType?.minQuantity ??
                            undefined
                          }
                          max={
                            selectedActivityType?.maxQuantity ??
                            undefined
                          }
                          value={
                            formData.quantity
                          }
                          onChange={(event) =>
                            setFormData(
                              (
                                previous
                              ) => ({
                                ...previous,
                                quantity:
                                  event.target.value,
                              })
                            )
                          }
                          placeholder={`Enter quantity in ${
                            selectedActivityType?.unit ||
                            'unit'
                          }`}
                          className={`
                            w-full
                            rounded-xl
                            border
                            bg-slate-900
                            px-3.5
                            py-2.5
                            text-sm
                            text-white
                            outline-none
                            ${
                              formErrors.quantity
                                ? 'border-rose-500'
                                : 'border-slate-700 focus:border-emerald-500'
                            }
                          `}
                        />


                        {formErrors.quantity && (

                          <p className="
                            mt-1
                            flex
                            items-center
                            gap-1
                            text-xs
                            text-rose-400
                          ">

                            <AlertCircle className="
                              h-3.5
                              w-3.5
                            " />

                            {
                              formErrors.quantity
                            }

                          </p>

                        )}

                      </div>


                      {/* FACTOR */}

                      <div className="
                        rounded-xl
                        border
                        border-emerald-900/50
                        bg-emerald-950/30
                        p-3
                        text-xs
                      ">

                        {factorLoading ? (

                          <div className="
                            flex
                            items-center
                            gap-2
                            text-slate-400
                          ">

                            <RefreshCw className="
                              h-3.5
                              w-3.5
                              animate-spin
                            " />

                            Loading emission factor...

                          </div>

                        ) : emissionFactor ? (

                          <>

                            <p className="
                              font-semibold
                              text-emerald-400
                            ">

                              Emission factor:
                              {' '}
                              {
                                emissionFactor.emissionFactor
                              }
                              {' '}
                              kg CO₂e/
                              {
                                selectedActivityType.unit
                              }

                            </p>


                            {formData.quantity !==
                              '' &&
                              Number.isFinite(
                                Number(
                                  formData.quantity
                                )
                              ) && (

                                <p className="
                                  mt-1
                                  text-slate-300
                                ">

                                  Estimated emission:
                                  {' '}

                                  <span className="
                                    font-bold
                                    text-emerald-300
                                  ">

                                    {(
                                      Number(
                                        formData.quantity
                                      ) *
                                      Number(
                                        emissionFactor.emissionFactor
                                      )
                                    ).toFixed(
                                      2
                                    )}

                                    {' '}
                                    kg CO₂e

                                  </span>

                                </p>

                            )}

                          </>

                        ) : (

                          <p className="
                            text-rose-400
                          ">
                            No active emission factor is configured for this activity.
                          </p>

                        )}

                      </div>


                      {/* DATE */}

                      <div>

                        <label className="
                          mb-1.5
                          block
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          text-slate-300
                        ">

                          Activity Date

                          {' '}

                          <span className="
                            text-rose-400
                          ">
                            *
                          </span>

                        </label>


                        <div className="
                          relative
                        ">

                          <Calendar className="
                            absolute
                            left-3.5
                            top-3
                            h-4
                            w-4
                            text-slate-500
                          " />


                          <input
                            type="date"
                            value={
                              formData.activityDate
                            }
                            onChange={(
                              event
                            ) =>
                              setFormData(
                                (
                                  previous
                                ) => ({
                                  ...previous,
                                  activityDate:
                                    event.target.value,
                                })
                              )
                            }
                            className={`
                              w-full
                              rounded-xl
                              border
                              bg-slate-900
                              py-2.5
                              pl-10
                              pr-3.5
                              text-sm
                              text-white
                              outline-none
                              ${
                                formErrors.activityDate
                                  ? 'border-rose-500'
                                  : 'border-slate-700 focus:border-emerald-500'
                              }
                            `}
                          />

                        </div>


                        {formErrors.activityDate && (

                          <p className="
                            mt-1
                            flex
                            items-center
                            gap-1
                            text-xs
                            text-rose-400
                          ">

                            <AlertCircle className="
                              h-3.5
                              w-3.5
                            " />

                            {
                              formErrors.activityDate
                            }

                          </p>

                        )}

                      </div>


                      {/* NOTES */}

                      <div>

                        <label className="
                          mb-1.5
                          block
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          text-slate-300
                        ">
                          Notes
                        </label>


                        <textarea
                          rows="3"
                          value={
                            formData.notes
                          }
                          onChange={(event) =>
                            setFormData(
                              (
                                previous
                              ) => ({
                                ...previous,
                                notes:
                                  event.target.value,
                              })
                            )
                          }
                          placeholder="Add any additional details..."
                          className="
                            w-full
                            resize-y
                            rounded-xl
                            border
                            border-slate-700
                            bg-slate-900
                            px-3.5
                            py-2.5
                            text-sm
                            text-white
                            outline-none
                            placeholder:text-slate-600
                            focus:border-emerald-500
                          "
                        />

                      </div>

                    </div>

                  </div>
                )}


                {/* SUBMIT BUTTON */}

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    factorLoading ||
                    (
                      !!selectedActivityType &&
                      !emissionFactor
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-emerald-600
                    py-3
                    text-sm
                    font-bold
                    text-slate-950
                    shadow-lg
                    shadow-emerald-900/30
                    transition
                    hover:bg-emerald-500
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {submitting && (

                    <RefreshCw className="
                      h-4
                      w-4
                      animate-spin
                    " />

                  )}


                  {
                    submitting
                      ? 'Saving...'
                      : editingLog
                        ? 'Update Activity'
                        : 'Log Activity'
                  }

                </button>

              </form>


              {/* RESULT */}

              {result && (

                <div className="
                  mt-6
                  rounded-xl
                  border
                  border-emerald-800/50
                  bg-emerald-950/40
                  p-4
                ">

                  <div className="
                    mb-2
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-emerald-400
                  ">
                    Carbon Emission Calculation
                  </div>


                  <div className="
                    flex
                    items-baseline
                    gap-2
                  ">

                    <span className="
                      text-3xl
                      font-black
                      text-white
                    ">
                      {
                        Number(
                          result.totalEmission ||
                            0
                        ).toFixed(
                          2
                        )
                      }
                    </span>

                    <span className="
                      text-sm
                      text-emerald-400
                    ">
                      kg CO₂e
                    </span>

                  </div>

                </div>

              )}

            </div>

          </div>


          {/* =================================================
              HISTORY TABLE
          ================================================= */}

          <div>

            <div className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-700/80
              bg-slate-800/50
              shadow-xl
            ">


              {/* FILTER HEADER */}

              <div className="
                border-b
                border-slate-700
                p-4
              ">

                <div className="
                  flex
                  flex-col
                  gap-4
                  xl:flex-row
                  xl:items-center
                  xl:justify-between
                ">

                  <div>
                    <h3 className="
                      text-base
                      font-bold
                      text-white
                    ">
                      Activity History
                    </h3>

                    {editingLog && (

                      <p className="
                        mt-1
                        text-xs
                        font-semibold
                        text-emerald-400
                      ">
                        Editing:
                        {' '}
                        {
                          editingLog.activityTypeName
                        }
                      </p>

                    )}

                  </div>


                  <div className="
                    flex
                    w-full
                    flex-wrap
                    items-center
                    gap-2
                    xl:w-auto
                  ">


                    {/* SEARCH */}

                    <div className="
                      relative
                      w-full
                      sm:w-64
                    ">

                      <Search className="
                        absolute
                        left-3.5
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                        text-slate-400
                      " />


                      <input
                        type="text"
                        value={
                          searchQuery
                        }
                        onChange={(event) =>
                          setSearchQuery(
                            event.target.value
                          )
                        }
                        placeholder="Search activities..."
                        className="
                          w-full
                          rounded-lg
                          border
                          border-slate-700
                          bg-slate-900
                          py-2
                          pl-10
                          pr-3.5
                          text-sm
                          text-slate-200
                          outline-none
                          placeholder:text-slate-500
                          focus:border-emerald-500
                        "
                      />

                    </div>


                    {/* ONE DATE FILTER */}

                    <div className="
                      relative
                    ">

                      <Calendar className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        h-3.5
                        w-3.5
                        -translate-y-1/2
                        text-slate-500
                      " />


                      <input
                        aria-label="Filter by activity date"
                        type="date"
                        value={
                          dateFilter
                        }
                        onChange={(event) => {
                          setDateFilter(
                            event.target.value
                          );
                          setPage(1);
                        }}
                        className="
                          rounded-lg
                          border
                          border-slate-700
                          bg-slate-900
                          py-2
                          pl-9
                          pr-3
                          text-sm
                          text-slate-200
                          outline-none
                          focus:border-emerald-500
                        "
                      />

                    </div>


                    {/* CATEGORY */}

                    <select
                      value={
                        categoryFilter
                      }
                      onChange={(event) => {

                        setCategoryFilter(
                          event.target.value
                        );

                        setActivityFilter(
                          'ALL'
                        );

                        setPage(1);

                      }}
                      className="
                        rounded-lg
                        border
                        border-slate-700
                        bg-slate-900
                        px-2.5
                        py-2
                        text-xs
                        text-slate-200
                        outline-none
                        focus:border-emerald-500
                      "
                    >

                      <option value="ALL">
                        All categories
                      </option>

                      {categories.map(
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


                    {/* ACTIVITY */}

                    <select
                      value={
                        activityFilter
                      }
                      onChange={(event) => {

                        setActivityFilter(
                          event.target.value
                        );

                        setPage(1);

                      }}
                      className="
                        rounded-lg
                        border
                        border-slate-700
                        bg-slate-900
                        px-2.5
                        py-2
                        text-xs
                        text-slate-200
                        outline-none
                        focus:border-emerald-500
                      "
                    >

                      <option value="ALL">
                        All activities
                      </option>

                      {filteredActivityOptions.map(
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
                          </option>

                        )
                      )}

                    </select>

                  </div>

                </div>

              </div>


              {/* RESULT COUNT */}

              <div className="
                border-b
                border-slate-800
                px-4
                py-3
              ">

                <p className="
                  text-xs
                  text-slate-500
                ">
                  Showing
                  {' '}
                  {filteredLogs.length}
                  {' '}
                  record
                  {
                    filteredLogs.length === 1
                      ? ''
                      : 's'
                  }
                </p>

              </div>


              {/* TABLE */}

              {loading ? (

                <div className="
                  p-12
                  text-center
                  text-slate-400
                ">

                  <RefreshCw className="
                    mx-auto
                    mb-3
                    h-8
                    w-8
                    animate-spin
                    text-emerald-400
                  " />

                  Loading activities...

                </div>

              ) : filteredLogs.length ===
                0 ? (

                <div className="
                  p-12
                  text-center
                ">

                  <Activity className="
                    mx-auto
                    mb-3
                    h-12
                    w-12
                    text-slate-600
                  " />

                  <p className="
                    font-semibold
                    text-slate-300
                  ">
                    No activities found
                  </p>

                  <p className="
                    mt-1
                    text-xs
                    text-slate-500
                  ">
                    Try another search, date, category, or activity filter.
                  </p>

                </div>

              ) : (

                <div className="
                  overflow-x-auto
                ">

                  <table className="
                    w-full
                    min-w-[1050px]
                    text-left
                    text-sm
                    text-slate-300
                  ">

                    <thead className="
                      border-b
                      border-slate-700
                      bg-slate-900/80
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-400
                    ">

                      <tr>

                        <th className="
                          px-4
                          py-3
                        ">
                          Date
                        </th>

                        <th className="
                          px-4
                          py-3
                        ">
                          Created At
                        </th>

                        <th className="
                          px-4
                          py-3
                        ">
                          Category
                        </th>

                        <th className="
                          px-4
                          py-3
                        ">
                          Activity
                        </th>

                        <th className="
                          px-4
                          py-3
                          text-right
                        ">
                          Quantity
                        </th>

                        <th className="
                          px-4
                          py-3
                          text-right
                        ">
                          Emission
                        </th>

                        <th className="
                          px-4
                          py-3
                          text-right
                        ">
                          Actions
                        </th>

                      </tr>

                    </thead>


                    <tbody className="
                      divide-y
                      divide-slate-800
                    ">

                      {filteredLogs.map(
                        (log) => (

                          <tr
                            key={
                              log.activityLogId
                            }
                            className="
                              transition-colors
                              hover:bg-slate-800/40
                            "
                          >

                            <td className="
                              whitespace-nowrap
                              px-4
                              py-3
                              font-mono
                              text-xs
                              text-slate-400
                            ">
                              {
                                log.activityDate
                              }
                            </td>


                            <td className="
                              whitespace-nowrap
                              px-4
                              py-3
                              text-xs
                              text-slate-400
                            ">
                              {
                                formatCreatedAt(
                                  log.createdAt
                                )
                              }
                            </td>


                            <td className="
                              px-4
                              py-3
                            ">

                              <span className="
                                inline-flex
                                items-center
                                rounded
                                border
                                border-slate-700
                                bg-slate-900
                                px-2
                                py-1
                                text-xs
                                font-medium
                                text-slate-200
                              ">
                                {
                                  log.categoryName
                                }
                              </span>

                            </td>


                            <td className="
                              px-4
                              py-3
                              font-semibold
                              text-white
                            ">
                              {
                                log.activityTypeName
                              }
                            </td>


                            <td className="
                              px-4
                              py-3
                              text-right
                              font-mono
                              text-emerald-400
                            ">
                              {
                                log.quantity
                              }
                              {' '}
                              {
                                log.unit
                              }
                            </td>


                            <td className="
                              px-4
                              py-3
                              text-right
                              font-mono
                              font-bold
                              text-emerald-400
                            ">
                              {
                                Number(
                                  log.totalEmission ||
                                    0
                                ).toFixed(
                                  2
                                )
                              }
                              {' '}
                              kg
                            </td>


                            <td className="
                              px-4
                              py-3
                              text-right
                            ">

                              <div className="
                                flex
                                items-center
                                justify-end
                                gap-2
                              ">


                                {/* EDIT */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEdit(
                                      log
                                    )
                                  }
                                  className="
                                    flex
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    border-teal-900/50
                                    bg-teal-950/30
                                    px-2.5
                                    py-1.5
                                    text-xs
                                    font-semibold
                                    text-teal-400
                                    transition
                                    hover:bg-teal-900/40
                                    hover:text-teal-300
                                  "
                                  title="Edit Activity"
                                >

                                  <Edit3 className="
                                    h-3.5
                                    w-3.5
                                  " />

                                  Edit

                                </button>


                                {/* DELETE */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeletingLog(
                                      log
                                    )
                                  }
                                  className="
                                    flex
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    border-rose-900/40
                                    bg-rose-950/30
                                    px-2.5
                                    py-1.5
                                    text-xs
                                    font-semibold
                                    text-rose-400
                                    transition
                                    hover:bg-rose-900/50
                                  "
                                  title="Delete Activity"
                                >

                                  <Trash2 className="
                                    h-3.5
                                    w-3.5
                                  " />

                                  Delete

                                </button>

                              </div>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </div>

        </div>


        {/* =================================================
            PAGINATION
        ================================================= */}

        <Pagination
          page={safePage}
          pageSize={pageSize}
          total={
            totalRecords
          }
          onPageChange={
            setPage
          }
          onPageSizeChange={(
            newSize
          ) => {

            setPageSize(
              newSize
            );

            setPage(1);

          }}
        />

      </main>


      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {deletingLog && (

        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-slate-950/80
          p-4
          backdrop-blur-sm
        ">

          <div className="
            w-full
            max-w-md
            space-y-6
            rounded-2xl
            border
            border-slate-800
            bg-slate-900
            p-6
            shadow-2xl
          ">

            <div className="
              flex
              items-center
              gap-3
              text-rose-400
            ">

              <AlertCircle className="
                h-7
                w-7
              " />

              <h3 className="
                text-lg
                font-bold
                text-white
              ">
                Delete Activity
              </h3>

            </div>


            <p className="
              text-sm
              leading-6
              text-slate-300
            ">

              Are you sure you want to
              delete activity
              {' '}

              <strong className="
                text-white
              ">
                {
                  deletingLog.activityTypeName
                }
              </strong>

              {' '}
              on
              {' '}

              <strong className="
                text-emerald-400
              ">
                {
                  deletingLog.activityDate
                }
              </strong>
              ?

            </p>


            <div className="
              flex
              items-center
              justify-end
              gap-3
              border-t
              border-slate-800
              pt-4
            ">

              <button
                type="button"
                onClick={() =>
                  setDeletingLog(
                    null
                  )
                }
                className="
                  rounded-xl
                  bg-slate-800
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-300
                  transition
                  hover:bg-slate-700
                "
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={
                  handleDelete
                }
                className="
                  rounded-xl
                  bg-rose-600
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-rose-500
                "
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