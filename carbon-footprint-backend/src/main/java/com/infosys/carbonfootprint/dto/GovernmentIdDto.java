package com.infosys.carbonfootprint.dto;

import com.infosys.carbonfootprint.entity.IdType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GovernmentIdDto {

    private LocalDateTime createdAt;

    @NotNull(message = "Government ID type is required")
    private IdType idType;

    private String idNumber;

    private String documentUrl;
}
