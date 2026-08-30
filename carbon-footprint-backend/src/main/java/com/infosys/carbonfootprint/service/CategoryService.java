package com.infosys.carbonfootprint.service;

import com.infosys.carbonfootprint.dto.CategoryDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryService {
    CategoryDto create(CategoryDto dto, String createdBy, MultipartFile image);
    List<CategoryDto> getAll();
    Page<CategoryDto> getPage(Pageable pageable);
    CategoryDto getById(Long id);
    CategoryDto update(Long id, CategoryDto dto, String updatedBy, MultipartFile image);
    void delete(Long id);
    CategoryDto activate(Long id, String updatedBy);
    CategoryDto deactivate(Long id, String updatedBy);
    List<CategoryDto> getActiveCategories();
}
