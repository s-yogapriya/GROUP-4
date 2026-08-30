package com.infosys.carbonfootprint.repository;

import com.infosys.carbonfootprint.entity.CategoryStatus;
import com.infosys.carbonfootprint.entity.EmissionFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, Long> {
    List<EmissionFactor> findByActivityTypeActivityTypeIdOrderByEffectiveFromDesc(Long activityTypeId);

    @Query("SELECT ef FROM EmissionFactor ef WHERE ef.activityType.activityTypeId = :activityTypeId " +
           "AND ef.status = com.infosys.carbonfootprint.entity.CategoryStatus.ACTIVE AND ef.effectiveFrom <= :date " +
           "AND (ef.effectiveTo IS NULL OR ef.effectiveTo >= :date) " +
           "ORDER BY ef.effectiveFrom DESC, ef.emissionFactorId DESC")
    List<EmissionFactor> findActiveFactorsForDate(@Param("activityTypeId") Long activityTypeId,
                                                 @Param("date") LocalDate date);

    default Optional<EmissionFactor> findActiveFactorForDate(Long activityTypeId, LocalDate date) {
        List<EmissionFactor> factors = findActiveFactorsForDate(activityTypeId, date);
        if (factors == null || factors.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(factors.get(0));
    }

    List<EmissionFactor> findAllByOrderByCreatedAtDesc();
    List<EmissionFactor> findByStatus(CategoryStatus status);

    @Query("SELECT ef FROM EmissionFactor ef " +
           "WHERE (:activityTypeId IS NULL OR ef.activityType.activityTypeId = :activityTypeId) " +
           "AND (:categoryId IS NULL OR ef.activityType.category.categoryId = :categoryId) " +
           "AND (:status IS NULL OR ef.status = :status) " +
           "AND (:search IS NULL OR " +
           "LOWER(ef.activityType.activityName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(ef.activityType.category.categoryName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(ef.sourceName, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(ef.remarks, '')) LIKE LOWER(CONCAT('%', :search, '%'))) ")
    Page<EmissionFactor> searchPage(
            @Param("activityTypeId") Long activityTypeId,
            @Param("categoryId") Long categoryId,
            @Param("status") CategoryStatus status,
            @Param("search") String search,
            Pageable pageable);
}
