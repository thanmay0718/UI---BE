package com.example.Gig.Worker.Insurance.Model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "policy_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String policyName;
    private String category;
    private String oracleFeed;
    
    @Column(length = 1000)
    private String description;
    
    private String triggers; 

    private Double premiumAmount;
    private Double coverageAmount;
    
    private Integer aiConfidence;
    private LocalDateTime createdAt;
}
