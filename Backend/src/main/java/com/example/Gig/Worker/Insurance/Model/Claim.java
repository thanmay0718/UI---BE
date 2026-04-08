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

        private double amount;

        private String status;

        private String location;

        private Boolean fraudFlag;

        private LocalDateTime claimDate;


        public void setCreatedAt(LocalDateTime now) {
    }
}
