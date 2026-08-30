package com.infosys.carbonfootprint.service.impl;

import com.infosys.carbonfootprint.dto.ActivityTypeDto;
import com.infosys.carbonfootprint.entity.ActivityType;
import com.infosys.carbonfootprint.entity.Category;
import com.infosys.carbonfootprint.entity.CategoryStatus;
import com.infosys.carbonfootprint.exception.ResourceNotFoundException;
import com.infosys.carbonfootprint.exception.ValidationException;
import com.infosys.carbonfootprint.repository.ActivityTypeRepository;
import com.infosys.carbonfootprint.repository.CategoryRepository;
import com.infosys.carbonfootprint.service.ActivityTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;
import java.util.Locale;

@Service
public class ActivityTypeServiceImpl implements ActivityTypeService {

    @Autowired private ActivityTypeRepository activityTypeRepository;
    @Autowired private CategoryRepository categoryRepository;

    @Override
    @Transactional
    public ActivityTypeDto create(ActivityTypeDto dto, String createdBy) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));

        String activityCode = resolveActivityCode(dto.getActivityCode(), category, dto.getActivityName(), null);
        if (activityTypeRepository.existsByActivityCodeIgnoreCase(activityCode))
            throw new ValidationException("Activity code '" + activityCode + "' already exists");
        if (activityTypeRepository.existsByActivityNameIgnoreCaseAndCategoryCategoryId(dto.getActivityName(), dto.getCategoryId()))
            throw new ValidationException("Activity '" + dto.getActivityName() + "' already exists in this category");

        validateQuantities(dto);

        ActivityType at = ActivityType.builder()
                .category(category)
                .activityCode(activityCode)
                .activityName(dto.getActivityName().trim())
                .description(dto.getDescription())
                .unit(dto.getUnit())
                .minQuantity(dto.getMinQuantity())
                .maxQuantity(dto.getMaxQuantity())
                .defaultQuantity(dto.getDefaultQuantity())
                .displayOrder(dto.getDisplayOrder())
                .icon(dto.getIcon())
                .status(dto.getStatus() != null ? dto.getStatus() : CategoryStatus.ACTIVE)
                .remarks(dto.getRemarks())
                .createdBy(createdBy)
                .build();

        return toDto(activityTypeRepository.save(at));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityTypeDto> getAll() {
        return activityTypeRepository.findAllByOrderByDisplayOrderAscActivityNameAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityTypeDto> getPage(Pageable pageable) {
        return activityTypeRepository.findAll(pageable).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityTypeDto> getByCategory(Long categoryId) {
        return activityTypeRepository.findByCategoryCategoryIdOrderByDisplayOrderAscActivityNameAsc(categoryId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityTypeDto> getActiveByCategoryId(Long categoryId) {
        return activityTypeRepository.findByCategoryCategoryIdAndStatus(categoryId, CategoryStatus.ACTIVE)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ActivityTypeDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Override
    @Transactional
    public ActivityTypeDto update(Long id, ActivityTypeDto dto, String updatedBy) {
        ActivityType at = findOrThrow(id);
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));

        String activityCode = resolveActivityCode(dto.getActivityCode(), category, dto.getActivityName(), at.getActivityCode());
        if (activityTypeRepository.existsByActivityCodeIgnoreCaseAndActivityTypeIdNot(activityCode, id))
            throw new ValidationException("Activity code '" + activityCode + "' already exists");
        if (activityTypeRepository.existsByActivityNameIgnoreCaseAndCategoryCategoryIdAndActivityTypeIdNot(dto.getActivityName(), dto.getCategoryId(), id))
            throw new ValidationException("Activity '" + dto.getActivityName() + "' already exists in this category");

        validateQuantities(dto);

        at.setCategory(category);
        at.setActivityCode(activityCode);
        at.setActivityName(dto.getActivityName().trim());
        at.setDescription(dto.getDescription());
        at.setUnit(dto.getUnit());
        at.setMinQuantity(dto.getMinQuantity());
        at.setMaxQuantity(dto.getMaxQuantity());
        at.setDefaultQuantity(dto.getDefaultQuantity());
        at.setDisplayOrder(dto.getDisplayOrder());
        at.setIcon(dto.getIcon());
        at.setStatus(dto.getStatus());
        at.setRemarks(dto.getRemarks());
        at.setUpdatedBy(updatedBy);

        return toDto(activityTypeRepository.save(at));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        ActivityType at = findOrThrow(id);
        if (!at.getEmissionFactors().isEmpty())
            throw new ValidationException("Cannot delete activity type with existing emission factors.");
        activityTypeRepository.delete(at);
    }

    private void validateQuantities(ActivityTypeDto dto) {
        if (dto.getMinQuantity() != null && dto.getMaxQuantity() != null
                && dto.getMinQuantity() > dto.getMaxQuantity())
            throw new ValidationException("Min quantity cannot be greater than max quantity");
        if (dto.getDefaultQuantity() != null && dto.getMinQuantity() != null
                && dto.getDefaultQuantity() < dto.getMinQuantity())
            throw new ValidationException("Default quantity cannot be less than min quantity");
        if (dto.getDefaultQuantity() != null && dto.getMaxQuantity() != null
                && dto.getDefaultQuantity() > dto.getMaxQuantity())
            throw new ValidationException("Default quantity cannot be greater than max quantity");
    }

    private ActivityType findOrThrow(Long id) {
        return activityTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ActivityType", "id", id));
    }

    private String resolveActivityCode(String requestedCode, Category category, String activityName, String existingCode) {
        if (requestedCode != null && !requestedCode.trim().isEmpty()) return requestedCode.trim().toUpperCase(Locale.ROOT);
        if (existingCode != null && !existingCode.isBlank()) return existingCode;

        String categoryPart = category.getCategoryCode().replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);
        String namePart = activityName.replaceAll("[^A-Za-z0-9]+", "_").replaceAll("^_+|_+$", "").toUpperCase(Locale.ROOT);
        String base = (categoryPart + "_" + namePart).substring(0, Math.min(20, categoryPart.length() + 1 + namePart.length()));
        String candidate = base;
        int suffix = 2;
        while (activityTypeRepository.existsByActivityCodeIgnoreCase(candidate)) {
            String tail = "_" + suffix++;
            candidate = base.substring(0, Math.min(base.length(), 20 - tail.length())) + tail;
        }
        return candidate;
    }

    ActivityTypeDto toDto(ActivityType at) {
        return ActivityTypeDto.builder()
                .activityTypeId(at.getActivityTypeId())
                .categoryId(at.getCategory().getCategoryId())
                .categoryCode(at.getCategory().getCategoryCode())
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
}
