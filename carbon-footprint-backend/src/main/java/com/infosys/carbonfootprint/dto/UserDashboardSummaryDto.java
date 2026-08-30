package com.infosys.carbonfootprint.dto;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class UserDashboardSummaryDto {
    private int trackingStreak;
    private int sustainabilityScore;
    private String sustainabilityStatus;  // Excellent / Good / Needs Improvement / High Emissions
    private boolean hasActivities;
}
