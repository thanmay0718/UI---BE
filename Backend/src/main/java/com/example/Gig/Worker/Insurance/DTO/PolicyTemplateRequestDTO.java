package com.example.Gig.Worker.Insurance.DTO;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyTemplateRequestDTO {
    @NotBlank(message = "Policy name is required")
    private String policyName;

    private String category;
    private String oracleFeed;
    private String description;
    
    private String triggers;

    @NotNull(message = "Premium amount is required")
    @Positive
    private Double premiumAmount;

    @NotNull(message = "Coverage amount is required")
    @Positive
    private Double coverageAmount;

    private Integer aiConfidence;
}
