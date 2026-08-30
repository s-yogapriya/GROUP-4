package com.infosys.carbonfootprint.service.impl;

import com.infosys.carbonfootprint.dto.EmissionFactorDto;
import com.infosys.carbonfootprint.entity.ActivityType;
import com.infosys.carbonfootprint.entity.EmissionFactor;
import com.infosys.carbonfootprint.exception.ResourceNotFoundException;
import com.infosys.carbonfootprint.exception.ValidationException;
import com.infosys.carbonfootprint.repository.ActivityTypeRepository;
import com.infosys.carbonfootprint.repository.EmissionFactorRepository;
import com.infosys.carbonfootprint.service.EmissionFactorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;

@Service
public class EmissionFactorServiceImpl implements EmissionFactorService {

    @Autowired private EmissionFactorRepository emissionFactorRepository;
    @Autowired private ActivityTypeRepository activityTypeRepository;

    @Override
    @Transactional
    public EmissionFactorDto create(EmissionFactorDto dto, String createdBy) {
        ActivityType at = activityTypeRepository.findById(dto.getActivityTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("ActivityType", "id", dto.getActivityTypeId()));

        validateDates(dto);

        EmissionFactor ef = EmissionFactor.builder()
                .activityType(at)
                .emissionFactor(dto.getEmissionFactor())
                .unit(dto.getUnit())
                .sourceName(dto.getSourceName())
                .sourceVersion(dto.getSourceVersion())
                .effectiveFrom(dto.getEffectiveFrom())
                .effectiveTo(dto.getEffectiveTo())
                .status(dto.getStatus())
                .remarks(dto.getRemarks())
                .createdBy(createdBy)
                .build();

        return toDto(emissionFactorRepository.save(ef));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmissionFactorDto> getAll() {
        return emissionFactorRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmissionFactorDto> getPage(Pageable pageable) {
        return emissionFactorRepository.findAll(pageable).map(this::toDto);
    }


    @Override
    @Transactional(readOnly = true)
    public Page<EmissionFactorDto> getFilteredPage(Long activityTypeId, Long categoryId, com.infosys.carbonfootprint.entity.CategoryStatus status, String search, Pageable pageable) {
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        return emissionFactorRepository.searchPage(activityTypeId, categoryId, status, normalizedSearch, pageable)
                .map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmissionFactorDto> getByActivityType(Long activityTypeId) {
        return emissionFactorRepository.findByActivityTypeActivityTypeIdOrderByEffectiveFromDesc(activityTypeId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmissionFactorDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Override
    @Transactional
    public EmissionFactorDto update(Long id, EmissionFactorDto dto, String updatedBy) {
        EmissionFactor ef = findOrThrow(id);
        ActivityType at = activityTypeRepository.findById(dto.getActivityTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("ActivityType", "id", dto.getActivityTypeId()));

        validateDates(dto);

        ef.setActivityType(at);
        ef.setEmissionFactor(dto.getEmissionFactor());
        ef.setUnit(dto.getUnit());
        ef.setSourceName(dto.getSourceName());
        ef.setSourceVersion(dto.getSourceVersion());
        ef.setEffectiveFrom(dto.getEffectiveFrom());
        ef.setEffectiveTo(dto.getEffectiveTo());
        ef.setStatus(dto.getStatus());
        ef.setRemarks(dto.getRemarks());
        ef.setUpdatedBy(updatedBy);

        return toDto(emissionFactorRepository.save(ef));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        emissionFactorRepository.delete(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public EmissionFactorDto getActiveFactorForActivityType(Long activityTypeId) {
        return getActiveFactorForActivityType(activityTypeId, java.time.LocalDate.now());
    }

    @Override
    @Transactional(readOnly = true)
    public EmissionFactorDto getActiveFactorForActivityType(Long activityTypeId, java.time.LocalDate date) {
        return emissionFactorRepository
                .findActiveFactorForDate(activityTypeId, date)
                .map(this::toDto)
                .orElse(null);
    }

    private void validateDates(EmissionFactorDto dto) {
        if (dto.getEffectiveTo() != null && dto.getEffectiveTo().isBefore(dto.getEffectiveFrom()))
            throw new ValidationException("Effective To date cannot be before Effective From date");
    }

    private EmissionFactor findOrThrow(Long id) {
        return emissionFactorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmissionFactor", "id", id));
    }

    EmissionFactorDto toDto(EmissionFactor ef) {
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
}
