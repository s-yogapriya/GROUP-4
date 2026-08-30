package com.infosys.carbonfootprint.service;
public interface EmissionAlertGenerationService {
    void checkAfterActivity(Long userId, Long categoryId, java.time.LocalDate activityDate);
    void checkCurrentMonthlyGoal(Long userId);
}