import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

import {
  Target,
  Save,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Leaf,
  RefreshCw,
  BarChart3,
  ArrowDown,
  ArrowUp,
  Info,
} from 'lucide-react';

import { formatCreatedAt } from '../utils/dateTime';
import Pagination from '../components/Pagination';


/* =========================================================
   CONSTANTS
========================================================= */

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];


const CATEGORY_COLORS = [
  'bg-emerald-400',
  'bg-cyan-400',
  'bg-blue-400',
  'bg-amber-400',
  'bg-orange-400',
  'bg-purple-400',
  'bg-pink-400',
  'bg-teal-400',
  'bg-lime-400',
  'bg-red-400',
];


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

  if (
    typeof error?.response?.data ===
    'string'
  ) {
    return error.response.data;
  }

  if (
    error?.response?.data?.message
  ) {
    return error.response.data.message;
  }

  if (
    error?.data?.message
  ) {
    return error.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'Unable to complete the request.';
};


/* =========================================================
   STATUS STYLE
========================================================= */

function statusStyle(status) {
  switch (status) {
    case 'TARGET EXCEEDED':
      return {
        color: 'text-rose-400',
        bg: 'bg-rose-950/40 border-rose-700/50',
        icon: AlertTriangle,
        iconColor: 'text-rose-400',
      };

    case 'NEAR LIMIT':
      return {
        color: 'text-amber-400',
        bg: 'bg-amber-950/40 border-amber-700/50',
        icon: TrendingUp,
        iconColor: 'text-amber-400',
      };

    case 'ON TRACK':
      return {
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/40 border-emerald-700/50',
        icon: CheckCircle2,
        iconColor: 'text-emerald-400',
      };

    case 'GOAL ACHIEVED':
      return {
        color: 'text-teal-400',
        bg: 'bg-teal-950/40 border-teal-700/50',
        icon: CheckCircle2,
        iconColor: 'text-teal-400',
      };

    default:
      return {
        color: 'text-slate-400',
        bg: 'bg-slate-800/40 border-slate-700',
        icon: Clock,
        iconColor: 'text-slate-400',
      };
  }
}


/* =========================================================
   COMPONENT
========================================================= */

