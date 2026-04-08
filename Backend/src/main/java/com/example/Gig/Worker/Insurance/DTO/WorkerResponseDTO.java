package com.example.Gig.Worker.Insurance.DTO;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerResponseDTO {

    private Long id;
    private String username;
    private String email;

    private String area;
    private String pincode;
    private String address;
    private String deliverySegment;
    private Double avgIncome;

    // Always masked in response — never expose raw values
    private String aadhaarNumber;       // shown as XXXX-XXXX-1234
    private String panNumber;           // shown as AB*******F
    private String bankAccountNumber;   // shown as XXXX-XXXX-5678
    private String bankName;

    private Double riskScore;
    private String kycStatus;
    private LocalDateTime createdAt;
    private String message;
    private String role;

    @Builder.Default
    private boolean loggedIn = false;
}