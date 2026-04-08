package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.Repository.RiskScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WorkerHistoryRiskService {

    @Autowired
    private RiskScoreRepository riskScoreRepository;

    public double calculate(Long workerId) {
        // More HIGH risk scores in history = higher risk
        int highRiskCount = riskScoreRepository
                .countByWorkerIdAndRiskLevel(workerId, "HIGH");

        if (highRiskCount == 0) return 10.0;      // Clean history
        if (highRiskCount <= 2) return 30.0;      // Low-medium
        if (highRiskCount <= 5) return 60.0;      // Medium
        return 85.0;                              // High risk worker
    }
}