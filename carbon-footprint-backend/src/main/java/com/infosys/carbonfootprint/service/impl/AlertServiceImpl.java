package com.infosys.carbonfootprint.service.impl;

import com.infosys.carbonfootprint.dto.AlertDto;
import com.infosys.carbonfootprint.entity.*;
import com.infosys.carbonfootprint.exception.ResourceNotFoundException;
import com.infosys.carbonfootprint.repository.AlertRepository;
import com.infosys.carbonfootprint.service.AlertService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class AlertServiceImpl implements AlertService {
    private final AlertRepository repo;
    public AlertServiceImpl(AlertRepository repo) { this.repo = repo; }

    private AlertDto dto(Alert a) {
        return AlertDto.builder().id(a.getId()).categoryName(a.getCategory() == null ? null : a.getCategory().getCategoryName())
                .alertType(a.getAlertType()).severity(a.getSeverity()).title(a.getTitle()).message(a.getMessage())
                .recommendation(a.getRecommendation()).currentEmission(a.getCurrentEmission()).monthlyLimit(a.getMonthlyLimit())
                .exceededAmount(a.getExceededAmount()).read(a.isRead()).resolved(a.isResolved()).month(a.getMonth()).year(a.getYear()).createdAt(a.getCreatedAt()).build();
    }

    @Transactional(readOnly = true)
    public List<AlertDto> getAll(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::dto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<AlertDto> getCurrentGoalAlert(Long userId) {
        LocalDate now = LocalDate.now();
        return repo.findByUserIdAndAlertTypeAndMonthAndYearAndCategoryIsNullOrderByCreatedAtDesc(userId, AlertType.GOAL_EXCEEDED, now.getMonthValue(), now.getYear())
                .stream().filter(alert -> !alert.isResolved()).findFirst().map(this::dto);
    }

    @Transactional(readOnly = true)
    public Page<AlertDto> getPage(Long userId, Pageable pageable) { return repo.findByUserId(userId, pageable).map(this::dto); }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(a -> !a.isRead())
                .filter(a -> !(a.getAlertType() == AlertType.GOAL_EXCEEDED && a.isResolved()))
                .count();
    }

    @Transactional
    public AlertDto markRead(Long id, Long userId) { Alert a = repo.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Alert not found")); a.setRead(true); return dto(repo.save(a)); }

    @Transactional
    public AlertDto resolveAlert(Long id, Long userId) {
        Alert a = repo.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
        a.setResolved(true);
        a.setRead(true);
        return dto(repo.save(a));
    }

    @Transactional
    public void markAllRead(Long userId) { repo.findByUserIdOrderByCreatedAtDesc(userId).forEach(a -> a.setRead(true)); }

    @Transactional
    public void delete(Long id, Long userId) { repo.delete(repo.findByIdAndUserId(id, userId).orElseThrow(() -> new ResourceNotFoundException("Alert not found"))); }
}