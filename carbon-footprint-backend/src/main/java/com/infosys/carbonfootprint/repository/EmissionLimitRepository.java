package com.infosys.carbonfootprint.repository;

import com.infosys.carbonfootprint.entity.EmissionLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmissionLimitRepository extends JpaRepository<EmissionLimit,Long> {
    Page<EmissionLimit> findAll(Pageable pageable);
    Optional<EmissionLimit> findByCategoryCategoryId(Long categoryId);
    Optional<EmissionLimit> findByCategoryCategoryIdAndActiveTrue(Long categoryId);
}
