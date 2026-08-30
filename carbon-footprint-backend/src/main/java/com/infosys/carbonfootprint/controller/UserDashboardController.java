package com.infosys.carbonfootprint.controller;

import com.infosys.carbonfootprint.dto.UserDashboardSummaryDto;
import com.infosys.carbonfootprint.response.ApiResponse;
import com.infosys.carbonfootprint.security.UserDetailsImpl;
import com.infosys.carbonfootprint.service.UserDashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user/dashboard")
@PreAuthorize("hasAnyRole('USER','ADMIN')")
public class UserDashboardController {

    private final UserDashboardService service;

    public UserDashboardController(UserDashboardService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    public ApiResponse<UserDashboardSummaryDto> summary(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestParam(required = false, defaultValue = "ALL") String period) {
        return ApiResponse.success("Dashboard summary fetched", service.getSummary(user.getId(), period));
    }
}
