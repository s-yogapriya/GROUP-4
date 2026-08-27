package com.infosys.carbonfootprint.controller;

import com.infosys.carbonfootprint.dto.AlertDto;
import com.infosys.carbonfootprint.response.ApiResponse;
import com.infosys.carbonfootprint.security.UserDetailsImpl;
import com.infosys.carbonfootprint.service.AlertService;
import com.infosys.carbonfootprint.service.EmissionAlertGenerationService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.*;

@RestController
@RequestMapping("/api/v1/user/alerts")
@PreAuthorize("hasRole('USER')")
public class AlertController {
    private final AlertService service;
    private final EmissionAlertGenerationService alertGenerationService;
    public AlertController(AlertService service, EmissionAlertGenerationService alertGenerationService) { this.service = service; this.alertGenerationService = alertGenerationService; }

    @GetMapping
    public ApiResponse<List<AlertDto>> all(@AuthenticationPrincipal UserDetailsImpl user) {
        alertGenerationService.checkCurrentMonthlyGoal(user.getId());
        return ApiResponse.success("Alerts fetched", service.getAll(user.getId()));
    }

    @GetMapping("/current-goal")
    public ApiResponse<AlertDto> currentGoal(@AuthenticationPrincipal UserDetailsImpl user) {
        alertGenerationService.checkCurrentMonthlyGoal(user.getId());
        return ApiResponse.success("Current goal alert fetched", service.getCurrentGoalAlert(user.getId()).orElse(null));
    }

    @GetMapping("/unread-count")
    public ApiResponse<Long> unread(@AuthenticationPrincipal UserDetailsImpl user) {
        alertGenerationService.checkCurrentMonthlyGoal(user.getId());
        return ApiResponse.success("Unread alerts", service.unreadCount(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ApiResponse<AlertDto> read(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl user) { return ApiResponse.success("Alert marked read", service.markRead(id, user.getId())); }
    @PutMapping("/{id}/resolve")
    public ApiResponse<AlertDto> resolve(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl user) { return ApiResponse.success("Alert resolved", service.resolveAlert(id, user.getId())); }
    @PutMapping("/read-all")
    public ApiResponse<Void> readAll(@AuthenticationPrincipal UserDetailsImpl user) { service.markAllRead(user.getId()); return ApiResponse.success("All alerts marked read"); }
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl user) { service.delete(id, user.getId()); return ApiResponse.success("Alert deleted"); }
}