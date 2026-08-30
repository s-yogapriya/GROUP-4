package com.infosys.carbonfootprint.service;

import com.infosys.carbonfootprint.dto.ProfileUpdateRequest;
import com.infosys.carbonfootprint.dto.UserDetailDto;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    UserDetailDto getUserProfile(Long userId);
    UserDetailDto getUserProfileByUsername(String username);
    UserDetailDto updateProfile(Long userId, ProfileUpdateRequest request);
    UserDetailDto updateProfilePhoto(Long userId, MultipartFile file);
    UserDetailDto removeProfilePhoto(Long userId);
}