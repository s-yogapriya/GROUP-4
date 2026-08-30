package com.infosys.carbonfootprint.mapper;

import com.infosys.carbonfootprint.dto.ActivityTypeRequestDto;
import com.infosys.carbonfootprint.dto.ActivityTypeResponseDto;
import com.infosys.carbonfootprint.entity.ActivityType;
import com.infosys.carbonfootprint.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class ActivityTypeMapper {

    public ActivityType toEntity(ActivityTypeRequestDto dto, Category category) {
        if (dto == null) return null;
        return ActivityType.builder()
                .category(category)
                .activityCode(dto.getActivityCode())
                .activityName(dto.getActivityName() != null ? dto.getActivityName().trim() : null)
                .description(dto.getDescription() != null ? dto.getDescription().trim() : null)
                .unit(dto.getUnit() != null ? dto.getUnit().trim() : null)
                .minQuantity(dto.getMinQuantity() != null ? dto.getMinQuantity() : 0.0)
                .maxQuantity(dto.getMaxQuantity() != null ? dto.getMaxQuantity() : 100000.0)
                .defaultQuantity(dto.getDefaultQuantity() != null ? dto.getDefaultQuantity() : 1.0)
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .icon(dto.getIcon())
                .status(dto.getStatus())
                .remarks(dto.getRemarks() != null ? dto.getRemarks().trim() : null)
                .build();
    }

    public ActivityTypeResponseDto toDto(ActivityType entity) {
        if (entity == null) return null;
        return ActivityTypeResponseDto.builder()
                .id(entity.getActivityTypeId())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getCategoryId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getCategoryName() : null)
                .categoryCode(entity.getCategory() != null ? entity.getCategory().getCategoryCode() : null)
                .activityCode(entity.getActivityCode())
                .activityName(entity.getActivityName())
                .description(entity.getDescription())
                .unit(entity.getUnit())
                .minQuantity(entity.getMinQuantity())
                .maxQuantity(entity.getMaxQuantity())
                .defaultQuantity(entity.getDefaultQuantity())
                .displayOrder(entity.getDisplayOrder())
                .icon(entity.getIcon())
                .status(entity.getStatus())
                .remarks(entity.getRemarks())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedBy(entity.getUpdatedBy())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
