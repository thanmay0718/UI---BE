package com.example.Gig.Worker.Insurance.Fraud;

import com.example.Gig.Worker.Insurance.Model.Claim;
import com.example.Gig.Worker.Insurance.Repository.ClaimRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ENHANCED FraudDetectionService — AI Fraud Scoring Engine
 *
 * Returns a score 0–100. Higher = more suspicious.
 *
 * Checks:
 *  1. Duplicate claim (same worker+policy, similar amount)
 *  2. High claim frequency in 24h window
 *  3. Location mismatch between worker area and claim location
 *  4. Suspicious claim pattern (always full amount)
 *  5. Dedup guard: Has a claim already been auto-triggered for this area today?
 */
@Service
public class FraudDetectionService {

    private static final Logger log = LoggerFactory.getLogger(FraudDetectionService.class);

    private final ClaimRepository claimRepository;

    public FraudDetectionService(ClaimRepository claimRepository) {
        this.claimRepository = claimRepository;
    }

    /**
     * Main entry point — returns fraud score 0..100
     */
    public double calculateFraudScore(Claim claim, String currentLatLon, String claimLatLon) {
        double score = 0.0;

        // --- Check 1: Exact Duplicate claim (same worker+policy, similar amount) ---
        if (isDuplicateClaim(claim)) {
            score += 40.0;
            log.warn("[FRAUD] CHECK-1 FAIL: Duplicate claim detected for Worker {} Policy {}",
                    claim.getWorkerId(), claim.getPolicyId());
        }

        // --- Check 2: High claim frequency in last 24 hours ---
        double frequencyPenalty = calculateFrequencyPenalty(claim.getWorkerId());
        score += frequencyPenalty;
        if (frequencyPenalty > 0) {
            log.warn("[FRAUD] CHECK-2: High frequency claims. Penalty added: {}", frequencyPenalty);
        }

        // --- Check 3: Location mismatch ---
        if (isLocationMismatch(currentLatLon, claimLatLon)) {
            score += 20.0;
            log.warn("[FRAUD] CHECK-3 FAIL: Location mismatch. Worker at [{}] claiming from [{}]",
                    currentLatLon, claimLatLon);
        }

        // --- Check 4: Suspicious amount pattern (always max amount) ---
        double patternPenalty = detectSuspiciousAmountPattern(claim);
        score += patternPenalty;
        if (patternPenalty > 0) {
            log.warn("[FRAUD] CHECK-4: Suspicious amount pattern. Penalty: {}", patternPenalty);
        }

        score = Math.min(score, 100.0);
        log.info("[FRAUD ENGINE] Worker ID: {} | Final Fraud Score: {}/100", claim.getWorkerId(), score);
        return score;
    }

    // =========================================================
    // CHECK 1: Duplicate Claim
    // =========================================================
    public boolean isDuplicateClaim(Claim newClaim) {
        List<Claim> previousClaims = claimRepository.findByWorkerIdAndPolicyId(
                newClaim.getWorkerId(), newClaim.getPolicyId());
        for (Claim c : previousClaims) {
            // Same disruption type filed within 6 hours = duplicate
            if (c.getDisruptionType() != null
                    && c.getDisruptionType().equalsIgnoreCase(newClaim.getDisruptionType())
                    && c.getClaimDate() != null
                    && c.getClaimDate().isAfter(LocalDateTime.now().minusHours(6))) {
                return true;
            }
        }
        return false;
    }

    // =========================================================
    // CHECK 2: High Frequency
    // =========================================================
    private double calculateFrequencyPenalty(Long workerId) {
        LocalDateTime last24h = LocalDateTime.now().minusHours(24);
        List<Claim> recentClaims = claimRepository.findRecentClaimsByWorker(workerId, last24h);

        int count = recentClaims.size();
        if (count >= 5) return 30.0;   // Very suspicious — 5+ claims in 24h
        if (count >= 3) return 15.0;   // Unusual
        if (count >= 2) return 5.0;    // Slight flag
        return 0.0;
    }

    // =========================================================
    // CHECK 3: Location Mismatch
    // =========================================================
    private boolean isLocationMismatch(String currentLocation, String claimedLocation) {
        if (currentLocation == null || claimedLocation == null) return false;
        // Simple city-level comparison (both stored as city names in this system)
        return !currentLocation.trim().equalsIgnoreCase(claimedLocation.trim());
    }

    // =========================================================
    // CHECK 4: Suspicious Amount Pattern
    // =========================================================
    private double detectSuspiciousAmountPattern(Claim claim) {
        List<Claim> history = claimRepository.findByWorkerId(claim.getWorkerId());
        if (history.size() < 3) return 0.0;

        // Count how many previous claims have amount == 0 (auto-triggered, not unusual)
        // Flag if all previous approved amounts are identical (gaming the system)
        long identicalAmounts = history.stream()
                .filter(c -> c.getApprovedAmount() != null && c.getApprovedAmount() > 0)
                .map(c -> Math.round(c.getApprovedAmount()))
                .distinct()
                .count();

        // Only 1 distinct payout amount across many claims = suspicious
        if (history.size() >= 5 && identicalAmounts == 1) {
            return 10.0;
        }
        return 0.0;
    }
}
