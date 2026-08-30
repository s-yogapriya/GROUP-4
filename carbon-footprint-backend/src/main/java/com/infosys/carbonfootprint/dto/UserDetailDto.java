package com.infosys.carbonfootprint.dto;

import com.infosys.carbonfootprint.entity.Gender;
import com.infosys.carbonfootprint.entity.UserStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDetailDto {

    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String middleName;
    private String lastName;
    private Integer age;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String mobileNumber;
    private String alternateMobile;
    private UserStatus status;
    private boolean firstLogin;
    private String profilePhotoUrl;
    private AddressDto address;
    private GovernmentIdDto governmentId;
    private List<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
