package com.infosys.carbonfootprint.controller;

import com.infosys.carbonfootprint.dto.ActivityTypeDto;
import com.infosys.carbonfootprint.response.ApiResponse;
import com.infosys.carbonfootprint.security.UserDetailsImpl;
import com.infosys.carbonfootprint.service.ActivityTypeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/v1/admin/activity-types")
@PreAuthorize("hasRole('ADMIN')")
public class ActivityTypeController {

    @Autowired private ActivityTypeService activityTypeService;

    @PostMapping
    public ResponseEntity<ApiResponse<ActivityTypeDto>> create(
            @Valid @RequestBody ActivityTypeDto dto,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return new ResponseEntity<>(ApiResponse.success("Activity type created successfully",
                activityTypeService.create(dto, user.getEmail())), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityTypeDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Activity types fetched", activityTypeService.getAll()));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ActivityTypeDto>>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success("Activity types fetched",
                activityTypeService.getByCategory(categoryId)));
    }

    @GetMapping("/category/{categoryId}/active")
    public ResponseEntity<ApiResponse<List<ActivityTypeDto>>> getActiveByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success("Active activity types fetched",
                activityTypeService.getActiveByCategoryId(categoryId)));
    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ActivityTypeDto>>> getPage(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="5") int size) {
        int safeSize = List.of(5,10,15,20,50).contains(size) ? size : 5;
        Pageable pageable = PageRequest.of(Math.max(0,page), safeSize, Sort.by("category.categoryCode").ascending()
                .and(Sort.by("category.categoryName").ascending())
                .and(Sort.by("activityName").ascending()));
        return ResponseEntity.ok(ApiResponse.success("Activity types page fetched", activityTypeService.getPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityTypeDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Activity type fetched", activityTypeService.getById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityTypeDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody ActivityTypeDto dto,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.success("Activity type updated successfully",
                activityTypeService.update(id, dto, user.getEmail())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        activityTypeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Activity type deleted successfully"));
    }
}
