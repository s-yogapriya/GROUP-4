package com.infosys.carbonfootprint.service.impl;

import com.infosys.carbonfootprint.entity.*;
import com.infosys.carbonfootprint.repository.*;
import com.infosys.carbonfootprint.service.EmissionAlertGenerationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class EmissionAlertGenerationServiceImpl implements EmissionAlertGenerationService {
    private static final Map<String, String> RECS = Map.of(
            "Transport", "Your transport emissions are high. Consider public transport, carpooling, cycling or walking for shorter journeys.",
            "Electricity", "Your electricity emissions are high. Consider reducing unnecessary electricity usage and switching off unused appliances.",
            "Food", "Your food-related emissions are high. Consider reducing food waste and choosing lower-emission alternatives.",
            "Shopping", "Your shopping-related emissions are high. Consider reusing products and avoiding unnecessary purchases.");

    private final EmissionLimitRepository limits;
    private final AlertRepository alerts;
    private final ActivityLogRepository logs;
    private final UserRepository users;
    private final CategoryRepository categories;
    private final GoalRepository goals;

    public EmissionAlertGenerationServiceImpl(EmissionLimitRepository limits, AlertRepository alerts, ActivityLogRepository logs, UserRepository users, CategoryRepository categories, GoalRepository goals) {
        this.limits = limits; this.alerts = alerts; this.logs = logs; this.users = users; this.categories = categories; this.goals = goals;
    }

    @Override
    @Transactional
    public void checkAfterActivity(Long userId, Long categoryId, LocalDate date) {
        limits.findByCategoryCategoryIdAndActiveTrue(categoryId).ifPresent(limit -> {
            LocalDate from = LocalDate.of(date.getYear(), date.getMonth(), 1), to = from.plusMonths(1).minusDays(1);
            double total = logs.findByUserIdAndCategoryCategoryIdAndActivityDateBetween(userId, categoryId, from, to).stream().mapToDouble(ActivityLog::getTotalEmission).sum();
            if (total > limit.getMonthlyLimit() && !alerts.existsByUserIdAndCategoryCategoryIdAndAlertTypeAndMonthAndYear(userId, categoryId, AlertType.HIGH_EMISSION, date.getMonthValue(), date.getYear())) {
                String name = limit.getCategory().getCategoryName();
                alerts.save(Alert.builder().user(users.findById(userId).orElseThrow()).category(categories.findById(categoryId).orElseThrow())
                        .alertType(AlertType.HIGH_EMISSION).severity(AlertSeverity.HIGH).title("High " + name + " Emissions")
                        .message("Your " + name + " emissions have exceeded the monthly limit.")
                        .recommendation(RECS.getOrDefault(name, "Review your " + name.toLowerCase() + " activities to reduce emissions."))
                        .currentEmission(total).monthlyLimit(limit.getMonthlyLimit()).exceededAmount(total - limit.getMonthlyLimit())
                        .month(date.getMonthValue()).year(date.getYear()).build());
            }
        });
        checkMonthlyGoal(userId, date);
    }

    @Override
    @Transactional
    public void checkCurrentMonthlyGoal(Long userId) { checkMonthlyGoal(userId, LocalDate.now()); }

    private void checkMonthlyGoal(Long userId, LocalDate date) {
        goals.findByUserIdAndMonthAndYear(userId, date.getMonthValue(), date.getYear()).ifPresent(goal -> {
            LocalDate from = LocalDate.of(date.getYear(), date.getMonth(), 1), to = from.plusMonths(1).minusDays(1);
            double total = logs.findByUserIdAndDateRange(userId, from, to).stream().mapToDouble(ActivityLog::getTotalEmission).sum();
            List<Alert> monthAlerts = alerts.findByUserIdAndAlertTypeAndMonthAndYearAndCategoryIsNullOrderByCreatedAtDesc(userId, AlertType.GOAL_EXCEEDED, date.getMonthValue(), date.getYear());

            // Step 1: Find the active alert matching the current target
            Alert matchingActiveAlert = null;
            for (Alert a : monthAlerts) {
                if (!a.isResolved() && Double.compare(a.getMonthlyLimit(), goal.getTargetAmount()) == 0) {
                    matchingActiveAlert = a;
                    break;
                }
            }

            // Step 2: Resolve ALL other alerts for this month (old targets that no longer apply)
            for (Alert a : monthAlerts) {
                if (a != matchingActiveAlert) {
                    a.setResolved(true);
                    a.setRead(true);
                }
            }

            // Step 3: If emissions are within target, we're done
            if (total <= goal.getTargetAmount()) {
                if (!monthAlerts.isEmpty()) alerts.saveAll(monthAlerts);
                return;
            }

            // Step 4: Emissions exceed target — create/update active alert
            if (matchingActiveAlert == null) {
                // Only create if no unresolved alert exists for this exact target
                boolean alreadyExists = monthAlerts.stream()
                    .anyMatch(a -> !a.isResolved() && Double.compare(a.getMonthlyLimit(), goal.getTargetAmount()) == 0);
                if (!alreadyExists) {
                    matchingActiveAlert = Alert.builder()
                        .user(users.findById(userId).orElseThrow())
                        .alertType(AlertType.GOAL_EXCEEDED)
                        .severity(AlertSeverity.WARNING)
                        .title("Monthly Carbon Target Exceeded")
                        .recommendation("Review your activities across all categories to bring emissions back within your target.")
                        .month(date.getMonthValue())
                        .year(date.getYear())
                        .build();
                }
            }
            if (matchingActiveAlert != null) {
                updateCurrentGoalAlert(matchingActiveAlert, total, goal.getTargetAmount(), date);
                alerts.save(matchingActiveAlert);
            }
            // Persist all resolved old alerts
            alerts.saveAll(monthAlerts.stream().filter(a -> a.isResolved()).toList());
        });
    }

    private void updateCurrentGoalAlert(Alert alert, double total, double target, LocalDate date) {
        double exceeded = total - target;
        String monthName = date.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        alert.setCurrentEmission(total);
        alert.setMonthlyLimit(target);
        alert.setExceededAmount(exceeded);
        alert.setMessage("Your " + monthName + " emissions are " + String.format(Locale.US, "%.2f", total) + " kg CO2e, which is " + String.format(Locale.US, "%.2f", exceeded) + " kg above your target.");
        alert.setResolved(false);
    }
}