package com.infosys.carbonfootprint.repository;

import com.infosys.carbonfootprint.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findAllByOrderByActivityDateDescCreatedAtDesc();

    List<ActivityLog> findByUserIdOrderByActivityDateDescCreatedAtDesc(Long userId);

    Page<ActivityLog> findByUserId(Long userId, Pageable pageable);

    Optional<ActivityLog> findByActivityLogIdAndUserId(Long logId, Long userId);

    @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId " +
           "AND (:categoryId IS NULL OR a.category.categoryId = :categoryId) " +
           "AND (:activityTypeId IS NULL OR a.activityType.activityTypeId = :activityTypeId) " +
           "AND (:fromDate IS NULL OR a.activityDate >= :fromDate) " +
           "AND (:toDate IS NULL OR a.activityDate <= :toDate) " +
           "ORDER BY a.activityDate DESC, a.createdAt DESC")
    List<ActivityLog> findFiltered(@Param("userId") Long userId,
                                   @Param("categoryId") Long categoryId,
                                   @Param("activityTypeId") Long activityTypeId,
                                   @Param("fromDate") LocalDate fromDate,
                                   @Param("toDate") LocalDate toDate);

    // Dedicated strongly-typed query for monthly emission totals (used by Goals).
    // No nullable parameters — avoids PostgreSQL type inference error on NULL.
    @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId " +
           "AND a.activityDate >= :startDate AND a.activityDate <= :endDate")
    List<ActivityLog> findByUserIdAndDateRange(@Param("userId") Long userId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);

    // Returns all distinct activity dates for a user, sorted descending — used for streak calculation.
    @Query("SELECT DISTINCT a.activityDate FROM ActivityLog a WHERE a.user.id = :userId ORDER BY a.activityDate DESC")
    List<LocalDate> findDistinctActivityDatesByUserId(@Param("userId") Long userId);

    // Sum of totalEmission for a user within a date range — used for sustainability score.
    @Query("SELECT COALESCE(SUM(a.totalEmission), 0.0) FROM ActivityLog a WHERE a.user.id = :userId " +
           "AND a.activityDate >= :startDate AND a.activityDate <= :endDate")
    Double sumEmissionByUserIdAndDateRange(@Param("userId") Long userId,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);

    // Count of distinct activity dates for a user — used to detect empty state.
    @Query("SELECT COUNT(DISTINCT a.activityDate) FROM ActivityLog a WHERE a.user.id = :userId")
    long countDistinctActivityDatesByUserId(@Param("userId") Long userId);

    @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId " +
           "AND a.category.categoryId = :categoryId " +
           "AND a.activityDate >= :fromDate AND a.activityDate <= :toDate")
    List<ActivityLog> findByUserIdAndCategoryCategoryIdAndActivityDateBetween(
           @Param("userId") Long userId,
           @Param("categoryId") Long categoryId,
           @Param("fromDate") LocalDate fromDate,
           @Param("toDate") LocalDate toDate);

    @Query("SELECT COUNT(a) > 0 FROM ActivityLog a WHERE a.user.id = :userId AND a.notes = :notes")
    boolean existsByUserIdAndNotes(@Param("userId") Long userId, @Param("notes") String notes);
}
