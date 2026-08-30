package com.infosys.carbonfootprint.service.impl;

import com.infosys.carbonfootprint.dto.*;
import com.infosys.carbonfootprint.entity.*;
import com.infosys.carbonfootprint.exception.AppAuthenticationException;
import com.infosys.carbonfootprint.exception.ResourceNotFoundException;
import com.infosys.carbonfootprint.exception.ValidationException;
import com.infosys.carbonfootprint.mapper.UserMapper;
import com.infosys.carbonfootprint.repository.RoleRepository;
import com.infosys.carbonfootprint.repository.UserRepository;
import com.infosys.carbonfootprint.security.UserDetailsImpl;
import com.infosys.carbonfootprint.security.jwt.JwtUtils;
import com.infosys.carbonfootprint.service.AuthService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserMapper userMapper;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    @Override
    @Transactional
    public JwtResponse authenticateAdmin(AdminLoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        if (!roles.contains(RoleType.ROLE_ADMIN.name())) {
            throw new AppAuthenticationException("Access Denied: Only Admin accounts can log in through the Admin Portal");
        }

        String jwt = jwtUtils.generateJwtToken(authentication);

        return JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .firstName(userDetails.getFirstName())
                .lastName(userDetails.getLastName())
                .firstLogin(userDetails.isFirstLogin())
                .roles(roles)
                .build();
    }

    @Override
    @Transactional
    public JwtResponse authenticateUser(UserLoginRequest request) {
        User user = userRepository.findByUsernameOrEmail(request.getUsernameOrEmail(), request.getUsernameOrEmail())
                .orElseThrow(() -> new AppAuthenticationException("Invalid username/email or password"));

        if (user.getStatus() == UserStatus.PENDING) {
            throw new AppAuthenticationException("Your registration request is PENDING approval by the Administrator. Please wait for an email with your approval credentials.");
        }

        if (user.getStatus() == UserStatus.REJECTED) {
            throw new AppAuthenticationException("Your registration request has been REJECTED by the Administrator. Login is not permitted.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String jwt = jwtUtils.generateJwtToken(authentication);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .firstName(userDetails.getFirstName())
                .lastName(userDetails.getLastName())
                .firstLogin(user.isFirstLogin())
                .roles(roles)
                .build();
    }

    @Override
    @Transactional
    public JwtResponse authenticateGoogle(GoogleLoginRequest request) {
        GoogleIdToken idToken = verifyGoogleToken(request.getCredential());
        if (idToken == null) {
            throw new AppAuthenticationException("Invalid Google authentication token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        String googleId = payload.getSubject();
        String firstName = (String) payload.getOrDefault("given_name", "");
        String lastName = (String) payload.getOrDefault("family_name", "");

        // Check if user already exists by email
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Auto-create new user with APPROVED status (no admin approval needed for Google users)
            Role userRole = roleRepository.findByName(RoleType.ROLE_USER)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_USER).build()));

            Set<Role> roles = new HashSet<>();
            roles.add(userRole);

            user = User.builder()
                    .email(email)
                    .username("google_" + googleId)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .firstName(firstName.isEmpty() ? "Google" : firstName)
                    .lastName(lastName.isEmpty() ? "User" : lastName)
                    .status(UserStatus.APPROVED)
                    .firstLogin(false)
                    .roles(roles)
                    .build();

            user = userRepository.save(user);
        } else {
            // If user exists but was PENDING or REJECTED via normal registration, approve them
            if (user.getStatus() != UserStatus.APPROVED) {
                user.setStatus(UserStatus.APPROVED);
                user.setFirstLogin(false);
                user = userRepository.save(user);
            }
        }

        // Generate JWT using a manually created authentication
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .firstName(userDetails.getFirstName())
                .lastName(userDetails.getLastName())
                .firstLogin(false)
                .roles(roles)
                .build();
    }

    private GoogleIdToken verifyGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            return verifier.verify(idTokenString);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    @Transactional
    public UserDetailDto registerUser(RegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Error: An account with email address '" + request.getEmail() + "' already exists!");
        }

        Address address = userMapper.toAddressEntity(request.getAddress());
        GovernmentId govId = userMapper.toGovernmentIdEntity(request.getGovernmentId());

        Role userRole = roleRepository.findByName(RoleType.ROLE_USER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_USER).build()));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);

        User user = User.builder()
                .firstName(request.getFirstName())
                .middleName(request.getMiddleName())
                .lastName(request.getLastName())
                .age(request.getAge())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .mobileNumber(request.getMobileNumber())
                .alternateMobile(request.getAlternateMobile())
                .email(request.getEmail())
                .address(address)
                .governmentId(govId)
                .status(UserStatus.PENDING)
                .firstLogin(true)
                .roles(roles)
                .build();

        User savedUser = userRepository.save(user);
        return userMapper.toDetailDto(savedUser);
    }

    @Override
    @Transactional
    public void resetPassword(Long userId, PasswordResetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getOldPassword() != null && !request.getOldPassword().isBlank() &&
                !passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new ValidationException("The current/temporary password entered is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("New password and confirm password do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        userRepository.save(user);
    }
}
