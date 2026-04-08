package com.example.Gig.Worker.Insurance.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_scores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Worker ID is required")
    @Column(nullable = false)
    private Long workerId;

    @NotNull(message = "Weather score is required")
    @Min(value = 0, message = "Score cannot be less than 0")
    @Max(value = 100, message = "Score cannot be more than 100")
    private Double weatherScore;

    @NotNull(message = "Zone score is required")
    @Min(value = 0, message = "Score cannot be less than 0")
    @Max(value = 100, message = "Score cannot be more than 100")
    private Double zoneScore;

    @NotNull(message = "History score is required")
    @Min(value = 0, message = "Score cannot be less than 0")
    @Max(value = 100, message = "Score cannot be more than 100")
    private Double historyScore;

    @NotNull(message = "Platform score is required")
    @Min(value = 0, message = "Score cannot be less than 0")
    @Max(value = 100, message = "Score cannot be more than 100")
    private Double platformScore;

    @NotNull(message = "Social score is required")
    @Min(value = 0, message = "Score cannot be less than 0")
    @Max(value = 100, message = "Score cannot be more than 100")
    private Double socialScore;

    @NotNull(message = "Final score is required")
    @Min(value = 0, message = "Score cannot be less than 0")
    @Max(value = 100, message = "Score cannot be more than 100")
    private Double finalScore;

    @NotBlank(message = "Risk level is required")
    @Pattern(regexp = "LOW|MEDIUM|HIGH", message = "Risk level must be LOW, MEDIUM or HIGH")
    private String riskLevel;

    @NotNull(message = "Week start date is required")
    private LocalDate weekStartDate;

    @Column(updatable = false)
    private LocalDateTime calculatedAt;

    @PrePersist
    protected void onCreate() {
        this.calculatedAt = LocalDateTime.now();
        if (this.weekStartDate == null) {
            this.weekStartDate = LocalDate.now();
        }
    }
}