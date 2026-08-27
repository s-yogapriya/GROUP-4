package com.infosys.carbonfootprint.service;

import com.infosys.carbonfootprint.dto.AlertDto;
import java.util.*;

public interface AlertService {
    List<AlertDto> getAll(Long userId);
    Optional<AlertDto> getCurrentGoalAlert(Long userId);
    long unreadCount(Long userId);
    AlertDto markRead(Long id, Long userId);
    AlertDto resolveAlert(Long id, Long userId);
    void markAllRead(Long userId);
    void delete(Long id, Long userId);
}