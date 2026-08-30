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
public class CategoryRequestDto {

    private String categoryCode;

    @NotBlank(message = "Category Name cannot be empty")
    private String categoryName;

    @NotBlank(message = "Description is mandatory")
    private String description;

    private String icon;

    private String colorCode;

    private Integer displayOrder;

    @NotNull(message = "Status is mandatory")
    private CategoryStatus status;

    private String remarks;
}
