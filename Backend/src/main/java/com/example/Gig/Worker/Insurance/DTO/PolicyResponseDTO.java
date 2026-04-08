package com.example.Gig.Worker.Insurance.DTO;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyResponseDTO {

    private Long id;
    private Long workerId;
    private String policyType;
    private Double premium;
    private Double coverageAmount;
    private Integer duration;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
}