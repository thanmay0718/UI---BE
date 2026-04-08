package com.example.Gig.Worker.Insurance.DTO;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ClaimRequestDTO {

    @NotNull(message = "Worker ID is required")
    @Positive(message = "Worker ID must be a positive number")
    private Long workerId;

    @NotNull(message = "Policy ID is required")
    @Positive(message = "Policy ID must be a positive number")
    private Long policyId;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 300, message = "Description must be between 10 and 300 characters")
    private String description;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than 0")
    @Max(value = 1000000, message = "Amount cannot exceed 10,00,000")
    private Double amount;

    @NotBlank(message = "Location is required")
    @Size(min = 3, max = 100, message = "Location must be between 3 and 100 characters")
    private String location;
}