package com.infosys.carbonfootprint.dto;

import com.infosys.carbonfootprint.entity.CategoryStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmissionFactorDto {
    private Long emissionFactorId;

    @NotNull(message = "Activity type is required")
    private Long activityTypeId;

    private String activityTypeName;
    private String categoryName;

    @NotNull(message = "Emission factor is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Emission factor must be greater than 0")
    private Double emissionFactor;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotBlank(message = "Source name is required")
    @Size(max = 100)
    private String sourceName;

    @Size(max = 50)
    private String sourceVersion;

    @NotNull(message = "Effective from date is required")
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    @NotNull(message = "Status is required")
    private CategoryStatus status;

    private String remarks;
    private String createdBy;
    private String updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
