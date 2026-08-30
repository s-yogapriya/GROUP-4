package com.infosys.carbonfootprint.repository;

import com.infosys.carbonfootprint.entity.ActivityType;
import com.infosys.carbonfootprint.entity.CategoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityTypeRepository extends JpaRepository<ActivityType, Long> {
    List<ActivityType> findByCategoryCategoryIdOrderByDisplayOrderAscActivityNameAsc(Long categoryId);
    List<ActivityType> findByCategoryCategoryIdAndStatus(Long categoryId, CategoryStatus status);
    boolean existsByActivityNameIgnoreCaseAndCategoryCategoryId(String name, Long categoryId);
    boolean existsByActivityNameIgnoreCaseAndCategoryCategoryIdAndActivityTypeIdNot(String name, Long categoryId, Long id);
    boolean existsByActivityCodeIgnoreCase(String code);
    boolean existsByActivityCodeIgnoreCaseAndActivityTypeIdNot(String code, Long id);
    List<ActivityType> findAllByOrderByDisplayOrderAscActivityNameAsc();
    List<ActivityType> findByStatus(CategoryStatus status);
    java.util.Optional<ActivityType> findByActivityCode(String activityCode);
}
