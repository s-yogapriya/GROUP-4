package com.infosys.carbonfootprint.controller;

import com.infosys.carbonfootprint.dto.EmissionFactorDto;
import com.infosys.carbonfootprint.entity.CategoryStatus;
import com.infosys.carbonfootprint.response.ApiResponse;
import com.infosys.carbonfootprint.security.UserDetailsImpl;
import com.infosys.carbonfootprint.service.EmissionFactorService;
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
@RequestMapping("/api/v1/admin/emission-factors")
@PreAuthorize("hasRole('ADMIN')")
public class EmissionFactorController {

    @Autowired private EmissionFactorService emissionFactorService;

    @PostMapping
    public ResponseEntity<ApiResponse<EmissionFactorDto>> create(
            @Valid @RequestBody EmissionFactorDto dto,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return new ResponseEntity<>(ApiResponse.success("Emission factor created successfully",
                emissionFactorService.create(dto, user.getEmail())), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmissionFactorDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Emission factors fetched", emissionFactorService.getAll()));
    }

    @GetMapping("/activity-type/{activityTypeId}")
    public ResponseEntity<ApiResponse<List<EmissionFactorDto>>> getByActivityType(@PathVariable Long activityTypeId) {
        return ResponseEntity.ok(ApiResponse.success("Emission factors fetched",
                emissionFactorService.getByActivityType(activityTypeId)));
    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<EmissionFactorDto>>> getPage(
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="5") int size,
            @RequestParam(required=false) Long activityTypeId,
            @RequestParam(required=false) Long categoryId,
            @RequestParam(required=false) CategoryStatus status,
            @RequestParam(required=false) String search) {
        int safeSize = List.of(5,10,15,20,50).contains(size) ? size : 5;
        Pageable pageable = PageRequest.of(Math.max(0,page), safeSize, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success("Emission factors page fetched",
                emissionFactorService.getFilteredPage(activityTypeId, categoryId, status, search, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmissionFactorDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Emission factor fetched", emissionFactorService.getById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmissionFactorDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody EmissionFactorDto dto,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.success("Emission factor updated successfully",
                emissionFactorService.update(id, dto, user.getEmail())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        emissionFactorService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Emission factor deleted successfully"));
    }
}
