package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.Model.Claim;
import org.springframework.stereotype.Service;

@Service
public class ClaimDecisionEngine {

    public Claim processDecision(Claim claim, boolean disruptionConfirmed, double riskThreshold) {
        
        if (claim.getFraudScore() > 70.0) {
            claim.setDecision("AUTO_REJECTED");
            claim.setStatus("REJECTED");
        } else if (disruptionConfirmed && claim.getRiskScore() > riskThreshold) {
            claim.setDecision("AUTO_APPROVED");
            claim.setStatus("APPROVED");
        } else {
            claim.setDecision("MANUAL_REVIEW");
            claim.setStatus("FLAGGED_FOR_REVIEW");
        }
        
        return claim;
    }
}
