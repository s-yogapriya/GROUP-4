package com.infosys.carbonfootprint.dto;

import com.infosys.carbonfootprint.entity.CategoryStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityTypeResponseDto {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryCode;
    private String activityCode;
    private String activityName;
    private String description;
    private String unit;
    private Double minQuantity;
    private Double maxQuantity;
    private Double defaultQuantity;
    private Integer displayOrder;
    private String icon;
    private CategoryStatus status;
    private String remarks;
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;
}
