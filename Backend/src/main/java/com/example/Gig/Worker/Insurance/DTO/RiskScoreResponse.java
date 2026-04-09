package com.example.Gig.Worker.Insurance.DTO;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class RiskScoreResponse {
    private double weatherScore;
    private double aqiScore;
    private double overallScore;
    private String label;
    private String city;
    private LocalDateTime timestamp;

    // Fields consumed by the frontend Risk Intelligence cards
    private double riskMultiplier;   // e.g. 1.8x risk vs baseline
    private double triggerValue;     // e.g. mm of rain, AQI number
    private double threshold;        // parametric trigger threshold
    private String condition;        // e.g. "Rain", "Thunderstorm", "Clear"
    private String description;      // Human-readable description from external API
}
