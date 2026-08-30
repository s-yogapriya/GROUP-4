package com.infosys.carbonfootprint.dto;

import com.infosys.carbonfootprint.entity.CategoryStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponseDto {

    private Long id;
    private String categoryCode;
    private String categoryName;
    private String description;
    private String icon;
    private String colorCode;
    private Integer displayOrder;
    private CategoryStatus status;
    private String remarks;
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;
}
