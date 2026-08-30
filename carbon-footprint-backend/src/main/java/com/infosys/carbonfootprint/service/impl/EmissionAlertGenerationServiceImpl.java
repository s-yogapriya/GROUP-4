package com.infosys.carbonfootprint.service.impl;

import com.infosys.carbonfootprint.entity.Alert;
import com.infosys.carbonfootprint.entity.AlertSeverity;
import com.infosys.carbonfootprint.entity.AlertType;
import com.infosys.carbonfootprint.entity.ActivityLog;
import com.infosys.carbonfootprint.repository.ActivityLogRepository;
import com.infosys.carbonfootprint.repository.AlertRepository;
import com.infosys.carbonfootprint.repository.CategoryRepository;
import com.infosys.carbonfootprint.repository.EmissionLimitRepository;
import com.infosys.carbonfootprint.repository.GoalRepository;
import com.infosys.carbonfootprint.repository.UserRepository;
import com.infosys.carbonfootprint.service.EmissionAlertGenerationService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class EmissionAlertGenerationServiceImpl
        implements EmissionAlertGenerationService {

    private static final Map<String, String> RECS = Map.of(
            "Transport",
            "Your transport emissions are high. Consider public transport, carpooling, cycling or walking for shorter journeys.",

            "Electricity",
            "Your electricity emissions are high. Consider reducing unnecessary electricity usage and switching off unused appliances.",

            "Food",
            "Your food-related emissions are high. Consider reducing food waste and choosing lower-emission alternatives.",

            "Shopping",
            "Your shopping-related emissions are high. Consider reusing products and avoiding unnecessary purchases."
    );


    private final EmissionLimitRepository limits;
    private final AlertRepository alerts;
    private final ActivityLogRepository logs;
    private final UserRepository users;
    private final CategoryRepository categories;
    private final GoalRepository goals;


    public EmissionAlertGenerationServiceImpl(
            EmissionLimitRepository limits,
            AlertRepository alerts,
            ActivityLogRepository logs,
            UserRepository users,
            CategoryRepository categories,
            GoalRepository goals
    ) {
        this.limits = limits;
        this.alerts = alerts;
        this.logs = logs;
        this.users = users;
        this.categories = categories;
        this.goals = goals;
    }


    /**
     * Called after a user creates or updates an activity.
     *
     * Checks:
     * 1. Category monthly emission limit.
     * 2. User monthly carbon goal.
     */
    @Override
    @Transactional
    public void checkAfterActivity(
            Long userId,
            Long categoryId,
            LocalDate date
    ) {

        /*
         * ==========================================================
         * 1. CATEGORY MONTHLY EMISSION LIMIT
         * ==========================================================
         */

        limits
                .findByCategoryCategoryIdAndActiveTrue(
                        categoryId
                )
                .ifPresent(limit -> {

                    LocalDate from =
                            LocalDate.of(
                                    date.getYear(),
                                    date.getMonth(),
                                    1
                            );

                    LocalDate to =
                            from
                                    .plusMonths(1)
                                    .minusDays(1);


                    double total =
                            logs
                                    .findByUserIdAndCategoryCategoryIdAndActivityDateBetween(
                                            userId,
                                            categoryId,
                                            from,
                                            to
                                    )
                                    .stream()
                                    .mapToDouble(
                                            ActivityLog::getTotalEmission
                                    )
                                    .sum();


                    double monthlyLimit =
                            limit.getMonthlyLimit();


                    /*
                     * Create only one active HIGH_EMISSION alert
                     * for the user/category/month/year.
                     */
                    boolean alertAlreadyExists =
                            alerts.existsByUserIdAndCategoryCategoryIdAndAlertTypeAndMonthAndYear(
                                    userId,
                                    categoryId,
                                    AlertType.HIGH_EMISSION,
                                    date.getMonthValue(),
                                    date.getYear()
                            );


                    if (
                            total > monthlyLimit &&
                            !alertAlreadyExists
                    ) {

                        String name =
                                limit.getCategory()
                                        .getCategoryName();


                        Alert alert =
                                Alert.builder()

                                        .user(
                                                users.findById(userId)
                                                        .orElseThrow()
                                        )

                                        .category(
                                                categories.findById(categoryId)
                                                        .orElseThrow()
                                        )

                                        .alertType(
                                                AlertType.HIGH_EMISSION
                                        )

                                        .severity(
                                                AlertSeverity.HIGH
                                        )

                                        .title(
                                                "High "
                                                        + name
                                                        + " Emissions"
                                        )

                                        .message(
                                                "Your "
                                                        + name
                                                        + " emissions have exceeded the monthly limit."
                                        )

                                        .recommendation(
                                                RECS.getOrDefault(
                                                        name,
                                                        "Review your "
                                                                + name.toLowerCase()
                                                                + " activities to reduce emissions."
                                                )
                                        )

                                        .currentEmission(
                                                total
                                        )

                                        .monthlyLimit(
                                                monthlyLimit
                                        )

                                        /*
                                         * IMPORTANT:
                                         * PostgreSQL requires this column.
                                         */
                                        .thresholdValue(
                                                monthlyLimit
                                        )

                                        .exceededAmount(
                                                total - monthlyLimit
                                        )

                                        .month(
                                                date.getMonthValue()
                                        )

                                        .year(
                                                date.getYear()
                                        )

                                        .isRead(false)

                                        .resolved(false)

                                        .build();


                        alerts.save(alert);
                    }
                });


        /*
         * ==========================================================
         * 2. MONTHLY USER GOAL
         * ==========================================================
         */

        checkMonthlyGoal(
                userId,
                date
        );
    }


    /**
     * Check the current month's goal.
     */
    @Override
    @Transactional
    public void checkCurrentMonthlyGoal(
            Long userId
    ) {
        checkMonthlyGoal(
                userId,
                LocalDate.now()
        );
    }


    /**
     * Checks and maintains the user's monthly carbon-goal alert.
     */
    private void checkMonthlyGoal(
            Long userId,
            LocalDate date
    ) {

        goals
                .findByUserIdAndMonthAndYear(
                        userId,
                        date.getMonthValue(),
                        date.getYear()
                )
                .ifPresent(goal -> {

                    LocalDate from =
                            LocalDate.of(
                                    date.getYear(),
                                    date.getMonth(),
                                    1
                            );

                    LocalDate to =
                            from
                                    .plusMonths(1)
                                    .minusDays(1);


                    double total =
                            logs
                                    .findByUserIdAndDateRange(
                                            userId,
                                            from,
                                            to
                                    )
                                    .stream()
                                    .mapToDouble(
                                            ActivityLog::getTotalEmission
                                    )
                                    .sum();


                    List<Alert> monthAlerts =
                            alerts
                                    .findByUserIdAndAlertTypeAndMonthAndYearAndCategoryIsNullOrderByCreatedAtDesc(
                                            userId,
                                            AlertType.GOAL_EXCEEDED,
                                            date.getMonthValue(),
                                            date.getYear()
                                    );


                    /*
                     * ==================================================
                     * INVALID / EMPTY GOAL
                     * ==================================================
                     */

                    if (
                            goal.getTargetAmount() == null ||
                            goal.getTargetAmount() <= 0
                    ) {

                        boolean changed =
                                false;


                        for (
                                Alert alert :
                                monthAlerts
                        ) {

                            if (
                                    !alert.isResolved()
                            ) {

                                alert.setResolved(
                                        true
                                );

                                alert.setRead(
                                        true
                                );

                                changed =
                                        true;
                            }
                        }


                        if (changed) {
                            alerts.saveAll(
                                    monthAlerts
                            );
                        }


                        return;
                    }


                    double target =
                            goal.getTargetAmount();


                    /*
                     * ==================================================
                     * FIND ACTIVE ALERT FOR CURRENT TARGET
                     * ==================================================
                     */

                    Alert matchingActiveAlert =
                            null;


                    for (
                            Alert alert :
                            monthAlerts
                    ) {

                        Double alertTarget =
                                alert.getMonthlyLimit();


                        /*
                         * Avoid NullPointerException
                         * if an old row has no monthly_limit.
                         */
                        if (
                                !alert.isResolved() &&
                                alertTarget != null &&
                                Double.compare(
                                        alertTarget,
                                        target
                                ) == 0
                        ) {

                            matchingActiveAlert =
                                    alert;

                            break;
                        }
                    }


                    /*
                     * ==================================================
                     * RESOLVE OLD TARGET ALERTS
                     * ==================================================
                     */

                    for (
                            Alert alert :
                            monthAlerts
                    ) {

                        if (
                                alert != matchingActiveAlert
                        ) {

                            alert.setResolved(
                                    true
                            );

                            alert.setRead(
                                    true
                            );
                        }
                    }


                    /*
                     * ==================================================
                     * EMISSIONS WITHIN TARGET
                     * ==================================================
                     */

                    if (
                            total <= target
                    ) {

                        if (
                                !monthAlerts.isEmpty()
                        ) {

                            alerts.saveAll(
                                    monthAlerts
                            );
                        }

                        return;
                    }


                    /*
                     * ==================================================
                     * TARGET EXCEEDED
                     * ==================================================
                     */

                    if (
                            matchingActiveAlert == null
                    ) {

                        boolean alreadyExists =
                                monthAlerts
                                        .stream()
                                        .anyMatch(
                                                alert -> {

                                                    Double alertTarget =
                                                            alert.getMonthlyLimit();

                                                    return
                                                            !alert.isResolved() &&
                                                            alertTarget != null &&
                                                            Double.compare(
                                                                    alertTarget,
                                                                    target
                                                            ) == 0;
                                                }
                                        );


                        if (
                                !alreadyExists
                        ) {

                            matchingActiveAlert =
                                    Alert.builder()

                                            .user(
                                                    users.findById(userId)
                                                            .orElseThrow()
                                            )

                                            /*
                                             * GOAL alerts are global
                                             * monthly alerts, so category
                                             * remains null.
                                             */
                                            .category(null)

                                            .alertType(
                                                    AlertType.GOAL_EXCEEDED
                                            )

                                            .severity(
                                                    AlertSeverity.WARNING
                                            )

                                            .title(
                                                    "Monthly Carbon Target Exceeded"
                                            )

                                            .message(
                                                    "Your monthly carbon emissions have exceeded your configured target."
                                            )

                                            .recommendation(
                                                    "Review your activities across all categories to bring emissions back within your target."
                                            )

                                            /*
                                             * Current emission.
                                             */
                                            .currentEmission(
                                                    total
                                            )

                                            /*
                                             * User's monthly goal.
                                             */
                                            .monthlyLimit(
                                                    target
                                            )

                                            /*
                                             * IMPORTANT:
                                             * threshold_value cannot be NULL.
                                             */
                                            .thresholdValue(
                                                    target
                                            )

                                            /*
                                             * Amount above target.
                                             */
                                            .exceededAmount(
                                                    total - target
                                            )

                                            .month(
                                                    date.getMonthValue()
                                            )

                                            .year(
                                                    date.getYear()
                                            )

                                            .isRead(false)

                                            .resolved(false)

                                            .build();
                        }
                    }


                    /*
                     * ==================================================
                     * UPDATE / SAVE CURRENT ALERT
                     * ==================================================
                     */

                    if (
                            matchingActiveAlert != null
                    ) {

                        updateCurrentGoalAlert(
                                matchingActiveAlert,
                                total,
                                target,
                                date
                        );


                        alerts.save(
                                matchingActiveAlert
                        );
                    }


                    /*
                     * ==================================================
                     * SAVE ALL RESOLVED OLD ALERTS
                     * ==================================================
                     */

                    List<Alert> resolvedAlerts =
                            monthAlerts
                                    .stream()
                                    .filter(
                                            Alert::isResolved
                                    )
                                    .toList();


                    if (
                            !resolvedAlerts.isEmpty()
                    ) {

                        alerts.saveAll(
                                resolvedAlerts
                        );
                    }
                });
    }


    /**
     * Update the existing monthly goal alert.
     */
    private void updateCurrentGoalAlert(
            Alert alert,
            double total,
            double target,
            LocalDate date
    ) {

        double exceeded =
                total - target;


        String monthName =
                date.getMonth()
                        .getDisplayName(
                                TextStyle.FULL,
                                Locale.ENGLISH
                        );


        /*
         * Current user emission.
         */
        alert.setCurrentEmission(
                total
        );


        /*
         * Goal / monthly target.
         */
        alert.setMonthlyLimit(
                target
        );


        /*
         * IMPORTANT:
         *
         * threshold_value must always
         * contain the target value.
         */
        alert.setThresholdValue(
                target
        );


        /*
         * Amount by which target is exceeded.
         */
        alert.setExceededAmount(
                exceeded
        );


        alert.setMessage(
                "Your "
                        + monthName
                        + " emissions are "
                        + String.format(
                                Locale.US,
                                "%.2f",
                                total
                        )
                        + " kg CO2e, which is "
                        + String.format(
                                Locale.US,
                                "%.2f",
                                exceeded
                        )
                        + " kg above your target."
        );


        alert.setResolved(
                false
        );
    }
}