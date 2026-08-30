package com.infosys.carbonfootprint.service;

import com.infosys.carbonfootprint.dto.AlertDto;
import java.util.*; import org.springframework.data.domain.Page; import org.springframework.data.domain.Pageable;

public interface AlertService {
    List<AlertDto> getAll(Long userId); Page<AlertDto> getPage(Long userId, Pageable pageable);
    Optional<AlertDto> getCurrentGoalAlert(Long userId);
    long unreadCount(Long userId);
    AlertDto markRead(Long id, Long userId);
    AlertDto resolveAlert(Long id, Long userId);
    void markAllRead(Long userId);
    void delete(Long id, Long userId);
}