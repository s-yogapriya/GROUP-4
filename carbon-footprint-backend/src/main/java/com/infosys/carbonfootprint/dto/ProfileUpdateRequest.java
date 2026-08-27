package com.infosys.carbonfootprint.dto;

import com.infosys.carbonfootprint.entity.Gender;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

/** Editable fields for the currently authenticated user's profile. */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfileUpdateRequest {
    @NotBlank(message = "First name is required") @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters") private String firstName;
    @Size(max = 50, message = "Middle name must not exceed 50 characters") private String middleName;
    @NotBlank(message = "Last name is required") @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters") private String lastName;
    @Min(value = 18, message = "User must be at least 18 years old") @Max(value = 120, message = "Invalid age") private Integer age;
    private Gender gender;
    @Past(message = "Date of birth must be in the past") private LocalDate dateOfBirth;
    @Pattern(regexp = "^$|^[6-9]\\d{9}$", message = "Mobile number must be a valid 10-digit Indian phone number") private String mobileNumber;
    @Pattern(regexp = "^$|^[6-9]\\d{9}$", message = "Alternate mobile number must be a valid 10-digit phone number") private String alternateMobile;
    @NotBlank(message = "Email address is required") @Email(message = "Please provide a valid email address") private String email;
    private AddressDto address;
}