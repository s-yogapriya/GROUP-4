package com.infosys.carbonfootprint.service.impl;

import com.infosys.carbonfootprint.dto.CategoryDto;
import com.infosys.carbonfootprint.entity.Category;
import com.infosys.carbonfootprint.entity.CategoryStatus;
import com.infosys.carbonfootprint.entity.EmissionLimit;
import com.infosys.carbonfootprint.exception.ResourceNotFoundException;
import com.infosys.carbonfootprint.exception.ValidationException;
import com.infosys.carbonfootprint.repository.CategoryRepository;
import com.infosys.carbonfootprint.repository.EmissionLimitRepository;
import com.infosys.carbonfootprint.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private EmissionLimitRepository emissionLimitRepository;

    @Value("${app.upload.category-images:uploads/categories}")
    private String categoryUploadDir;

    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    @Override
    @Transactional
    public CategoryDto create(CategoryDto dto, String createdBy, MultipartFile image) {
        if (categoryRepository.existsByCategoryNameIgnoreCase(dto.getCategoryName()))
            throw new ValidationException("Category name '" + dto.getCategoryName() + "' already exists");
        if (categoryRepository.existsByCategoryCodeIgnoreCase(dto.getCategoryCode()))
            throw new ValidationException("Category code '" + dto.getCategoryCode() + "' already exists");

        Category category = Category.builder()
                .categoryCode(dto.getCategoryCode().toUpperCase())
                .categoryName(dto.getCategoryName())
                .description(dto.getDescription())
                .icon(dto.getIcon())
                .colorCode(dto.getColorCode())
                .displayOrder(dto.getDisplayOrder())
                .status(dto.getStatus() != null ? dto.getStatus() : CategoryStatus.ACTIVE)
                .remarks(dto.getRemarks())
                .createdBy(createdBy)
                .build();

        Category saved = categoryRepository.save(category);

        if (image != null && !image.isEmpty()) {
            saved.setImage(storeImage(image, null));
            categoryRepository.save(saved);
        }

        if (dto.getMonthlyLimit() != null && dto.getMonthlyLimit() > 0) {
            EmissionLimit limit = EmissionLimit.builder()
                    .category(saved)
                    .monthlyLimit(dto.getMonthlyLimit())
                    .unit("kg CO2e")
                    .active(true)
                    .build();
            emissionLimitRepository.save(limit);
        }

        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> getAll() {
        return categoryRepository.findAllByOrderByDisplayOrderAscCategoryNameAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Override
    @Transactional
    public CategoryDto update(Long id, CategoryDto dto, String updatedBy, MultipartFile image) {
        Category category = findOrThrow(id);

        if (categoryRepository.existsByCategoryNameIgnoreCaseAndCategoryIdNot(dto.getCategoryName(), id))
            throw new ValidationException("Category name '" + dto.getCategoryName() + "' already exists");
        if (categoryRepository.existsByCategoryCodeIgnoreCaseAndCategoryIdNot(dto.getCategoryCode(), id))
            throw new ValidationException("Category code '" + dto.getCategoryCode() + "' already exists");

        category.setCategoryCode(dto.getCategoryCode().toUpperCase());
        category.setCategoryName(dto.getCategoryName());
        category.setDescription(dto.getDescription());
        category.setIcon(dto.getIcon());
        category.setColorCode(dto.getColorCode());
        category.setDisplayOrder(dto.getDisplayOrder());
        category.setStatus(dto.getStatus());
        category.setRemarks(dto.getRemarks());
        category.setUpdatedBy(updatedBy);

        if (image != null && !image.isEmpty()) {
            category.setImage(storeImage(image, category.getImage()));
        }

        Category saved = categoryRepository.save(category);

        if (dto.getMonthlyLimit() != null) {
            EmissionLimit existingLimit = emissionLimitRepository.findByCategoryCategoryIdAndActiveTrue(id).orElse(null);
            if (dto.getMonthlyLimit() > 0) {
                if (existingLimit != null) {
                    existingLimit.setMonthlyLimit(dto.getMonthlyLimit());
                    emissionLimitRepository.save(existingLimit);
                } else {
                    EmissionLimit limit = EmissionLimit.builder()
                            .category(saved)
                            .monthlyLimit(dto.getMonthlyLimit())
                            .unit("kg CO2e")
                            .active(true)
                            .build();
                    emissionLimitRepository.save(limit);
                }
            } else if (existingLimit != null) {
                existingLimit.setActive(false);
                emissionLimitRepository.save(existingLimit);
            }
        }

        return toDto(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Category category = findOrThrow(id);
        if (!category.getActivityTypes().isEmpty())
            throw new ValidationException("Cannot delete category with existing activity types. Deactivate it instead.");
        deleteLocalImage(category.getImage());
        emissionLimitRepository.findByCategoryCategoryIdAndActiveTrue(id)
                .ifPresent(emissionLimitRepository::delete);
        categoryRepository.delete(category);
    }

    @Override
    @Transactional
    public CategoryDto activate(Long id, String updatedBy) {
        Category category = findOrThrow(id);
        category.setStatus(CategoryStatus.ACTIVE);
        category.setUpdatedBy(updatedBy);
        return toDto(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryDto deactivate(Long id, String updatedBy) {
        Category category = findOrThrow(id);
        category.setStatus(CategoryStatus.INACTIVE);
        category.setUpdatedBy(updatedBy);
        return toDto(categoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> getActiveCategories() {
        return categoryRepository.findByStatus(CategoryStatus.ACTIVE)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    private Category findOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    private CategoryDto toDto(Category c) {
        Double monthlyLimit = emissionLimitRepository.findByCategoryCategoryIdAndActiveTrue(c.getCategoryId())
                .map(EmissionLimit::getMonthlyLimit)
                .orElse(null);
        return CategoryDto.builder()
                .categoryId(c.getCategoryId())
                .categoryCode(c.getCategoryCode())
                .categoryName(c.getCategoryName())
                .description(c.getDescription())
                .icon(c.getIcon())
                .image(c.getImage())
                .colorCode(c.getColorCode())
                .displayOrder(c.getDisplayOrder())
                .status(c.getStatus())
                .remarks(c.getRemarks())
                .monthlyLimit(monthlyLimit)
                .createdBy(c.getCreatedBy())
                .updatedBy(c.getUpdatedBy())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private String storeImage(MultipartFile file, String oldImagePath) {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase()))
            throw new ValidationException("Only JPG, JPEG, PNG and WEBP images are allowed.");
        if (file.getSize() > MAX_IMAGE_BYTES)
            throw new ValidationException("Image size must be less than 5 MB.");

        try {
            Path uploadPath = Paths.get(categoryUploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String original = file.getOriginalFilename();
            String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf(".")).toLowerCase()
                : ".jpg";
            String filename = "category_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12) + ext;

            Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

            deleteLocalImage(oldImagePath);

            return "/uploads/categories/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store category image.", e);
        }
    }

    private void deleteLocalImage(String imagePath) {
        if (imagePath == null || !imagePath.startsWith("/uploads/categories/")) return;
        try {
            Path uploadPath = Paths.get(categoryUploadDir).toAbsolutePath().normalize();
            String filename = imagePath.substring(imagePath.lastIndexOf('/') + 1);
            Files.deleteIfExists(uploadPath.resolve(filename));
        } catch (IOException ignored) {}
    }
}
