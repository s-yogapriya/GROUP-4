package com.infosys.carbonfootprint.controller;

import com.infosys.carbonfootprint.dto.ProfileUpdateRequest;
import com.infosys.carbonfootprint.dto.UserDetailDto;
import com.infosys.carbonfootprint.response.ApiResponse;
import com.infosys.carbonfootprint.security.UserDetailsImpl;
import com.infosys.carbonfootprint.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/user")
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class UserController {
    @Autowired private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDetailDto>> getCurrentUserProfile(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.success("User profile fetched successfully", userService.getUserProfile(user.getId())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDetailDto>> updateCurrentUserProfile(@Valid @RequestBody ProfileUpdateRequest request, @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.success("User profile updated successfully", userService.updateProfile(user.getId(), request)));
    }

    @PostMapping("/profile/photo")
    public ResponseEntity<ApiResponse<UserDetailDto>> uploadProfilePhoto(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.success("Profile photo updated", userService.updateProfilePhoto(user.getId(), file)));
    }

    @DeleteMapping("/profile/photo")
    public ResponseEntity<ApiResponse<UserDetailDto>> removeProfilePhoto(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.success("Profile photo removed", userService.removeProfilePhoto(user.getId())));
    }
}