package com.infosys.carbonfootprint.repository;

import com.infosys.carbonfootprint.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.*;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    Page<Alert> findByUserId(Long userId, Pageable pageable);
    List<Alert> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndIsReadFalse(Long userId);
    Optional<Alert> findByIdAndUserId(Long id, Long userId);
    List<Alert> findByUserIdAndAlertTypeAndMonthAndYearAndCategoryIsNullOrderByCreatedAtDesc(Long userId, AlertType alertType, Integer month, Integer year);
    boolean existsByUserIdAndAlertTypeAndMonthAndYearAndCategoryIsNullAndMonthlyLimit(Long userId, AlertType alertType, Integer month, Integer year, Double monthlyLimit);
    @Query("SELECT a FROM Alert a WHERE a.user.id=:userId AND (:categoryId IS NULL AND a.category IS NULL OR a.category.categoryId=:categoryId) AND a.alertType=:type AND a.month=:month AND a.year=:year")
    Optional<Alert> findByUserIdAndCategoryCategoryIdAndAlertTypeAndMonthAndYear(@Param("userId") Long userId, @Param("categoryId") Long categoryId, @Param("type") AlertType type, @Param("month") Integer month, @Param("year") Integer year);
    boolean existsByUserIdAndCategoryCategoryIdAndAlertTypeAndMonthAndYear(@Param("userId") Long userId, @Param("categoryId") Long categoryId, @Param("type") AlertType type, @Param("month") Integer month, @Param("year") Integer year);
}