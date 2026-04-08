package com.example.Gig.Worker.Insurance.DTO;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyRequestDTO {

    @NotNull(message = "Worker ID is required")
    private Long workerId;

    @NotBlank(message = "Policy type is required")
    private String policyType;

    @NotNull(message = "Premium is required")
    @Positive
    private Double premium;

    @NotNull(message = "Coverage amount is required")
    @Positive
    private Double coverageAmount;

    @NotNull(message = "Duration is required")
    @Positive
    private Integer duration; // IMP

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;
}