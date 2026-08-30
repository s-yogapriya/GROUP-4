package com.infosys.carbonfootprint.dto;
import lombok.*; import java.time.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RecommendationDto { private Long activityLogId; private String activityName; private String categoryName; private Double totalEmission; private LocalDate activityDate; }