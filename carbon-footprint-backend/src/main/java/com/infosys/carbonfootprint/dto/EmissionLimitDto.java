package com.infosys.carbonfootprint.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EmissionLimitDto {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private Double monthlyLimit;
    private String unit;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
