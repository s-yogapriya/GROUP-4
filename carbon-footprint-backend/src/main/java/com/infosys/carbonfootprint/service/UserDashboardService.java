package com.infosys.carbonfootprint.service;
import com.infosys.carbonfootprint.dto.UserDashboardSummaryDto;

public interface UserDashboardService {
    UserDashboardSummaryDto getSummary(Long userId);
    UserDashboardSummaryDto getSummary(Long userId, String period);
}
