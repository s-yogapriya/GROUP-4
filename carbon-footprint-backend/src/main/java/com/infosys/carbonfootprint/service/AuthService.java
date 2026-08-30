package com.infosys.carbonfootprint.service;

import com.infosys.carbonfootprint.dto.*;

public interface AuthService {

    JwtResponse authenticateAdmin(AdminLoginRequest request);

    JwtResponse authenticateUser(UserLoginRequest request);

    JwtResponse authenticateGoogle(GoogleLoginRequest request);

    UserDetailDto registerUser(RegistrationRequest request);

    void resetPassword(Long userId, PasswordResetRequest request);
}
