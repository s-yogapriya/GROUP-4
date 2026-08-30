package com.infosys.carbonfootprint.service.impl;

import com.infosys.carbonfootprint.dto.ActivityLogDto;
import com.infosys.carbonfootprint.entity.*;
import com.infosys.carbonfootprint.exception.ResourceNotFoundException;
import com.infosys.carbonfootprint.exception.ValidationException;
import com.infosys.carbonfootprint.repository.*;
import com.infosys.carbonfootprint.service.ActivityLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;

@Service
public class ActivityLogServiceImpl implements ActivityLogService {

    private static final Logger logger = LoggerFactory.getLogger(ActivityLogServiceImpl.class);

    @Autowired private ActivityLogRepository activityLogRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ActivityTypeRepository activityTypeRepository;
    @Autowired private EmissionFactorRepository emissionFactorRepository;
    @Autowired private com.infosys.carbonfootprint.service.EmissionAlertGenerationService emissionAlertGenerationService;

    @Override
    @Transactional
    public ActivityLogDto create(ActivityLogDto dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));
        ActivityType activityType = activityTypeRepository.findById(dto.getActivityTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("ActivityType", "id", dto.getActivityTypeId()));

        validateSelectable(category, activityType);
        validateQuantity(dto.getQuantity(), activityType);

        logger.debug("Looking up emission factor: activityTypeId={}, activityDate={}",
                activityType.getActivityTypeId(), dto.getActivityDate());

        EmissionFactor ef = emissionFactorRepository
                .findActiveFactorForDate(activityType.getActivityTypeId(), dto.getActivityDate())
                .orElseThrow(() -> new ValidationException(
                        "No active emission factor found for '" + activityType.getActivityName() +
                        "' on " + dto.getActivityDate() + ". Please ask admin to configure one."));

        double totalEmission = Math.round(dto.getQuantity() * ef.getEmissionFactor() * 10000.0) / 10000.0;

        ActivityLog log = ActivityLog.builder()
                .user(user)
                .category(category)
                .activityType(activityType)
                .quantity(dto.getQuantity())
                .unit(activityType.getUnit())
                .emissionFactor(ef.getEmissionFactor())
                .totalEmission(totalEmission)
                .emissionKg(totalEmission)
                .activityDate(dto.getActivityDate())
                .notes(dto.getNotes())
                .build();

        ActivityLog saved = activityLogRepository.save(log);
        emissionAlertGenerationService.checkAfterActivity(userId, category.getCategoryId(), dto.getActivityDate());
        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLogDto> getByUser(Long userId) {
        return activityLogRepository.findByUserIdOrderByActivityDateDescCreatedAtDesc(userId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLogDto> getAllForAdmin() {
        return activityLogRepository.findAllByOrderByActivityDateDescCreatedAtDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityLogDto> getPageByUser(Long userId, Pageable pageable) {
        return activityLogRepository.findByUserId(userId, pageable).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityLogDto> getPageForAdmin(Pageable pageable) {
        return activityLogRepository.findAll(pageable).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ActivityLogDto getById(Long logId, Long userId) {
        return toDto(findOrThrow(logId, userId));
    }

    @Override
    @Transactional
    public ActivityLogDto update(Long logId, ActivityLogDto dto, Long userId) {
        ActivityLog log = findOrThrow(logId, userId);

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));
        ActivityType activityType = activityTypeRepository.findById(dto.getActivityTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("ActivityType", "id", dto.getActivityTypeId()));

        validateSelectable(category, activityType);
        validateQuantity(dto.getQuantity(), activityType);

        EmissionFactor ef = emissionFactorRepository
                .findActiveFactorForDate(activityType.getActivityTypeId(), dto.getActivityDate())
                .orElseThrow(() -> new ValidationException(
                        "No active emission factor found for '" + activityType.getActivityName() +
                        "' on " + dto.getActivityDate()));

        double totalEmission = Math.round(dto.getQuantity() * ef.getEmissionFactor() * 10000.0) / 10000.0;

        log.setCategory(category);
        log.setActivityType(activityType);
        log.setQuantity(dto.getQuantity());
        log.setUnit(activityType.getUnit());
        log.setEmissionFactor(ef.getEmissionFactor());
        log.setTotalEmission(totalEmission);
        log.setEmissionKg(totalEmission);
        log.setActivityDate(dto.getActivityDate());
        log.setNotes(dto.getNotes());

        ActivityLog saved = activityLogRepository.save(log);
        emissionAlertGenerationService.checkAfterActivity(userId, category.getCategoryId(), dto.getActivityDate());
        return toDto(saved);
    }

    @Override
    @Transactional
    public void delete(Long logId, Long userId) {
        activityLogRepository.delete(findOrThrow(logId, userId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLogDto> filter(Long userId, Long categoryId, Long activityTypeId,
                                        LocalDate fromDate, LocalDate toDate) {
        return activityLogRepository.findFiltered(userId, categoryId, activityTypeId, fromDate, toDate)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    private void validateSelectable(Category category, ActivityType activityType) {
        if (category.getStatus() != CategoryStatus.ACTIVE)
            throw new ValidationException("Selected category is not active");
        if (activityType.getStatus() != CategoryStatus.ACTIVE)
            throw new ValidationException("Selected activity type is not active");
        if (!activityType.getCategory().getCategoryId().equals(category.getCategoryId()))
            throw new ValidationException("Activity type '" + activityType.getActivityName() +
                    "' does not belong to category '" + category.getCategoryName() + "'");
    }

    private void validateQuantity(Double quantity, ActivityType at) {
        if (quantity <= 0) throw new ValidationException("Quantity must be greater than 0");
        if (at.getMinQuantity() != null && quantity < at.getMinQuantity())
            throw new ValidationException("Quantity cannot be less than minimum: " + at.getMinQuantity());
        if (at.getMaxQuantity() != null && quantity > at.getMaxQuantity())
            throw new ValidationException("Quantity cannot exceed maximum: " + at.getMaxQuantity());
    }

    private ActivityLog findOrThrow(Long logId, Long userId) {
        return activityLogRepository.findByActivityLogIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Activity log not found or access denied"));
    }

    private ActivityLogDto toDto(ActivityLog log) {
        return ActivityLogDto.builder()
                .activityLogId(log.getActivityLogId())
                .userId(log.getUser().getId())
                .userName(log.getUser().getFirstName() + " " + log.getUser().getLastName())
                .userEmail(log.getUser().getEmail())
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
}
