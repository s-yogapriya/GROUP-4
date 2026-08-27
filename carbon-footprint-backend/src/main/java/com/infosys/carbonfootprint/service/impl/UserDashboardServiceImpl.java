package com.infosys.carbonfootprint.service.impl;

import com.infosys.carbonfootprint.dto.UserDashboardSummaryDto;
import com.infosys.carbonfootprint.entity.EmissionLimit;
import com.infosys.carbonfootprint.entity.Goal;
import com.infosys.carbonfootprint.repository.ActivityLogRepository;
import com.infosys.carbonfootprint.repository.EmissionLimitRepository;
import com.infosys.carbonfootprint.repository.GoalRepository;
import com.infosys.carbonfootprint.service.UserDashboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
public class UserDashboardServiceImpl implements UserDashboardService {

    private final ActivityLogRepository activityLogRepo;
    private final GoalRepository goalRepo;
    private final EmissionLimitRepository emissionLimitRepo;

    public UserDashboardServiceImpl(ActivityLogRepository activityLogRepo,
                                    GoalRepository goalRepo,
                                    EmissionLimitRepository emissionLimitRepo) {
        this.activityLogRepo = activityLogRepo;
        this.goalRepo = goalRepo;
        this.emissionLimitRepo = emissionLimitRepo;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDashboardSummaryDto getSummary(Long userId) {
        return getSummary(userId, "ALL");
    }

    @Override
    @Transactional(readOnly = true)
    public UserDashboardSummaryDto getSummary(Long userId, String period) {
        if (period == null) period = "ALL";
        LocalDate today = LocalDate.now();

        LocalDate rangeStart;
        LocalDate rangeEnd;
        switch (period.toUpperCase()) {
            case "DAY":
                rangeStart = today;
                rangeEnd = today;
                break;
            case "MONTH":
                rangeStart = today.withDayOfMonth(1);
                rangeEnd = today.withDayOfMonth(today.lengthOfMonth());
                break;
            case "YEAR":
                rangeStart = today.withDayOfYear(1);
                rangeEnd = today.withDayOfYear(today.lengthOfYear());
                break;
            default: // ALL
                rangeStart = null;
                rangeEnd = null;
        }

        boolean hasActivities;
        int streak;
        int score;

        if (rangeStart == null) {
            // ALL — use original behavior
            long totalDays = activityLogRepo.countDistinctActivityDatesByUserId(userId);
            hasActivities = totalDays > 0;
            streak = hasActivities ? calculateStreakAll(userId) : 0;
            score = hasActivities ? calculateScoreAll(userId) : 0;
        } else {
            List<LocalDate> datesInRange = activityLogRepo.findByUserIdAndDateRange(userId, rangeStart, rangeEnd)
                    .stream().map(a -> a.getActivityDate()).distinct().sorted((a, b) -> b.compareTo(a)).toList();
            hasActivities = !datesInRange.isEmpty();
            streak = hasActivities ? calculateStreakInRange(datesInRange, today) : 0;
            score = hasActivities ? calculateScoreInRange(userId, rangeStart, rangeEnd, today) : 0;
        }

        String status = scoreStatus(score);

        return UserDashboardSummaryDto.builder()
                .trackingStreak(streak)
                .sustainabilityScore(score)
                .sustainabilityStatus(status)
                .hasActivities(hasActivities)
                .build();
    }

    // ── Streak (all-time) ──────────────────────────────────────────────────
    private int calculateStreakAll(Long userId) {
        List<LocalDate> dates = activityLogRepo.findDistinctActivityDatesByUserId(userId);
        if (dates.isEmpty()) return 0;

        LocalDate today = LocalDate.now();
        LocalDate mostRecent = dates.get(0);

        long gapFromToday = today.toEpochDay() - mostRecent.toEpochDay();
        if (gapFromToday > 1) return 0;

        int streak = 0;
        LocalDate expected = mostRecent;
        for (LocalDate date : dates) {
            if (date.toEpochDay() == expected.toEpochDay()) {
                streak++;
                expected = expected.minusDays(1);
            } else {
                break;
            }
        }
        return streak;
    }

    // ── Streak (within a date range) ───────────────────────────────────────
    private int calculateStreakInRange(List<LocalDate> sortedDatesDesc, LocalDate today) {
        if (sortedDatesDesc.isEmpty()) return 0;
        LocalDate mostRecent = sortedDatesDesc.get(0);
        long gapFromToday = today.toEpochDay() - mostRecent.toEpochDay();
        if (gapFromToday > 1) return 0;

        int streak = 0;
        LocalDate expected = mostRecent;
        for (LocalDate date : sortedDatesDesc) {
            if (date.toEpochDay() == expected.toEpochDay()) {
                streak++;
                expected = expected.minusDays(1);
            } else {
                break;
            }
        }
        return streak;
    }

    // ── Score (all-time) ───────────────────────────────────────────────────
    private int calculateScoreAll(Long userId) {
        LocalDate today = LocalDate.now();
        YearMonth current = YearMonth.now();
        LocalDate monthStart = current.atDay(1);
        LocalDate monthEnd = current.atEndOfMonth();

        double currentEmission = activityLogRepo.sumEmissionByUserIdAndDateRange(userId, monthStart, monthEnd);

        Optional<Goal> goalOpt = goalRepo.findByUserIdAndMonthAndYear(userId, today.getMonthValue(), today.getYear());
        if (goalOpt.isPresent()) {
            double target = goalOpt.get().getTargetAmount();
            if (target > 0) {
                double ratio = currentEmission / target;
                return (int) Math.max(0, Math.min(100, Math.round(100 - ratio * 100)));
            }
        }

        List<EmissionLimit> limits = emissionLimitRepo.findAll().stream()
                .filter(EmissionLimit::isActive).toList();
        if (!limits.isEmpty()) {
            double totalLimit = limits.stream().mapToDouble(EmissionLimit::getMonthlyLimit).sum();
            if (totalLimit > 0) {
                double ratio = currentEmission / totalLimit;
                return (int) Math.max(0, Math.min(100, Math.round(100 - ratio * 100)));
            }
        }

        return (int) Math.max(0, Math.min(100, Math.round(100 - currentEmission * 2)));
    }

    // ── Score (within a date range) ────────────────────────────────────────
    private int calculateScoreInRange(Long userId, LocalDate from, LocalDate to, LocalDate today) {
        double periodEmission = activityLogRepo.sumEmissionByUserIdAndDateRange(userId, from, to);

        Optional<Goal> goalOpt = goalRepo.findByUserIdAndMonthAndYear(userId, today.getMonthValue(), today.getYear());
        if (goalOpt.isPresent()) {
            double target = goalOpt.get().getTargetAmount();
            if (target > 0) {
                double ratio = periodEmission / target;
                return (int) Math.max(0, Math.min(100, Math.round(100 - ratio * 100)));
            }
        }

        List<EmissionLimit> limits = emissionLimitRepo.findAll().stream()
                .filter(EmissionLimit::isActive).toList();
        if (!limits.isEmpty()) {
            double totalLimit = limits.stream().mapToDouble(EmissionLimit::getMonthlyLimit).sum();
            if (totalLimit > 0) {
                double ratio = periodEmission / totalLimit;
                return (int) Math.max(0, Math.min(100, Math.round(100 - ratio * 100)));
            }
        }

        return (int) Math.max(0, Math.min(100, Math.round(100 - periodEmission * 2)));
    }

    private String scoreStatus(int score) {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Needs Improvement";
        return "High Emissions";
    }
}
