package com.example.Gig.Worker.Insurance.DTO;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskFactorsDTO {

    private Long workerId;
    private Double weatherScore;
    private Double zoneScore;
    private Double historyScore;
    private Double platformScore;
    private Double socialScore;
    private Double finalScore;
    private String riskLevel;
    private Double weeklyPremium;
    private String message;
}