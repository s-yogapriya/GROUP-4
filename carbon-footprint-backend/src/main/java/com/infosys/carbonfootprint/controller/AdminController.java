package com.infosys.carbonfootprint.controller;

import com.infosys.carbonfootprint.dto.*;
import com.infosys.carbonfootprint.entity.UserStatus;
import com.infosys.carbonfootprint.response.ApiResponse;
import com.infosys.carbonfootprint.service.AdminService;
import com.infosys.carbonfootprint.service.ActivityLogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Controller handling Admin Management REST endpoints (Dashboard stats, approval/rejection workflows, user queries).
 */
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping("/users/page")
    public ResponseEntity<ApiResponse<Page<UserSummaryDto>>> getUsersPage(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="5") int size, @RequestParam(required=false) UserStatus status) {
        int safeSize = List.of(5,10,15,20,50).contains(size) ? size : 5;
        Pageable pageable = PageRequest.of(Math.max(0,page), safeSize, Sort.by("createdAt").descending());
        Page<UserSummaryDto> result = status == null ? adminService.getAllUsersPage(pageable) : adminService.getUsersByStatusPage(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Users page fetched", result));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        DashboardStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics fetched successfully", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserSummaryDto>>> getAllUsers() {
        List<UserSummaryDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("All registered users retrieved successfully", users));
    }

    @GetMapping("/activity-logs/page")
    public ResponseEntity<ApiResponse<Page<ActivityLogDto>>> getActivityLogsPage(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="5") int size) {
        int safeSize = List.of(5,10,15,20,50).contains(size) ? size : 5;
        Pageable pageable = PageRequest.of(Math.max(0,page), safeSize, Sort.by("activityDate").descending().and(Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Activity logs page fetched", activityLogService.getPageForAdmin(pageable)));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<ApiResponse<List<ActivityLogDto>>> getAllActivityLogs() {
        return ResponseEntity.ok(ApiResponse.success("Activity logs retrieved successfully", activityLogService.getAllForAdmin()));
    }

    @GetMapping("/users/status/{status}")
    public ResponseEntity<ApiResponse<List<UserSummaryDto>>> getUsersByStatus(@PathVariable UserStatus status) {
        List<UserSummaryDto> users = adminService.getUsersByStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Users with status " + status + " retrieved successfully", users));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDetailDto>> getUserById(@PathVariable Long id) {
        UserDetailDto user = adminService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User details retrieved successfully", user));
    }

    @PostMapping("/users/{id}/approve")
    public ResponseEntity<ApiResponse<UserDetailDto>> approveUser(@PathVariable Long id) {
        UserDetailDto approvedUser = adminService.approveUser(id);
        return ResponseEntity.ok(ApiResponse.success("User APPROVED successfully! Credentials have been generated and dispatched via email.", approvedUser));
    }

    @PostMapping("/users/{id}/reject")
    public ResponseEntity<ApiResponse<UserDetailDto>> rejectUser(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) StatusUpdateRequest request) {
        String remark = (request != null && request.getRemark() != null) ? request.getRemark() : "Application rejected by Admin";
        UserDetailDto rejectedUser = adminService.rejectUser(id, remark);
        return ResponseEntity.ok(ApiResponse.success("User REJECTED successfully.", rejectedUser));
    }
}
