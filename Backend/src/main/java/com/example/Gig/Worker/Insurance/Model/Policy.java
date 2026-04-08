package com.example.Gig.Worker.Insurance.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Worker ID is required")
    private Long workerId;

    @NotBlank(message = "Policy type is required")
    private String policyType;

    @NotNull(message = "Premium is required")
    @Positive(message = "Premium must be greater than 0")
    private Double premium;

    @NotNull(message = "Coverage amount is required")
    @Positive(message = "Coverage must be greater than 0")
    private Double coverageAmount;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Integer duration; // in months

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotBlank(message = "Status is required")
    private String status;
}