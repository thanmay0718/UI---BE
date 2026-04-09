package com.example.Gig.Worker.Insurance.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
    @Entity
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Table(name = "claims")
    public class Claim {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private Long workerId;

        private Long policyId;

        private String description;

        private double amount; // originally requested amount or estimated default

        private String status; // PENDING, APPROVED, REJECTED, FLAGGED_FOR_REVIEW

        private String location; // lat,lon or city

        private Boolean fraudFlag;

        private LocalDateTime claimDate;
        
        // --- AI Integration Fields ---
        
        private Double fraudScore;
        
        private Double riskScore;
        
        private String decision; // AUTO_APPROVED, AUTO_REJECTED, MANUAL_REVIEW
        
        private Double approvedAmount;
        
        private String disruptionType; // RAIN, AQI, ZONE_RESTRICTION
        
        private String triggerSource; // SYSTEM_AUTO_TRIGGER, MANUAL
        
        private LocalDateTime processedAt;

        public void setCreatedAt(LocalDateTime now) {
            this.claimDate = now;
        }
    }
