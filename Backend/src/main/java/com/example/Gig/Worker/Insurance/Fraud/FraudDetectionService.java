package com.example.Gig.Worker.Insurance.Fraud;

import com.example.Gig.Worker.Insurance.Model.Claim;
import com.example.Gig.Worker.Insurance.Repository.ClaimRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FraudDetectionService {

    private final ClaimRepository claimRepository;

    public FraudDetectionService(ClaimRepository claimRepository) {
        this.claimRepository = claimRepository;
    }

    public boolean isDuplicateClaim(Claim newClaim) {
        List<Claim> previousClaims =
                claimRepository.findByWorkerIdAndPolicyId(
                        newClaim.getWorkerId(),
                        newClaim.getPolicyId()
                );
        for (Claim claim : previousClaims) {
            if (Math.abs(claim.getAmount() - newClaim.getAmount()) < 500) {
                return true;
            }
        }
        return false;
    }

    public double calculateFraudScore(Claim claim, String currentLatLon, String claimLatLon) {
        double score = 0.0;

        // 1. Duplicate claim check
        if (isDuplicateClaim(claim)) {
            score += 40.0;
        }

        // 2. Unusual claim frequency
        List<Claim> previousClaims = claimRepository.findByWorkerIdAndPolicyId(claim.getWorkerId(), claim.getPolicyId());
        if (previousClaims.size() > 3) {
            score += 30.0;
        }

        // 3. Location mismatch (GPS spoofing detection) - simple mock string compare for now
        if (currentLatLon != null && claimLatLon != null && !currentLatLon.equalsIgnoreCase(claimLatLon)) {
            score += 30.0;
        }

        // 4. Fake environmental claims (could check API vs claim data, handled by Risk engine mostly, but could add here)
        
        return Math.min(score, 100.0);
    }
}
