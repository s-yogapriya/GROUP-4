package com.infosys.carbonfootprint.service;

import com.infosys.carbonfootprint.dto.EmissionFactorDto;
import com.infosys.carbonfootprint.entity.CategoryStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmissionFactorService {
    EmissionFactorDto create(EmissionFactorDto dto, String createdBy);
    List<EmissionFactorDto> getAll();
    Page<EmissionFactorDto> getPage(Pageable pageable);
    Page<EmissionFactorDto> getFilteredPage(Long activityTypeId, Long categoryId, CategoryStatus status, String search, Pageable pageable);
    List<EmissionFactorDto> getByActivityType(Long activityTypeId);
    EmissionFactorDto getById(Long id);
    EmissionFactorDto update(Long id, EmissionFactorDto dto, String updatedBy);
    void delete(Long id);
    EmissionFactorDto getActiveFactorForActivityType(Long activityTypeId);
    EmissionFactorDto getActiveFactorForActivityType(Long activityTypeId, LocalDate date);
}
