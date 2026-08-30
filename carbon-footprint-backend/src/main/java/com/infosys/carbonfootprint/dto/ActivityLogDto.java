package com.infosys.carbonfootprint.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActivityLogDto {
    private Long activityLogId;

    // Populated for the admin-wide activity log view.
    private Long userId;
    private String userName;
    private String userEmail;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private String categoryName;

    @NotNull(message = "Activity type is required")
    private Long activityTypeId;

    private String activityTypeName;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be greater than 0")
    private Double quantity;

    private String unit;

    // Read-only — set by backend
    private Double emissionFactor;
    private Double totalEmission;

    @NotNull(message = "Activity date is required")
    private LocalDate activityDate;

    @Size(max = 500)
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
