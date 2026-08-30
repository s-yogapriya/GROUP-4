package com.infosys.carbonfootprint.mapper;

import com.infosys.carbonfootprint.dto.*;
import com.infosys.carbonfootprint.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CarbonFootprintMapper {

    public CategoryDto toCategoryDto(Category c) {
        return CategoryDto.builder()
                .categoryId(c.getCategoryId())
                .categoryCode(c.getCategoryCode())
                .categoryName(c.getCategoryName())
                .description(c.getDescription())
                .icon(c.getIcon())
                .colorCode(c.getColorCode())
                .displayOrder(c.getDisplayOrder())
                .status(c.getStatus())
                .remarks(c.getRemarks())
                .createdBy(c.getCreatedBy())
                .updatedBy(c.getUpdatedBy())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    public ActivityTypeDto toActivityTypeDto(ActivityType at) {
        return ActivityTypeDto.builder()
                .activityTypeId(at.getActivityTypeId())
                .categoryId(at.getCategory().getCategoryId())
                .categoryName(at.getCategory().getCategoryName())
                .activityCode(at.getActivityCode())
                .activityName(at.getActivityName())
                .description(at.getDescription())
                .unit(at.getUnit())
                .minQuantity(at.getMinQuantity())
                .maxQuantity(at.getMaxQuantity())
                .defaultQuantity(at.getDefaultQuantity())
                .displayOrder(at.getDisplayOrder())
                .icon(at.getIcon())
                .status(at.getStatus())
                .remarks(at.getRemarks())
                .createdBy(at.getCreatedBy())
                .updatedBy(at.getUpdatedBy())
                .createdAt(at.getCreatedAt())
                .updatedAt(at.getUpdatedAt())
                .build();
    }

    public EmissionFactorDto toEmissionFactorDto(EmissionFactor ef) {
        return EmissionFactorDto.builder()
                .emissionFactorId(ef.getEmissionFactorId())
                .activityTypeId(ef.getActivityType().getActivityTypeId())
                .activityTypeName(ef.getActivityType().getActivityName())
                .categoryName(ef.getActivityType().getCategory().getCategoryName())
                .emissionFactor(ef.getEmissionFactor())
                .unit(ef.getUnit())
                .sourceName(ef.getSourceName())
                .sourceVersion(ef.getSourceVersion())
                .effectiveFrom(ef.getEffectiveFrom())
                .effectiveTo(ef.getEffectiveTo())
                .status(ef.getStatus())
                .remarks(ef.getRemarks())
                .createdBy(ef.getCreatedBy())
                .updatedBy(ef.getUpdatedBy())
                .createdAt(ef.getCreatedAt())
                .updatedAt(ef.getUpdatedAt())
                .build();
    }

    public ActivityLogDto toActivityLogDto(ActivityLog log) {
        return ActivityLogDto.builder()
                .activityLogId(log.getActivityLogId())
                .categoryId(log.getCategory().getCategoryId())
                .categoryName(log.getCategory().getCategoryName())
                .activityTypeId(log.getActivityType().getActivityTypeId())
                .activityTypeName(log.getActivityType().getActivityName())
                .quantity(log.getQuantity())
                .unit(log.getUnit())
                .emissionFactor(log.getEmissionFactor())
                .totalEmission(log.getTotalEmission())
                .activityDate(log.getActivityDate())
                .notes(log.getNotes())
                .createdAt(log.getCreatedAt())
                .updatedAt(log.getUpdatedAt())
                .build();
    }

    public Category toCategoryEntity(CategoryDto dto) {
        return Category.builder()
                .categoryCode(dto.getCategoryCode())
                .categoryName(dto.getCategoryName())
                .description(dto.getDescription())
                .icon(dto.getIcon())
                .colorCode(dto.getColorCode())
                .displayOrder(dto.getDisplayOrder())
                .status(dto.getStatus())
                .remarks(dto.getRemarks())
                .build();
    }

    public ActivityType toActivityTypeEntity(ActivityTypeDto dto) {
        return ActivityType.builder()
                .activityCode(dto.getActivityCode())
                .activityName(dto.getActivityName())
                .description(dto.getDescription())
                .unit(dto.getUnit())
                .minQuantity(dto.getMinQuantity())
                .maxQuantity(dto.getMaxQuantity())
                .defaultQuantity(dto.getDefaultQuantity())
                .displayOrder(dto.getDisplayOrder())
                .icon(dto.getIcon())
                .status(dto.getStatus())
                .remarks(dto.getRemarks())
                .build();
    }

    public EmissionFactor toEmissionFactorEntity(EmissionFactorDto dto) {
        return EmissionFactor.builder()
                .emissionFactor(dto.getEmissionFactor())
                .unit(dto.getUnit())
                .sourceName(dto.getSourceName())
                .sourceVersion(dto.getSourceVersion())
                .effectiveFrom(dto.getEffectiveFrom())
                .effectiveTo(dto.getEffectiveTo())
                .status(dto.getStatus())
                .remarks(dto.getRemarks())
                .build();
    }

    public ActivityLog toActivityLogEntity(ActivityLogDto dto) {
        return ActivityLog.builder()
                .quantity(dto.getQuantity())
                .unit(dto.getUnit())
                .emissionFactor(dto.getEmissionFactor())
                .totalEmission(dto.getTotalEmission())
                .activityDate(dto.getActivityDate())
                .notes(dto.getNotes())
                .build();
    }
}
