package com.infosys.carbonfootprint.controller;

import com.infosys.carbonfootprint.entity.ActivityType;
import com.infosys.carbonfootprint.entity.CategoryStatus;
import com.infosys.carbonfootprint.entity.EmissionFactor;
import com.infosys.carbonfootprint.repository.ActivityTypeRepository;
import com.infosys.carbonfootprint.repository.EmissionFactorRepository;
import com.infosys.carbonfootprint.response.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/diagnostic")
@PreAuthorize("hasRole('ADMIN')")
public class DiagnosticController {

    private final EmissionFactorRepository efRepo;
    private final ActivityTypeRepository atRepo;

    public DiagnosticController(EmissionFactorRepository efRepo, ActivityTypeRepository atRepo) {
        this.efRepo = efRepo;
        this.atRepo = atRepo;
    }

    @GetMapping("/emission-factors")
    public ApiResponse<Map<String, Object>> diagnose() {
        LocalDate today = LocalDate.now();

        List<Map<String, Object>> factors = efRepo.findAllByOrderByCreatedAtDesc().stream().map(ef -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("emissionFactorId", ef.getEmissionFactorId());
            row.put("efActivityTypeId", ef.getActivityType().getActivityTypeId());
            row.put("efActivityTypeName", ef.getActivityType().getActivityName());
            row.put("efCategoryId", ef.getActivityType().getCategory().getCategoryId());
            row.put("efCategoryName", ef.getActivityType().getCategory().getCategoryName());
            row.put("emissionFactor", ef.getEmissionFactor());
            row.put("unit", ef.getUnit());
            row.put("status", ef.getStatus());
            row.put("effectiveFrom", ef.getEffectiveFrom());
            row.put("effectiveTo", ef.getEffectiveTo());
            row.put("activeForToday",
                    ef.getStatus() == CategoryStatus.ACTIVE
                    && !ef.getEffectiveFrom().isAfter(today)
                    && (ef.getEffectiveTo() == null || !ef.getEffectiveTo().isBefore(today)));
            return row;
        }).toList();

        List<Map<String, Object>> types = atRepo.findAllByOrderByDisplayOrderAscActivityNameAsc().stream().map(at -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("activityTypeId", at.getActivityTypeId());
            row.put("activityName", at.getActivityName());
            row.put("categoryId", at.getCategory().getCategoryId());
            row.put("categoryName", at.getCategory().getCategoryName());
            row.put("status", at.getStatus());
            row.put("hasActiveFactorForToday",
                    efRepo.findActiveFactorForDate(at.getActivityTypeId(), today).isPresent());
            return row;
        }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("today", today);
        result.put("emissionFactors", factors);
        result.put("activityTypes", types);
        return ApiResponse.success("Diagnostic data", result);
    }
}
