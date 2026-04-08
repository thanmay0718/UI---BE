package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.DTO.RiskFactorsDTO;
import com.example.Gig.Worker.Insurance.Model.RiskScore;
import com.example.Gig.Worker.Insurance.Repository.RiskScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class RiskScoreService {

    @Autowired
    private WeatherRiskScore weatherRiskScore;

    @Autowired
    private ZoneRiskService zoneRiskService;

    @Autowired
    private WorkerHistoryRiskService workerHistoryRiskService;

    @Autowired
    private PlatformRiskService platformRiskService;

    @Autowired
    private SocialRiskService socialRiskService;

    @Autowired
    private RiskScoreRepository riskScoreRepository;

    public RiskFactorsDTO calculateRisk(Long workerId, String city,
                                     String zone, String platform) {

        // Step 1 — Calculate each factor (0-100)
        double weather  = weatherRiskScore.calculate(city);
        double zoneS    = zoneRiskService.calculate(zone);
        double history  = workerHistoryRiskService.calculate(workerId);
        double platf    = platformRiskService.calculate(platform);
        double social   = socialRiskService.calculate(city);

        // Step 2 — Apply weights to get Final Score
        double finalScore = (weather * 0.30) +
                (zoneS   * 0.20) +
                (history * 0.20) +
                (platf   * 0.15) +
                (social  * 0.15);

        // Step 3 — Determine Risk Level
        String riskLevel = finalScore <= 30 ? "LOW" :
                finalScore <= 60 ? "MEDIUM" : "HIGH";

        // Step 4 — Calculate Weekly Premium based on Risk Level
        double weeklyPremium = riskLevel.equals("LOW")    ? 49.0  :
                riskLevel.equals("MEDIUM") ? 79.0  : 119.0;

        // Step 5 — Build message
        String message = String.format(
                "Risk assessment complete. Final Score: %.1f | Level: %s | Weekly Premium: ₹%.0f",
                finalScore, riskLevel, weeklyPremium
        );

        // Step 6 — Save to DB
        RiskScore riskScore = RiskScore.builder()
                .workerId(workerId)
                .weatherScore(weather)
                .zoneScore(zoneS)
                .historyScore(history)
                .platformScore(platf)
                .socialScore(social)
                .finalScore(finalScore)
                .riskLevel(riskLevel)
                .weekStartDate(LocalDate.now())
                .calculatedAt(LocalDateTime.now())
                .build();

        riskScoreRepository.save(riskScore);

        // Step 7 — Return DTO to controller
        return RiskFactorsDTO.builder()
                .workerId(workerId)
                .weatherScore(weather)
                .zoneScore(zoneS)
                .historyScore(history)
                .platformScore(platf)
                .socialScore(social)
                .finalScore(finalScore)
                .riskLevel(riskLevel)
                .weeklyPremium(weeklyPremium)
                .message(message)
                .build();
    }
}

/*
* ## What this does step by step:
```
Step 1 → Calls all 5 factor services
Step 2 → Applies weights → Final Score (0-100)
Step 3 → LOW / MEDIUM / HIGH
Step 4 → ₹49 / ₹79 / ₹119 weekly premium
Step 5 → Builds a readable message
Step 6 → Saves to DB
Step 7 → Returns RiskFactors DTO to controller
*/