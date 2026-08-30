package com.infosys.carbonfootprint.controller;

import com.infosys.carbonfootprint.dto.*;
import com.infosys.carbonfootprint.response.ApiResponse;
import com.infosys.carbonfootprint.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller handling public Auth REST endpoints (Registration, Admin Login, User Login, Password Reset, Google Login).
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/admin/login")
    public ResponseEntity<ApiResponse<JwtResponse>> loginAdmin(@Valid @RequestBody AdminLoginRequest loginRequest) {
        JwtResponse response = authService.authenticateAdmin(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Admin authenticated successfully", response));
    }

    @PostMapping("/user/login")
    public ResponseEntity<ApiResponse<JwtResponse>> loginUser(@Valid @RequestBody UserLoginRequest loginRequest) {
        JwtResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("User authenticated successfully", response));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<JwtResponse>> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest googleRequest) {
        JwtResponse response = authService.authenticateGoogle(googleRequest);
        return ResponseEntity.ok(ApiResponse.success("Google authentication successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDetailDto>> registerUser(@Valid @RequestBody RegistrationRequest registrationRequest) {
        UserDetailDto registeredUser = authService.registerUser(registrationRequest);
        return new ResponseEntity<>(
                ApiResponse.success("Registration submitted successfully! Your account is PENDING approval by the Admin.", registeredUser),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/reset-password/{userId}")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @PathVariable Long userId,
            @Valid @RequestBody PasswordResetRequest request) {
        authService.resetPassword(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully! You can now log in with your new password."));
    }
}
