package com.infosys.carbonfootprint.entity;

import jakarta.persistence.*;

import lombok.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "alerts",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {
                        "user_id",
                        "category_id",
                        "alertType",
                        "alert_month",
                        "alert_year"
                }
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    /* ==========================================================
       USER
    ========================================================== */

    @ManyToOne
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;


    /* ==========================================================
       CATEGORY
       NULL for global monthly-goal alerts.
    ========================================================== */

    @ManyToOne
    @JoinColumn(
            name = "category_id"
    )
    private Category category;


    /* ==========================================================
       ALERT TYPE
    ========================================================== */

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false
    )
    private AlertType alertType;


    /* ==========================================================
       SEVERITY
    ========================================================== */

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false
    )
    private AlertSeverity severity;


    /* ==========================================================
       TITLE
    ========================================================== */

    @Column(
            nullable = false
    )
    private String title;


    /* ==========================================================
       MESSAGE
    ========================================================== */

    @Column(
            length = 1200,
            nullable = false
    )
    private String message;


    /* ==========================================================
       RECOMMENDATION
    ========================================================== */

    @Column(
            length = 1200
    )
    private String recommendation;


    /* ==========================================================
       CURRENT EMISSION
    ========================================================== */

    private Double currentEmission;


    /* ==========================================================
       MONTHLY LIMIT / GOAL TARGET
    ========================================================== */

    private Double monthlyLimit;


    /* ==========================================================
       THRESHOLD VALUE
       
       IMPORTANT:
       Database column is NOT NULL.

       HIGH_EMISSION:
           thresholdValue = category monthly limit

       GOAL_EXCEEDED:
           thresholdValue = user's monthly target
    ========================================================== */

    @Column(
            name = "threshold_value",
            nullable = false
    )
    private Double thresholdValue;


    /* ==========================================================
       EXCEEDED AMOUNT
    ========================================================== */

    private Double exceededAmount;


    /* ==========================================================
       MONTH
    ========================================================== */

    @Column(
            name = "alert_month",
            nullable = false
    )
    private Integer month;


    /* ==========================================================
       YEAR
    ========================================================== */

    @Column(
            name = "alert_year",
            nullable = false
    )
    private Integer year;


    /* ==========================================================
       READ STATUS
    ========================================================== */

    @Column(
            name = "is_read",
            nullable = false
    )
    @Builder.Default
    private boolean isRead = false;


    /* ==========================================================
       RESOLVED STATUS
    ========================================================== */

    @Column(
            nullable = false
    )
    @Builder.Default
    private boolean resolved = false;


    /* ==========================================================
       CREATED AT
    ========================================================== */

    @CreationTimestamp
    @Column(
            name = "created_at",
            updatable = false
    )
    private LocalDateTime createdAt;


    /* ==========================================================
       UPDATED AT
    ========================================================== */

    @UpdateTimestamp
    @Column(
            name = "updated_at"
    )
    private LocalDateTime updatedAt;
}