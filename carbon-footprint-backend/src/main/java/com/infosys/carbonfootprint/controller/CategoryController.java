package com.infosys.carbonfootprint.controller;

import com.infosys.carbonfootprint.dto.CategoryDto;
import com.infosys.carbonfootprint.entity.CategoryStatus;
import com.infosys.carbonfootprint.response.ApiResponse;
import com.infosys.carbonfootprint.security.UserDetailsImpl;
import com.infosys.carbonfootprint.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
public class CategoryController {

    @Autowired private CategoryService categoryService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CategoryDto>> create(
            @RequestParam("categoryCode") String categoryCode,
            @RequestParam("categoryName") String categoryName,
            @RequestParam("description") String description,
            @RequestParam(value = "icon", required = false) String icon,
            @RequestParam(value = "colorCode", required = false) String colorCode,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "status", required = false, defaultValue = "ACTIVE") String status,
            @RequestParam(value = "remarks", required = false) String remarks,
            @RequestParam(value = "monthlyLimit", required = false) Double monthlyLimit,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserDetailsImpl user) {
        CategoryDto dto = buildDto(categoryCode, categoryName, description, icon, colorCode, displayOrder, status, remarks, monthlyLimit);
        return new ResponseEntity<>(ApiResponse.success("Category created successfully",
                categoryService.create(dto, user.getEmail(), image)), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Categories fetched", categoryService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Category fetched", categoryService.getById(id)));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CategoryDto>> update(
            @PathVariable Long id,
            @RequestParam("categoryCode") String categoryCode,
            @RequestParam("categoryName") String categoryName,
            @RequestParam("description") String description,
            @RequestParam(value = "icon", required = false) String icon,
            @RequestParam(value = "colorCode", required = false) String colorCode,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "status", required = false, defaultValue = "ACTIVE") String status,
            @RequestParam(value = "remarks", required = false) String remarks,
            @RequestParam(value = "monthlyLimit", required = false) Double monthlyLimit,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserDetailsImpl user) {
        CategoryDto dto = buildDto(categoryCode, categoryName, description, icon, colorCode, displayOrder, status, remarks, monthlyLimit);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully",
                categoryService.update(id, dto, user.getEmail(), image)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully"));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<CategoryDto>> activate(
            @PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.success("Category activated",
                categoryService.activate(id, user.getEmail())));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<CategoryDto>> deactivate(
            @PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.success("Category deactivated",
                categoryService.deactivate(id, user.getEmail())));
    }

    private CategoryDto buildDto(String categoryCode, String categoryName, String description,
            String icon, String colorCode, Integer displayOrder, String status, String remarks, Double monthlyLimit) {
        CategoryDto dto = new CategoryDto();
        dto.setCategoryCode(categoryCode);
        dto.setCategoryName(categoryName);
        dto.setDescription(description);
        dto.setIcon(icon);
        dto.setColorCode(colorCode);
        dto.setDisplayOrder(displayOrder);
        dto.setRemarks(remarks);
        dto.setMonthlyLimit(monthlyLimit);
        try {
            dto.setStatus(CategoryStatus.valueOf(status.toUpperCase()));
        } catch (Exception e) {
            dto.setStatus(CategoryStatus.ACTIVE);
        }
        return dto;
    }
}