export default function GoalsPage() {
  const { clearWarnings, showToast } =
    useAuth();


  /* =======================================================
     PAGINATION
  ======================================================= */

  const [page, setPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(5);


  /* =======================================================
     GOAL DATA
  ======================================================= */

  const [goal, setGoal] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  const [totalRecords, setTotalRecords] =
    useState(0);


  /* =======================================================
     CATEGORY / ACTIVITY DATA
  ======================================================= */

  const [activityLogs, setActivityLogs] =
    useState([]);

  const [loadingActivities, setLoadingActivities] =
    useState(false);


  /* =======================================================
     PAGE LOADING
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


  /* =======================================================
     FORM
  ======================================================= */

  const [target, setTarget] =
    useState('');

  const [error, setError] =
    useState('');

  const [msg, setMsg] =
    useState('');

  const [saving, setSaving] =
    useState(false);


  /* =======================================================
     LOAD CURRENT GOAL + HISTORY + ACTIVITIES
  ======================================================= */

  const load = useCallback(
    async () => {
      setLoading(true);

      try {
        const [
          currentGoalResponse,
          historyResponse,
          activityResponse,
        ] = await Promise.all([
          api
            .get(
              '/user/goals/current'
            )
            .catch(
              () => ({
                data: null,
              })
            ),

          api
            .get(
              `/user/goals/history/page?page=${page - 1}&size=${pageSize}`
            )
            .catch(
              () => ({
                data: {
                  content: [],
                  totalElements: 0,
                },
              })
            ),

          api
            .get(
              '/user/activities'
            )
            .catch(
              () => ({
                data: [],
              })
            ),
        ]);


        const currentGoal =
          currentGoalResponse?.data ??
          null;


        const historyData =
          historyResponse?.data;


        const activities =
          Array.isArray(
            activityResponse?.data
          )
            ? activityResponse.data
            : [];


        setGoal(
          currentGoal
        );


        setHistory(
          Array.isArray(
            historyData?.content
          )
            ? historyData.content
            : []
        );


        setTotalRecords(
          Number(
            historyData?.totalElements ||
            0
          )
        );


        setActivityLogs(
          activities
        );


        /*
         * Populate the current target
         * in the input field.
         */
        if (
          currentGoal?.targetAmount !=
            null
        ) {
          setTarget(
            String(
              currentGoal.targetAmount
            )
          );
        } else {
          setTarget('');
        }

      } catch (loadError) {

        console.error(
          'Goals page loading failed:',
          loadError?.response?.data ||
            loadError
        );

        showToast(
          getErrorMessage(
            loadError
          ),
          'error'
        );

      } finally {
        setLoading(false);
      }
    },
    [
      page,
      pageSize,
      showToast,
    ]
  );


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    load();
  }, [load]);


  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };


  /* =======================================================
     SAVE / UPDATE GOAL
  ======================================================= */

  const save = async (
    event
  ) => {
    event.preventDefault();

    setError('');
    setMsg('');


    const value =
      Number(target);


    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      setError(
        'Monthly target must be greater than 0.'
      );
      return;
    }


    setSaving(true);


    try {
      let response;


      /*
       * Existing goal:
       * UPDATE it.
       */
      if (goal?.id) {

        response =
          await api.put(
            `/user/goals/${goal.id}`,
            {
              targetAmount:
                value,
            }
          );

      } else {

        /*
         * No current goal:
         * CREATE it.
         */
        response =
          await api.post(
            '/user/goals',
            {
              targetAmount:
                value,
            }
          );
      }


      clearWarnings();


      const successMessage =
        response?.message ||
        (
          goal?.id
            ? 'Monthly target updated successfully.'
            : 'Monthly target saved successfully.'
        );


      setMsg(
        successMessage
      );


      /*
       * Reload the latest goal,
       * history and category data.
       */
      await load();

    } catch (saveError) {

      console.error(
        'Goal save/update failed:',
        saveError?.response?.data ||
          saveError
      );


      setError(
        getErrorMessage(
          saveError
        )
      );

    } finally {
      setSaving(false);
    }
  };


  /* =======================================================
     CURRENT PROGRESS
  ======================================================= */

  const currentEmission =
    Number(
      goal?.currentEmission ||
      0
    );


  const targetAmount =
    Number(
      goal?.targetAmount ||
      0
    );


  const percentageUsed =
    targetAmount > 0
      ? (
          currentEmission /
          targetAmount
        ) *
        100
      : 0;


  const safePercentage =
    Math.max(
      0,
      Math.min(
        100,
        percentageUsed
      )
    );


  const remaining =
    Math.max(
      0,
      targetAmount -
        currentEmission
    );


  const exceededAmount =
    Math.max(
      0,
      currentEmission -
        targetAmount
    );


  /* =======================================================
     STATUS
  ======================================================= */

  const calculatedStatus = useMemo(
    () => {

      if (
        !goal ||
        targetAmount <= 0
      ) {
        return 'NO TARGET';
      }


      if (
        currentEmission >
        targetAmount
      ) {
        return 'TARGET EXCEEDED';
      }


      if (
        currentEmission ===
          targetAmount
      ) {
        return 'GOAL ACHIEVED';
      }


      if (
        safePercentage >=
        80
      ) {
        return 'NEAR LIMIT';
      }


      return 'ON TRACK';

    },
    [
      goal,
      targetAmount,
      currentEmission,
      safePercentage,
    ]
  );


  const status =
    goal?.status ||
    calculatedStatus;


  const currentStatusStyle =
    statusStyle(
      status
    );


  const StatusIcon =
    currentStatusStyle.icon;


  /* =======================================================
     CATEGORY EMISSION BREAKDOWN
  ======================================================= */

  const categoryBreakdown =
    useMemo(() => {

      const map =
        new Map();


      activityLogs.forEach(
        (activity) => {

          const categoryId =
            activity?.categoryId;


          const categoryName =
            activity?.categoryName ||
            'Other';


          const emission =
            Number(
              activity?.totalEmission ||
              0
            );


          const existing =
            map.get(
              String(
                categoryId ??
                  categoryName
              )
            );


          if (existing) {

            existing.emission +=
              emission;

          } else {

            map.set(
              String(
                categoryId ??
                  categoryName
              ),
              {
                categoryId,
                categoryName,
                emission,
              }
            );
          }

        }
      );


      return Array.from(
        map.values()
      )
        .map(
          (item) => ({
            ...item,
            emission:
              Number(
                item.emission.toFixed(
                  2
                )
              ),
          })
        )
        .sort(
          (a, b) =>
            b.emission -
            a.emission
        );

    }, [
      activityLogs,
    ]);


  const categoryTotal =
    categoryBreakdown.reduce(
      (
        sum,
        category
      ) =>
        sum +
        Number(
          category.emission ||
            0
        ),
      0
    );


  /* =======================================================
     CATEGORY SHARE
  ======================================================= */

  const getCategoryShare = (
    emission
  ) => {

    if (
      categoryTotal <= 0
    ) {
      return 0;
    }


    return (
      Number(emission) /
      categoryTotal
    ) *
    100;
  };


  /* =======================================================
     PAGE SAFETY
  ======================================================= */

  const safePage =
    Math.max(
      1,
      page
    );


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="
      mx-auto
      w-full
      max-w-6xl
      space-y-6
      px-5
      py-8
    ">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="
        flex
        flex-col
        gap-4
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

            <Target className="
              h-7
              w-7
              text-emerald-400
            " />

            Goals & Targets

          </h1>


          <p className="
            mt-1
            text-sm
            text-slate-400
          ">
            Set one overall monthly carbon target and track how your emissions are distributed across categories.
          </p>

        </div>


        <button
          type="button"
          onClick={
            handleRefresh
          }
          disabled={
            refreshing ||
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
            px-4
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
              refreshing ||
              loading
                ? 'animate-spin'
                : ''
            }
          `} />

          Refresh

        </button>

      </div>


      {/* ===================================================
          LOADING
      =================================================== */}

      {loading ? (

        <section className="
          rounded-2xl
          border
          border-slate-700
          bg-slate-800/50
          p-12
          text-center
        ">

          <RefreshCw className="
            mx-auto
            mb-3
            h-8
            w-8
            animate-spin
            text-emerald-400
          " />

          <p className="
            text-sm
            text-slate-400
          ">
            Loading your goals...
          </p>

        </section>

      ) : (

        <>
          {/* =================================================
              CURRENT MONTH
          ================================================= */}

          <section className="
            space-y-6
            rounded-2xl
            border
            border-slate-700
            bg-slate-800/50
            p-6
            shadow-xl
          ">

            <div className="
              flex
              items-center
              justify-between
              gap-3
            ">

              <div>

                <h2 className="
                  font-bold
                  text-white
                ">
                  Current Month Progress
                </h2>

                <p className="
                  mt-1
                  text-xs
                  text-slate-500
                ">
                  Overall monthly target across all carbon-emitting activities.
                </p>

              </div>


              {goal && (

                <div className={`
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  ${currentStatusStyle.bg}
                  ${currentStatusStyle.color}
                `}>

                  <StatusIcon className="
                    h-3.5
                    w-3.5
                  " />

                  {status}

                </div>

              )}

            </div>


            {/* =============================================
                METRICS
            ============================================= */}

            <div className="
              grid
              gap-4
              sm:grid-cols-2
              xl:grid-cols-4
            ">


              {/* TARGET */}

              <div className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900/60
                p-4
              ">

                <p className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-slate-400
                ">
                  Monthly Target
                </p>


                <p className="
                  mt-1
                  text-2xl
                  font-black
                  text-white
                ">

                  {targetAmount >
                    0
                    ? targetAmount.toFixed(
                        2
                      )
                    : '—'}

                </p>


                <p className="
                  text-xs
                  text-slate-500
                ">
                  {targetAmount >
                    0
                    ? 'kg CO₂e'
                    : 'No target set'}
                </p>

              </div>


              {/* CURRENT */}

              <div className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900/60
                p-4
              ">

                <p className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-slate-400
                ">
                  Current Emissions
                </p>


                <p className={`
                  mt-1
                  text-2xl
                  font-black
                  ${
                    targetAmount >
                      0 &&
                    currentEmission >
                      targetAmount
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }
                `}>

                  {
                    currentEmission.toFixed(
                      2
                    )
                  }

                </p>


                <p className="
                  text-xs
                  text-slate-500
                ">
                  kg CO₂e
                </p>

              </div>


              {/* REMAINING */}

              <div className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900/60
                p-4
              ">

                <p className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-slate-400
                ">
                  {exceededAmount >
                    0
                    ? 'Exceeded By'
                    : 'Remaining'}
                </p>


                <p className={`
                  mt-1
                  text-2xl
                  font-black
                  ${
                    exceededAmount >
                    0
                      ? 'text-rose-400'
                      : 'text-teal-400'
                  }
                `}>

                  {targetAmount >
                    0
                    ? (
                        exceededAmount >
                        0
                          ? exceededAmount
                          : remaining
                      ).toFixed(
                        2
                      )
                    : '—'}

                </p>


                <p className="
                  text-xs
                  text-slate-500
                ">
                  {targetAmount >
                    0
                    ? 'kg CO₂e'
                    : 'No target set'}
                </p>

              </div>


              {/* USED */}

              <div className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900/60
                p-4
              ">

                <p className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-slate-400
                ">
                  Target Used
                </p>


                <p className={`
                  mt-1
                  text-2xl
                  font-black
                  ${
                    targetAmount >
                      0 &&
                    safePercentage >=
                      100
                      ? 'text-rose-400'
                      : targetAmount >
                          0 &&
                        safePercentage >=
                          80
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                  }
                `}>

                  {targetAmount >
                    0
                    ? `${percentageUsed.toFixed(
                        1
                      )}%`
                    : '—'}

                </p>


                <p className="
                  text-xs
                  text-slate-500
                ">
                  {targetAmount >
                    0
                    ? 'of target'
                    : 'No target set'}
                </p>

              </div>

            </div>


            {/* =============================================
                PROGRESS BAR
            ============================================= */}

            {targetAmount >
            0 ? (

              <div>

                <div className="
                  mb-2
                  flex
                  items-center
                  justify-between
                  text-xs
                  text-slate-400
                ">

                  <span>
                    0 kg
                  </span>

                  <span>
                    {currentEmission.toFixed(
                      2
                    )}
                    {' / '}
                    {targetAmount.toFixed(
                      2
                    )}
                    {' kg'}
                  </span>

                </div>


                <div className="
                  h-4
                  overflow-hidden
                  rounded-full
                  bg-slate-700
                ">

                  <div
                    className={`
                      h-full
                      rounded-full
                      transition-all
                      duration-500
                      ${
                        safePercentage >=
                        100
                          ? 'bg-rose-500'
                          : safePercentage >=
                              80
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                      }
                    `}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          safePercentage
                        )
                      )}%`,
                    }}
                  />

                </div>


                <div className="
                  mt-2
                  flex
                  items-center
                  justify-between
                  text-[11px]
                ">

                  <span className="
                    text-slate-500
                  ">
                    Monthly progress
                  </span>

                  <span className={`
                    font-bold
                    ${
                      safePercentage >=
                      100
                        ? 'text-rose-400'
                        : safePercentage >=
                            80
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                    }
                  `}>
                    {
                      percentageUsed.toFixed(
                        1
                      )
                    }%
                  </span>

                </div>

              </div>

            ) : (

              <div className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900/50
                p-4
              ">

                <div className="
                  flex
                  items-start
                  gap-3
                ">

                  <Info className="
                    mt-0.5
                    h-5
                    w-5
                    shrink-0
                    text-slate-400
                  " />

                  <p className="
                    text-sm
                    leading-6
                    text-slate-400
                  ">
                    No monthly target is configured. Set a target below to enable monthly progress tracking and target alerts.
                  </p>

                </div>

              </div>

            )}


            {/* =============================================
                TRACKING NOTE
            ============================================= */}

            <div className="
              flex
              items-start
              gap-3
              rounded-xl
              border
              border-teal-900/50
              bg-teal-950/20
              p-4
            ">

              <Target className="
                mt-0.5
                h-5
                w-5
                shrink-0
                text-teal-400
              " />


              <div>

                <p className="
                  font-bold
                  text-teal-300
                ">
                  One overall monthly target
                </p>

                <p className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-400
                ">
                  Your target applies to your total monthly carbon emissions. Category values below show how your actual emissions are distributed.
                </p>

              </div>

            </div>


            {/* =============================================
                CATEGORY BREAKDOWN
            ============================================= */}

            <div className="
              border-t
              border-slate-700
              pt-6
            ">

              <div className="
                mb-5
                flex
                items-center
                gap-2
              ">

                <BarChart3 className="
                  h-5
                  w-5
                  text-emerald-400
                " />

                <div>

                  <h3 className="
                    font-bold
                    text-white
                  ">
                    Emissions by Category
                  </h3>

                  <p className="
                    text-xs
                    text-slate-500
                  ">
                    Actual emissions contributing to your monthly total.
                  </p>

                </div>

              </div>


              {loadingActivities ? (

                <div className="
                  py-8
                  text-center
                  text-slate-400
                ">
                  Loading category emissions...
                </div>

              ) : categoryBreakdown.length >
                0 ? (

                <div className="
                  grid
                  gap-3
                  sm:grid-cols-2
                ">

                  {categoryBreakdown.map(
                    (
                      category,
                      index
                    ) => {

                      const share =
                        getCategoryShare(
                          category.emission
                        );


                      return (
                        <div
                          key={
                            `${category.categoryId}-${category.categoryName}`
                          }
                          className="
                            rounded-xl
                            border
                            border-slate-700
                            bg-slate-900/50
                            p-4
                          "
                        >

                          <div className="
                            flex
                            items-start
                            justify-between
                            gap-3
                          ">

                            <div className="
                              min-w-0
                            ">

                              <div className="
                                flex
                                items-center
                                gap-2
                              ">

                                <span
                                  className={`
                                    h-2.5
                                    w-2.5
                                    shrink-0
                                    rounded-full
                                    ${
                                      CATEGORY_COLORS[
                                        index %
                                          CATEGORY_COLORS.length
                                      ]
                                    }
                                  `}
                                />

                                <p className="
                                  truncate
                                  text-sm
                                  font-semibold
                                  text-white
                                ">
                                  {
                                    category.categoryName
                                  }
                                </p>

                              </div>


                              <p className="
                                mt-1
                                text-xs
                                text-slate-500
                              ">
                                {
                                  share.toFixed(
                                    1
                                  )
                                }%
                                {' '}
                                of current emissions
                              </p>

                            </div>


                            <p className="
                              whitespace-nowrap
                              text-sm
                              font-black
                              text-emerald-400
                            ">
                              {
                                category.emission.toFixed(
                                  2
                                )
                              }
                              {' '}
                              kg
                            </p>

                          </div>


                          <div className="
                            mt-3
                            h-2
                            overflow-hidden
                            rounded-full
                            bg-slate-800
                          ">

                            <div
                              className={`
                                h-full
                                rounded-full
                                transition-all
                                ${
                                  CATEGORY_COLORS[
                                    index %
                                      CATEGORY_COLORS.length
                                  ]
                                }
                              `}
                              style={{
                                width: `${Math.min(
                                  100,
                                  share
                                )}%`,
                              }}
                            />

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              ) : (

                <div className="
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-900/50
                  p-6
                  text-center
                ">

                  <Leaf className="
                    mx-auto
                    mb-2
                    h-8
                    w-8
                    text-slate-600
                  " />

                  <p className="
                    text-sm
                    font-semibold
                    text-slate-400
                  ">
                    No activity emissions recorded this month.
                  </p>

                </div>

              )}

            </div>


            {/* =============================================
                TARGET FORM
            ============================================= */}

            <div className="
              border-t
              border-slate-700
              pt-6
            ">

              <div className="
                mb-4
              ">

                <h3 className="
                  text-sm
                  font-bold
                  text-white
                ">

                  {
                    goal
                      ? 'Update Monthly Target'
                      : 'Set Monthly Target'
                  }

                </h3>

                <p className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-500
                ">
                  Enter your desired maximum total carbon emissions for the current month.
                </p>

              </div>


              <form
                onSubmit={
                  save
                }
                className="
                  flex
                  w-full
                  max-w-lg
                  flex-col
                  gap-3
                  sm:flex-row
                "
              >

                <div className="
                  flex-1
                ">

                  <div className="
                    relative
                  ">

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={
                        target
                      }
                      onChange={(
                        event
                      ) => {

                        setTarget(
                          event.target.value
                        );

                        setError('');
                        setMsg('');

                      }}
                      placeholder="e.g. 50.00"
                      className={`
                        w-full
                        rounded-xl
                        border
                        bg-slate-900
                        px-3.5
                        py-3
                        text-sm
                        text-white
                        outline-none
                        placeholder:text-slate-600
                        ${
                          error
                            ? 'border-rose-500'
                            : 'border-slate-700 focus:border-emerald-500'
                        }
                      `}
                    />

                  </div>


                  {error && (

                    <p className="
                      mt-1.5
                      text-xs
                      text-rose-400
                    ">
                      {error}
                    </p>

                  )}


                  {msg && (

                    <p className="
                      mt-1.5
                      text-xs
                      font-semibold
                      text-emerald-300
                    ">
                      {msg}
                    </p>

                  )}

                </div>


                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-emerald-500
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-slate-950
                    transition
                    hover:bg-emerald-400
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {saving ? (

                    <RefreshCw className="
                      h-4
                      w-4
                      animate-spin
                    " />

                  ) : (

                    <Save className="
                      h-4
                      w-4
                    " />

                  )}


                  {saving
                    ? 'Saving...'
                    : goal
                      ? 'Update Target'
                      : 'Save Target'}

                </button>

              </form>

            </div>

          </section>


          {/* =================================================
              GOAL HISTORY
          ================================================= */}

          <section className="
            space-y-4
            rounded-2xl
            border
            border-slate-700
            bg-slate-800/50
            p-6
            shadow-xl
          ">

            <div className="
              flex
              items-center
              justify-between
              gap-3
            ">

              <div>

                <h2 className="
                  font-bold
                  text-white
                ">
                  Goal History
                </h2>

                <p className="
                  mt-1
                  text-xs
                  text-slate-500
                ">
                  Previous monthly targets and their progress.
                </p>

              </div>


              <Clock className="
                h-5
                w-5
                text-slate-500
              " />

            </div>


            {history.length >
            0 ? (

              <div className="
                space-y-3
              ">

                {history.map(
                  (historyGoal) => {

                    const historyStatus =
                      statusStyle(
                        historyGoal.status
                      );


                    const HistoryIcon =
                      historyStatus.icon;


                    const historyTarget =
                      Number(
                        historyGoal.targetAmount ||
                        0
                      );


                    const historyActual =
                      Number(
                        historyGoal.currentEmission ||
                        0
                      );


                    const historyPercentage =
                      historyTarget >
                      0
                        ? (
                            historyActual /
                            historyTarget
                          ) *
                          100
                        : 0;


                    return (
                      <div
                        key={
                          historyGoal.id
                        }
                        className="
                          rounded-xl
                          border
                          border-slate-700
                          bg-slate-900/60
                          p-4
                        "
                      >

                        <div className="
                          flex
                          flex-col
                          gap-4
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                        ">


                          {/* LEFT */}

                          <div>

                            <p className="
                              font-semibold
                              text-white
                            ">
                              {
                                MONTH_NAMES[
                                  (
                                    historyGoal.month ||
                                    1
                                  ) - 1
                                ]
                              }
                              {' '}
                              {
                                historyGoal.year
                              }
                            </p>


                            <p className="
                              mt-1
                              text-xs
                              text-slate-400
                            ">

                              Target:
                              {' '}
                              {historyTarget.toFixed(
                                2
                              )}
                              {' '}
                              kg CO₂e
                              {' · '}
                              Actual:
                              {' '}
                              {historyActual.toFixed(
                                2
                              )}
                              {' '}
                              kg CO₂e

                            </p>


                            {historyGoal.createdAt && (

                              <p className="
                                mt-1
                                text-[11px]
                                text-slate-600
                              ">
                                Created:
                                {' '}
                                {
                                  formatCreatedAt(
                                    historyGoal.createdAt
                                  )
                                }
                              </p>

                            )}

                          </div>


                          {/* RIGHT */}

                          <div className="
                            flex
                            items-center
                            justify-between
                            gap-4
                            sm:justify-end
                          ">

                            <div className="
                              min-w-[120px]
                            ">

                              <div className="
                                mb-1
                                flex
                                justify-between
                                text-[10px]
                                text-slate-500
                              ">

                                <span>
                                  Progress
                                </span>

                                <span>
                                  {
                                    Math.min(
                                      999,
                                      Math.max(
                                        0,
                                        historyPercentage
                                      )
                                    ).toFixed(
                                      1
                                    )
                                  }%
                                </span>

                              </div>


                              <div className="
                                h-1.5
                                overflow-hidden
                                rounded-full
                                bg-slate-800
                              ">

                                <div
                                  className={`
                                    h-full
                                    rounded-full
                                    ${
                                      historyPercentage >=
                                      100
                                        ? 'bg-rose-400'
                                        : historyPercentage >=
                                            80
                                          ? 'bg-amber-400'
                                          : 'bg-emerald-400'
                                    }
                                  `}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.max(
                                        0,
                                        historyPercentage
                                      )
                                    )}%`,
                                  }}
                                />

                              </div>

                            </div>


                            <span className={`
                              inline-flex
                              items-center
                              gap-1.5
                              whitespace-nowrap
                              rounded-full
                              border
                              px-2.5
                              py-1.5
                              text-[10px]
                              font-bold
                              ${historyStatus.bg}
                              ${historyStatus.color}
                            `}>

                              <HistoryIcon className="
                                h-3.5
                                w-3.5
                              " />

                              {
                                historyGoal.status ===
                                'TARGET EXCEEDED'
                                  ? 'EXCEEDED'
                                  : historyGoal.status ||
                                    'TRACKED'
                              }

                            </span>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            ) : (

              <div className="
                rounded-xl
                border
                border-slate-700
                bg-slate-900/50
                p-8
                text-center
              ">

                <Clock className="
                  mx-auto
                  mb-2
                  h-8
                  w-8
                  text-slate-600
                " />

                <p className="
                  text-sm
                  font-semibold
                  text-slate-400
                ">
                  No previous goals available.
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-slate-600
                ">
                  Your monthly goal history will appear here.
                </p>

              </div>

            )}

          </section>


          {/* =================================================
              ALERT INFORMATION
          ================================================= */}

          <section className="
            rounded-2xl
            border
            border-slate-700
            bg-slate-800/40
            p-5
          ">

            <div className="
              flex
              items-start
              gap-3
            ">

              <Info className="
                mt-0.5
                h-5
                w-5
                shrink-0
                text-cyan-400
              " />


              <div>

                <h3 className="
                  text-sm
                  font-bold
                  text-white
                ">
                  How your target works
                </h3>


                <p className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-400
                ">
                  Your monthly target is one overall personal limit. Your activities from transportation, energy, water, waste, food, shopping, and other categories contribute to that total. Target-related notifications and exceeded-target alerts are shown in Alert History.
                </p>

              </div>

            </div>

          </section>

        </>

      )}


      {/* ===================================================
          PAGINATION
      =================================================== */}

      <Pagination
        page={
          safePage
        }
        pageSize={
          pageSize
        }
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
  );
}