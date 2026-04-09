package com.example.Gig.Worker.Insurance.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "risk_score_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskScoreHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "worker_id", nullable = false)
    private Long workerId;

    @Column(name = "weather_score")
    private Double weatherScore;

    @Column(name = "aqi_score")
    private Double aqiScore;

    @Column(name = "overall_score")
    private Double overallScore;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;
}
