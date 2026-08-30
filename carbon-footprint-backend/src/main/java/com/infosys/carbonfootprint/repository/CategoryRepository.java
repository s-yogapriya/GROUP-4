package com.infosys.carbonfootprint.repository;

import com.infosys.carbonfootprint.entity.Category;
import com.infosys.carbonfootprint.entity.CategoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByCategoryNameIgnoreCase(String categoryName);
    boolean existsByCategoryCodeIgnoreCase(String categoryCode);
    boolean existsByCategoryNameIgnoreCaseAndCategoryIdNot(String categoryName, Long id);
    boolean existsByCategoryCodeIgnoreCaseAndCategoryIdNot(String categoryCode, Long id);
    List<Category> findAllByOrderByDisplayOrderAscCategoryNameAsc();
    List<Category> findByStatus(CategoryStatus status);
    Optional<Category> findByCategoryNameIgnoreCase(String name);
    Optional<Category> findByCategoryCode(String categoryCode);
}
