package com.infosys.carbonfootprint.service.impl;

import com.infosys.carbonfootprint.dto.AddressDto;
import com.infosys.carbonfootprint.dto.ProfileUpdateRequest;
import com.infosys.carbonfootprint.dto.UserDetailDto;
import com.infosys.carbonfootprint.entity.Address;
import com.infosys.carbonfootprint.entity.User;
import com.infosys.carbonfootprint.exception.ResourceNotFoundException;
import com.infosys.carbonfootprint.exception.ValidationException;
import com.infosys.carbonfootprint.mapper.UserMapper;
import com.infosys.carbonfootprint.repository.UserRepository;
import com.infosys.carbonfootprint.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {
    private static final long MAX_PROFILE_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_PROFILE_PHOTO_TYPES = Set.of("image/jpeg", "image/jpg", "image/png");

    @Autowired private UserRepository userRepository;
    @Autowired private UserMapper userMapper;
    @Value("${app.profile-photo.dir:uploads/profile-photos}") private String profilePhotoDir;

    @Override
    @Transactional(readOnly = true)
    public UserDetailDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return userMapper.toDetailDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailDto getUserProfileByUsername(String username) {
        User user = userRepository.findByUsernameOrEmail(username, username).orElseThrow(() -> new ResourceNotFoundException("User", "username/email", username));
        return userMapper.toDetailDto(user);
    }

    @Override
    @Transactional
    public UserDetailDto updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        String email = request.getEmail().trim().toLowerCase();
        userRepository.findByEmail(email).filter(existing -> !existing.getId().equals(userId)).ifPresent(existing -> {
            throw new ValidationException("An account with this email address already exists");
        });

        user.setFirstName(request.getFirstName().trim());
        user.setMiddleName(normalizeOptional(request.getMiddleName()));
        user.setLastName(request.getLastName().trim());
        user.setAge(request.getAge());
        user.setGender(request.getGender());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setMobileNumber(normalizeOptional(request.getMobileNumber()));
        user.setAlternateMobile(normalizeOptional(request.getAlternateMobile()));
        user.setEmail(email);
        if (request.getAddress() != null) {
            updateAddress(user, request.getAddress());
        }
        return userMapper.toDetailDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserDetailDto updateProfilePhoto(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        if (file == null || file.isEmpty()) throw new ValidationException("Please select a profile photo");
        if (file.getSize() > MAX_PROFILE_PHOTO_SIZE_BYTES) throw new ValidationException("Profile photo must not exceed 5 MB");
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_PROFILE_PHOTO_TYPES.contains(contentType.toLowerCase())) throw new ValidationException("Profile photo must be a JPEG or PNG image");
        try {
            Path directory = Paths.get(profilePhotoDir).toAbsolutePath().normalize();
            Files.createDirectories(directory);
            String extension = contentType.equalsIgnoreCase("image/png") ? ".png" : ".jpg";
            String filename = UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), directory.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            user.setProfilePhotoUrl("/uploads/profile-photos/" + filename);
            return userMapper.toDetailDto(userRepository.save(user));
        } catch (IOException ex) {
            throw new ValidationException("Unable to save profile photo. Please try again");
        }
    }

    @Override
    @Transactional
    public UserDetailDto removeProfilePhoto(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setProfilePhotoUrl(null);
        return userMapper.toDetailDto(userRepository.save(user));
    }

    private void updateAddress(User user, AddressDto dto) {
        Address address = user.getAddress();
        if (address == null) { address = new Address(); user.setAddress(address); }
        address.setHouseNumber(normalizeOptional(dto.getHouseNumber()));
        address.setStreet(normalizeOptional(dto.getStreet()));
        address.setArea(normalizeOptional(dto.getArea()));
        address.setLandmark(normalizeOptional(dto.getLandmark()));
        address.setCity(normalizeOptional(dto.getCity()));
        address.setState(normalizeOptional(dto.getState()));
        address.setCountry(normalizeOptional(dto.getCountry()));
        address.setPinCode(normalizeOptional(dto.getPinCode()));
    }

    private String normalizeOptional(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}