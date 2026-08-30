package com.infosys.carbonfootprint.mapper;

import com.infosys.carbonfootprint.dto.CategoryRequestDto;
import com.infosys.carbonfootprint.dto.CategoryResponseDto;
import com.infosys.carbonfootprint.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public Category toEntity(CategoryRequestDto dto) {
        if (dto == null) return null;
        return Category.builder()
                .categoryCode(dto.getCategoryCode())
                .categoryName(dto.getCategoryName() != null ? dto.getCategoryName().trim() : null)
                .description(dto.getDescription() != null ? dto.getDescription().trim() : null)
                .icon(dto.getIcon())
                .colorCode(dto.getColorCode())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .status(dto.getStatus())
                .remarks(dto.getRemarks() != null ? dto.getRemarks().trim() : null)
                .build();
    }

    public CategoryResponseDto toDto(Category entity) {
        if (entity == null) return null;
        return CategoryResponseDto.builder()
                .id(entity.getCategoryId())
                .categoryCode(entity.getCategoryCode())
                .categoryName(entity.getCategoryName())
                .description(entity.getDescription())
                .icon(entity.getIcon())
                .colorCode(entity.getColorCode())
                .displayOrder(entity.getDisplayOrder())
                .status(entity.getStatus())
                .remarks(entity.getRemarks())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedBy(entity.getUpdatedBy())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
