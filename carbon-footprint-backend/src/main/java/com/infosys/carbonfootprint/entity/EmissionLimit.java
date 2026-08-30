package com.infosys.carbonfootprint.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name="emission_limits", uniqueConstraints=@UniqueConstraint(columnNames="category_id"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmissionLimit {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @OneToOne @JoinColumn(name="category_id",nullable=false)
    private Category category;

    @Column(nullable=false)
    private Double monthlyLimit;

    @Column(nullable=false,length=20)
    @Builder.Default
    private String unit="kg CO2e";

    @Column(nullable=false,length=20, columnDefinition="varchar(20) default 'ACTIVE'")
    @Builder.Default
    private String status="ACTIVE";

    @Column(nullable=false)
    @Builder.Default
    private boolean active=true;

    @CreationTimestamp
    @Column(name="created_at", updatable=false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    private void ensureState() {
        if (status == null || status.isBlank()) {
            status = active ? "ACTIVE" : "INACTIVE";
        }
        if (unit == null || unit.isBlank()) {
            unit = "kg CO2e";
        }
    }
}
