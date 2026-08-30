package com.infosys.carbonfootprint.dto;
import jakarta.validation.constraints.*; import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor public class EmissionLimitRequest { @NotNull private Long categoryId; @NotNull @DecimalMin(value="0.01") private Double monthlyLimit; private Boolean active; }