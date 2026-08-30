package com.infosys.carbonfootprint.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "goals", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "target_month", "goal_year"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "target_amount", nullable = false)
    private Double targetAmount;

    @Column(name = "target_emission", nullable = false)
    @Builder.Default
    private Double targetEmission = 0.0;

    @Column(name = "target_month", nullable = false)
    private Integer month;

    @Column(name = "goal_year", nullable = false)
    private Integer year;

    /** Legacy database column retained for compatibility with the existing goals table. */
    @Column(name = "target_year", nullable = false)
    private Integer targetYear;

    @PrePersist
    @PreUpdate
    private void syncTargetYear() {
        this.targetYear = this.year;
        if (this.targetEmission == null) this.targetEmission = this.targetAmount != null ? this.targetAmount : 0.0;
        if (this.status == null || this.status.isBlank()) this.status = "IN PROGRESS";
    }

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "IN PROGRESS";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
