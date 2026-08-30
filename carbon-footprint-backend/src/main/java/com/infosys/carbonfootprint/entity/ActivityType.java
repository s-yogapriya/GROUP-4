package com.infosys.carbonfootprint.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "activity_types")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActivityType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "activity_type_id")
    private Long activityTypeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "activity_code", nullable = false, unique = true, length = 20)
    private String activityCode;

    @Column(name = "activity_name", nullable = false, length = 100)
    private String activityName;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(name = "min_quantity")
    private Double minQuantity;

    @Column(name = "max_quantity")
    private Double maxQuantity;

    @Column(name = "default_quantity")
    private Double defaultQuantity;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(length = 50)
    private String icon;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CategoryStatus status = CategoryStatus.ACTIVE;

    @Column(length = 500)
    private String remarks;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "activityType", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<EmissionFactor> emissionFactors = new ArrayList<>();
}
