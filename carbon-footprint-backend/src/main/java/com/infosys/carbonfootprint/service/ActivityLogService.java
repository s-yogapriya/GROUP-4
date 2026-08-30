package com.infosys.carbonfootprint.service;

import com.infosys.carbonfootprint.dto.ActivityLogDto;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ActivityLogService {
    ActivityLogDto create(ActivityLogDto dto, Long userId);
    List<ActivityLogDto> getByUser(Long userId);
    Page<ActivityLogDto> getPageByUser(Long userId, Pageable pageable);
    Page<ActivityLogDto> getPageForAdmin(Pageable pageable);
    List<ActivityLogDto> getAllForAdmin();
    ActivityLogDto getById(Long logId, Long userId);
    ActivityLogDto update(Long logId, ActivityLogDto dto, Long userId);
    void delete(Long logId, Long userId);
    List<ActivityLogDto> filter(Long userId, Long categoryId, Long activityTypeId, LocalDate fromDate, LocalDate toDate);
}
