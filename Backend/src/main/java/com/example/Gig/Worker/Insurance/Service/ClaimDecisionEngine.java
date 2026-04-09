package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.Model.Claim;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * ClaimDecisionEngine — AI Decision Logic
 *
 * Decision matrix:
 *   fraud_score > 70             → AUTO_REJECTED
 *   disruption valid + risk > 50 → AUTO_APPROVED
 *   otherwise                    → MANUAL_REVIEW (FLAGGED_FOR_REVIEW)
 *
 * Also handles edge cases: high fraud but borderline risk, etc.
 */
@Service
public class ClaimDecisionEngine {

    private static final Logger log = LoggerFactory.getLogger(ClaimDecisionEngine.class);

    private static final double FRAUD_REJECT_THRESHOLD   = 70.0;
    private static final double RISK_APPROVE_THRESHOLD   = 50.0;
    private static final double RISK_AUTO_FLAG_THRESHOLD = 30.0;

    /**
     * Process and set decision + status on the claim.
     *
     * @param claim               the claim (with fraudScore and riskScore already set)
     * @param disruptionConfirmed whether the disruption was externally confirmed
     * @param riskThreshold       dynamic threshold (can be passed as 50.0)
     * @return the mutated claim
     */
    public Claim processDecision(Claim claim, boolean disruptionConfirmed, double riskThreshold) {

        double fraud = claim.getFraudScore() != null ? claim.getFraudScore() : 0.0;
        double risk  = claim.getRiskScore()  != null ? claim.getRiskScore()  : 0.0;

        // ── RULE 1: High fraud → always reject ──────────────────────────────
        if (fraud > FRAUD_REJECT_THRESHOLD) {
            apply(claim, "AUTO_REJECTED", "REJECTED",
                    String.format("Rejected: fraud score %.1f exceeds threshold %.1f", fraud, FRAUD_REJECT_THRESHOLD));
            return claim;
        }

        // ── RULE 2: Moderate fraud + low risk → flag for manual review ───────
        if (fraud >= 40.0 && risk < RISK_APPROVE_THRESHOLD) {
            apply(claim, "MANUAL_REVIEW", "FLAGGED_FOR_REVIEW",
                    String.format("Flagged: moderate fraud=%.1f and risk=%.1f below threshold", fraud, risk));
            return claim;
        }

        // ── RULE 3: Disruption confirmed + risk is sufficient → approve ──────
        if (disruptionConfirmed && risk >= riskThreshold) {
            apply(claim, "AUTO_APPROVED", "APPROVED",
                    String.format("Approved: disruption confirmed, risk=%.1f, fraud=%.1f", risk, fraud));
            return claim;
        }

        // ── RULE 4: Disruption confirmed but risk is low → flag ─────────────
        if (disruptionConfirmed && risk >= RISK_AUTO_FLAG_THRESHOLD) {
            apply(claim, "MANUAL_REVIEW", "FLAGGED_FOR_REVIEW",
                    String.format("Flagged: disruption confirmed but risk=%.1f too low to auto-approve", risk));
            return claim;
        }

        // ── RULE 5: No disruption evidence → reject ──────────────────────────
        apply(claim, "AUTO_REJECTED", "REJECTED",
                String.format("Rejected: no disruption confirmed and risk=%.1f insufficient", risk));
        return claim;
    }

    private void apply(Claim claim, String decision, String status, String reason) {
        claim.setDecision(decision);
        claim.setStatus(status);
        log.info("[DECISION ENGINE] Claim ID={} | Worker={} | Decision={} | Status={} | Reason={}",
                claim.getId(), claim.getWorkerId(), decision, status, reason);
    }
}
