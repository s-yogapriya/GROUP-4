package com.infosys.carbonfootprint.service.impl;

import com.infosys.carbonfootprint.dto.*;
import com.infosys.carbonfootprint.entity.Gender;
import com.infosys.carbonfootprint.entity.User;
import com.infosys.carbonfootprint.entity.UserStatus;
import com.infosys.carbonfootprint.exception.ResourceNotFoundException;
import com.infosys.carbonfootprint.exception.ValidationException;
import com.infosys.carbonfootprint.mapper.UserMapper;
import com.infosys.carbonfootprint.repository.UserRepository;
import com.infosys.carbonfootprint.service.AdminService;
import com.infosys.carbonfootprint.service.EmailService;
import com.infosys.carbonfootprint.util.PasswordGenerator;
import com.infosys.carbonfootprint.util.UsernameGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UsernameGenerator usernameGenerator;

    @Autowired
    private PasswordGenerator passwordGenerator;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long pendingUsers = userRepository.countByStatus(UserStatus.PENDING);
        long approvedUsers = userRepository.countByStatus(UserStatus.APPROVED);
        long rejectedUsers = userRepository.countByStatus(UserStatus.REJECTED);
        long maleCount = userRepository.countByGender(Gender.MALE);
        long femaleCount = userRepository.countByGender(Gender.FEMALE);
        long otherCount = userRepository.countByGender(Gender.OTHER);

        List<UserSummaryDto> recent = userRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(5)
                .map(userMapper::toSummaryDto)
                .collect(Collectors.toList());

        return DashboardStatsDto.builder()
                .totalUsers(totalUsers)
                .pendingUsers(pendingUsers)
                .approvedUsers(approvedUsers)
                .rejectedUsers(rejectedUsers)
                .maleCount(maleCount)
                .femaleCount(femaleCount)
                .otherGenderCount(otherCount)
                .recentRegistrations(recent)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryDto> getAllUsers() {
        return userRepository.findAllRegisteredUsers().stream()
                .map(userMapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryDto> getUsersByStatus(UserStatus status) {
        return userRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(userMapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSummaryDto> getAllUsersPage(Pageable pageable) {
        return userRepository.findAllRegisteredUsers(pageable).map(userMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSummaryDto> getUsersByStatusPage(UserStatus status, Pageable pageable) {
        return userRepository.findRegisteredUsersByStatus(status, pageable).map(userMapper::toSummaryDto);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toDetailDto(user);
    }

    @Override
    @Transactional
    public UserDetailDto approveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (user.getStatus() == UserStatus.APPROVED) {
            throw new ValidationException("User is already APPROVED");
        }

        // 1. Generate Username if not set
        String username = user.getUsername();
        if (username == null || username.trim().isEmpty()) {
            username = usernameGenerator.generateUniqueUsername(user.getFirstName(), user.getLastName());
            user.setUsername(username);
        }

        // 2. Generate Random Temporary Password
        String temporaryPassword = passwordGenerator.generateTemporaryPassword(10);

        // 3. Encrypt and store password
        user.setPassword(passwordEncoder.encode(temporaryPassword));
        user.setStatus(UserStatus.APPROVED);
        user.setFirstLogin(true);

        User savedUser = userRepository.save(user);

        // 4. Send Email Notification with credentials
        String fullName = user.getFirstName() + " " + user.getLastName();
        emailService.sendCredentialsEmail(user.getEmail(), fullName, username, temporaryPassword);

        return userMapper.toDetailDto(savedUser);
    }

    @Override
    @Transactional
    public UserDetailDto rejectUser(Long id, String remark) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (user.getStatus() == UserStatus.REJECTED) {
            throw new ValidationException("User is already REJECTED");
        }

        user.setStatus(UserStatus.REJECTED);
        User savedUser = userRepository.save(user);

        String first = user.getFirstName() != null ? user.getFirstName() : "";
        String last = user.getLastName() != null ? user.getLastName() : "";
        String fullName = (first + " " + last).trim();
        emailService.sendRejectionEmail(user.getEmail(), fullName, remark);

        return userMapper.toDetailDto(savedUser);
    }
}

