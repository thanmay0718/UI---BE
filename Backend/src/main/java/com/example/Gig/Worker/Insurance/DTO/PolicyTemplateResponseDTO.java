package com.example.Gig.Worker.Insurance.DTO;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyTemplateResponseDTO {
    private Long id;
    private String policyName;
    private String category;
    private String oracleFeed;
    private String description;
    private String triggers;
    private Double premiumAmount;
    private Double coverageAmount;
    private Integer aiConfidence;
    private LocalDateTime createdAt;
}
