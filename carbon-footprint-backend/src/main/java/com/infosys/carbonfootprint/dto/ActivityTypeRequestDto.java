package com.infosys.carbonfootprint.dto;

import com.infosys.carbonfootprint.entity.CategoryStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityTypeRequestDto {

    @NotNull(message = "Category is mandatory")
    private Long categoryId;

    private String activityCode;

    @NotBlank(message = "Activity Name is mandatory")
    private String activityName;

    private String description;

    @NotBlank(message = "Unit is mandatory")
    private String unit;

    private Double minQuantity;

    private Double maxQuantity;

    private Double defaultQuantity;

    private Integer displayOrder;

    private String icon;

    @NotNull(message = "Status is mandatory")
    private CategoryStatus status;

    private String remarks;
}
