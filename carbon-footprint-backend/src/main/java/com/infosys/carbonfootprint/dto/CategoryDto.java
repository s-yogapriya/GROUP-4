package com.infosys.carbonfootprint.dto;

import com.infosys.carbonfootprint.entity.CategoryStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoryDto {
    private Long categoryId;

    @NotBlank(message = "Category code is required")
    @Pattern(regexp = "^[A-Z0-9_]{2,20}$", message = "Category code must be 2-20 uppercase letters, digits or underscores")
    private String categoryCode;

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be 2-100 characters")
    private String categoryName;

    @NotBlank(message = "Description is required")
    @Size(max = 500)
    private String description;

    private String icon;
    private String image;
    private String colorCode;
    private Integer displayOrder;

    @NotNull(message = "Status is required")
    private CategoryStatus status;

    private String remarks;

    @DecimalMin(value = "0.01", message = "Monthly emission limit must be a positive number")
    private Double monthlyLimit;

    private String createdBy;
    private String updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
