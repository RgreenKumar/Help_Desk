package com.rgreen.servicehub.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String ticketId;

    private String subject;

    @Column(length = 2000)
    private String description;

    private String category;
    private String subcategory;

    private String priority;
    private String status;

    private String employeeName;
    private String employeeDepartment;
    private String employeeEmail;

    private String assignedEngineer;

    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private LocalDateTime closedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
}