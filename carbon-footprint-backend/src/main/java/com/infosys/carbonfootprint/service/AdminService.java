package com.infosys.carbonfootprint.service;

import com.infosys.carbonfootprint.dto.*;
import com.infosys.carbonfootprint.entity.UserStatus;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {

    DashboardStatsDto getDashboardStats();

    List<UserSummaryDto> getAllUsers(); Page<UserSummaryDto> getAllUsersPage(Pageable pageable);

    List<UserSummaryDto> getUsersByStatus(UserStatus status); Page<UserSummaryDto> getUsersByStatusPage(UserStatus status, Pageable pageable);

    UserDetailDto getUserById(Long id);

    UserDetailDto approveUser(Long id);

    UserDetailDto rejectUser(Long id, String remark);
}
