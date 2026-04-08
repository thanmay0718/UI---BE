package com.example.Gig.Worker.Insurance.Model;

import com.example.Gig.Worker.Insurance.security.EncryptedStringConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "workers")
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Location fields
    private String area;
    private String pincode;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "delivery_segment")
    private String deliverySegment;   // "FOOD", "ECOMMERCE", "GROCERY"

    @Column(name = "avg_income")
    private Double avgIncome;

    // Sensitive fields — AES encrypted before storing in DB
    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "aadhaar_number", columnDefinition = "TEXT")
    private String aadhaarNumber;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "pan_number", columnDefinition = "TEXT")
    private String panNumber;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "bank_account_number", columnDefinition = "TEXT")
    private String bankAccountNumber;

    @Column(name = "bank_name")
    private String bankName;

    // AI computed fields
    @Column(name = "risk_score")
    private Double riskScore;

    @Column(name = "kyc_status")
    private String kycStatus = "PENDING";   // PENDING → VERIFIED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Relationship to User
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.kycStatus = "PENDING";
    }
}