package com.infosys.carbonfootprint.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressDto {

    private String houseNumber;

    private String street;

    private String area;

    private String landmark;

    private String city;

    private String state;

    private String country;

    @Pattern(regexp = "^$|^[1-9][0-9]{5}$", message = "PIN code must be a valid 6-digit number")
    private String pinCode;
}
