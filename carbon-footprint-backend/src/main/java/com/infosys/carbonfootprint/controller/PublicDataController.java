package com.infosys.carbonfootprint.controller;

import com.infosys.carbonfootprint.dto.ActivityTypeDto;
import com.infosys.carbonfootprint.dto.CategoryDto;
import com.infosys.carbonfootprint.dto.EmissionFactorDto;
import com.infosys.carbonfootprint.response.ApiResponse;
import com.infosys.carbonfootprint.service.ActivityTypeService;
import com.infosys.carbonfootprint.service.CategoryService;
import com.infosys.carbonfootprint.service.EmissionFactorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Endpoints accessible by authenticated users (USER or ADMIN) for populating
 * the Log Daily Activity form dropdowns and emission factor preview.
 */
@RestController
@RequestMapping("/api/v1/user/data")
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class PublicDataController {

    @Autowired private CategoryService categoryService;
    @Autowired private ActivityTypeService activityTypeService;
    @Autowired private EmissionFactorService emissionFactorService;

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getActiveCategories() {
        return ResponseEntity.ok(ApiResponse.success("Active categories fetched",
                categoryService.getActiveCategories()));
    }

    @GetMapping("/activity-types/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ActivityTypeDto>>> getActiveTypesByCategory(
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(ApiResponse.success("Active activity types fetched",
                activityTypeService.getActiveByCategoryId(categoryId)));
    }

    @GetMapping("/activity-types")
    public ResponseEntity<ApiResponse<List<ActivityTypeDto>>> getAllActiveTypes() {
        List<ActivityTypeDto> types = categoryService.getActiveCategories().stream()
                .flatMap(category -> activityTypeService.getActiveByCategoryId(category.getCategoryId()).stream())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Active activity types fetched", types));
    }

    @GetMapping("/emission-factor/{activityTypeId}")
    public ResponseEntity<ApiResponse<EmissionFactorDto>> getActiveEmissionFactor(
            @PathVariable Long activityTypeId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate activityDate) {
        EmissionFactorDto ef = emissionFactorService.getActiveFactorForActivityType(
                activityTypeId, activityDate != null ? activityDate : LocalDate.now());
        if (ef == null) {
            return ResponseEntity.ok(ApiResponse.success("No active emission factor found", null));
        }
        return ResponseEntity.ok(ApiResponse.success("Active emission factor fetched", ef));
    }
}
