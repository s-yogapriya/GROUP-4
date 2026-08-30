package com.infosys.carbonfootprint.dto;
import jakarta.validation.constraints.*; import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor public class GoalRequest { @NotNull @DecimalMin(value="0.01",message="Monthly target must be greater than 0") private Double targetAmount; }