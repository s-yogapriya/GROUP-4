package com.infosys.carbonfootprint.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Address Entity normalized to 3NF.
 */
@Entity
@Table(name = "addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "house_number")
    private String houseNumber;

    private String street;

    private String area;

    private String landmark;

    private String city;

    private String state;

    private String country;

    @Column(name = "pin_code", length = 10)
    private String pinCode;
}
