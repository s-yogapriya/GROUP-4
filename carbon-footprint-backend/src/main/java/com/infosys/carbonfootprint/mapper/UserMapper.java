package com.infosys.carbonfootprint.mapper;

import com.infosys.carbonfootprint.dto.*;
import com.infosys.carbonfootprint.entity.*;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

/**
 * Utility mapper for entity to DTO transformations.
 */
@Component
public class UserMapper {

    public UserSummaryDto toSummaryDto(User user) {
        if (user == null) return null;
        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .mobileNumber(user.getMobileNumber())
                .gender(user.getGender())
                .status(user.getStatus())
                .firstLogin(user.isFirstLogin())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public UserDetailDto toDetailDto(User user) {
        if (user == null) return null;
        return UserDetailDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .middleName(user.getMiddleName())
                .lastName(user.getLastName())
                .age(user.getAge())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .mobileNumber(user.getMobileNumber())
                .alternateMobile(user.getAlternateMobile())
                .status(user.getStatus())
                .firstLogin(user.isFirstLogin())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .address(toAddressDto(user.getAddress()))
                .governmentId(toGovernmentIdDto(user.getGovernmentId()))
                .roles(user.getRoles() != null ? user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()) : java.util.Collections.emptyList())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public AddressDto toAddressDto(Address address) {
        if (address == null) return null;
        return AddressDto.builder()
                .houseNumber(address.getHouseNumber())
                .street(address.getStreet())
                .area(address.getArea())
                .landmark(address.getLandmark())
                .city(address.getCity())
                .state(address.getState())
                .country(address.getCountry())
                .pinCode(address.getPinCode())
                .createdAt(address.getCreatedAt())
                .build();
    }

    public Address toAddressEntity(AddressDto dto) {
        if (dto == null) return null;
        return Address.builder()
                .houseNumber(dto.getHouseNumber())
                .street(dto.getStreet())
                .area(dto.getArea())
                .landmark(dto.getLandmark())
                .city(dto.getCity())
                .state(dto.getState())
                .country(dto.getCountry())
                .pinCode(dto.getPinCode())
                .build();
    }

    public GovernmentIdDto toGovernmentIdDto(GovernmentId govId) {
        if (govId == null) return null;
        return GovernmentIdDto.builder()
                .idType(govId.getIdType())
                .idNumber(govId.getIdNumber())
                .documentUrl(govId.getDocumentUrl())
                .createdAt(govId.getCreatedAt())
                .build();
    }

    public GovernmentId toGovernmentIdEntity(GovernmentIdDto dto) {
        if (dto == null) return null;
        return GovernmentId.builder()
                .idType(dto.getIdType())
                .idNumber(dto.getIdNumber())
                .documentUrl(dto.getDocumentUrl())
                .build();
    }
}
