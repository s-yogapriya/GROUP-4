package com.infosys.carbonfootprint.dto;

import com.infosys.carbonfootprint.entity.Gender;
import com.infosys.carbonfootprint.entity.UserStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSummaryDto {

    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private Gender gender;
    private UserStatus status;
    private boolean firstLogin;
    private String profilePhotoUrl;
    private LocalDateTime createdAt;
}
