package com.rgreen.servicehub.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class SupportEngineer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String engineerId;

    private String firstName;
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;
    private String department;
    private String specialization;

    private String status = "active";
    private String availability = "available";
    private String password;
}
