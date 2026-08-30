package com.infosys.carbonfootprint.service.impl;

import com.infosys.carbonfootprint.entity.*;
import com.infosys.carbonfootprint.repository.*;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class EmissionAlertGenerationServiceImplTest {
    @Test
    void reevaluatesGoalAlertsWhenTheMonthlyTargetChanges() {
        EmissionLimitRepository limits = mock(EmissionLimitRepository.class);
        AlertRepository alerts = mock(AlertRepository.class);
        ActivityLogRepository logs = mock(ActivityLogRepository.class);
        UserRepository users = mock(UserRepository.class);
        CategoryRepository categories = mock(CategoryRepository.class);
        GoalRepository goals = mock(GoalRepository.class);
        EmissionAlertGenerationServiceImpl service = new EmissionAlertGenerationServiceImpl(limits, alerts, logs, users, categories, goals);

        LocalDate now = LocalDate.now();
        User user = User.builder().id(7L).build();
        Goal goal = Goal.builder().user(user).month(now.getMonthValue()).year(now.getYear()).targetAmount(2.0).build();
        ActivityLog log = ActivityLog.builder().totalEmission(5.94).activityDate(now).build();
        List<Alert> stored = new ArrayList<>();

        when(goals.findByUserIdAndMonthAndYear(eq(7L), eq(now.getMonthValue()), eq(now.getYear()))).thenAnswer(invocation -> Optional.of(goal));
        when(logs.findByUserIdAndDateRange(eq(7L), any(LocalDate.class), any(LocalDate.class))).thenReturn(List.of(log));
        when(users.findById(7L)).thenReturn(Optional.of(user));
        when(alerts.findByUserIdAndAlertTypeAndMonthAndYearAndCategoryIsNullOrderByCreatedAtDesc(7L, AlertType.GOAL_EXCEEDED, now.getMonthValue(), now.getYear())).thenAnswer(invocation -> stored);
        when(alerts.save(any(Alert.class))).thenAnswer(invocation -> {
            Alert alert = invocation.getArgument(0);
            if (!stored.contains(alert)) stored.add(alert);
            return alert;
        });
        when(alerts.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.checkCurrentMonthlyGoal(7L);
        assertEquals(1, stored.size());
        assertFalse(stored.get(0).isRead());
        assertEquals(2.0, stored.get(0).getMonthlyLimit());
        assertEquals(3.94, stored.get(0).getExceededAmount(), 0.0001);

        goal.setTargetAmount(10.0);
        service.checkCurrentMonthlyGoal(7L);
        assertEquals(0, stored.stream().filter(alert -> !alert.isRead()).count());

        goal.setTargetAmount(5.0);
        service.checkCurrentMonthlyGoal(7L);
        Alert activeAtFive = stored.stream().filter(alert -> !alert.isRead()).findFirst().orElseThrow();
        assertEquals(5.0, activeAtFive.getMonthlyLimit());
        assertEquals(0.94, activeAtFive.getExceededAmount(), 0.0001);
        assertTrue(activeAtFive.getMessage().contains("0.94 kg above"));

        goal.setTargetAmount(6.0);
        service.checkCurrentMonthlyGoal(7L);
        assertEquals(0, stored.stream().filter(alert -> !alert.isRead()).count());

        goal.setTargetAmount(5.0);
        service.checkCurrentMonthlyGoal(7L);
        assertEquals(1, stored.stream().filter(alert -> !alert.isRead()).count());
        assertEquals(5.0, stored.stream().filter(alert -> !alert.isRead()).findFirst().orElseThrow().getMonthlyLimit());
    }
}