package com.example.Gig.Worker.Insurance.DTO;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ClaimResponseDTO {
    private Long id;
    private Long workerId;
    private Long policyId;
    private String description;
    private Double amount;
    private String location;
    private LocalDateTime claimDate;
    private String status;
    private boolean fraudFlag;
    private LocalDateTime updatedAt;
}