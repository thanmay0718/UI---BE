package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.Fraud.FraudDetectionService;
import com.example.Gig.Worker.Insurance.Model.Claim;
import com.example.Gig.Worker.Insurance.Model.Payment;
import com.example.Gig.Worker.Insurance.Model.Worker;
import com.example.Gig.Worker.Insurance.Repository.ClaimRepository;
import com.example.Gig.Worker.Insurance.Repository.PaymentRepository;
import com.example.Gig.Worker.Insurance.Repository.WorkerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║        AIOrchestrationService — The Central AI Brain         ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║                                                              ║
 * ║  PIPELINE:                                                   ║
 * ║  TriggerEngine → RiskAggregation → FraudDetection           ║
 * ║               → ClaimDecision → PaymentCalculation          ║
 * ║               → PaymentService → Audit                      ║
 * ║                                                              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
@Service
public class AIOrchestrationService {

    private static final Logger log = LoggerFactory.getLogger(AIOrchestrationService.class);

    @Autowired private ClaimRepository       claimRepository;
    @Autowired private WorkerRepository      workerRepository;
    @Autowired private PaymentRepository     paymentRepository;
    @Autowired private RiskAggregationService riskAggregationService;
    @Autowired private FraudDetectionService  fraudDetectionService;
    @Autowired private ClaimDecisionEngine    claimDecisionEngine;
    @Autowired private PaymentCalculationService paymentCalculationService;

    // =========================================================
    // MAIN PIPELINE ENTRY POINT
    // =========================================================

    /**
     * Processes a claim through the full AI pipeline synchronously.
     * Called from TriggerEngineService (which is @Async itself).
     *
     * @param claim          the skeleton claim created by TriggerEngine
     * @param lostHours      estimated working hours lost due to disruption
     * @param workerLocation the worker's actual location (for fraud location check)
     * @return the fully processed & persisted Claim
     */
    @Transactional
    public Claim processAutomatedClaim(Claim claim, int lostHours, String workerLocation) {

        log.info("╔══ [AI PIPELINE STARTED] ══ Worker={} | Disruption={} | LostHours={}",
                claim.getWorkerId(), claim.getDisruptionType(), lostHours);

        // ── STEP 0: Save skeleton claim so it gets an ID ──────────────────
        claim.setStatus("PENDING");
        claim.setClaimDate(LocalDateTime.now());
        claim = claimRepository.save(claim);
        log.info("║ [STEP 0] Claim skeleton persisted. ClaimID={}", claim.getId());

        // ── STEP 1: Validate worker exists ────────────────────────────────
        Worker worker = workerRepository.findById(claim.getWorkerId()).orElse(null);
        if (worker == null) {
            log.error("║ [STEP 1] FAIL — Worker not found. Rejecting claim.");
            return rejectClaim(claim, "WORKER_NOT_FOUND");
        }
        log.info("║ [STEP 1] Worker verified: {} | Area={}", worker.getId(), worker.getArea());

        // ── STEP 2: Risk Aggregation ──────────────────────────────────────
        String city = (worker.getWorkingCity() != null) ? worker.getWorkingCity() : worker.getArea();
        String zone = (worker.getWorkingZone() != null) ? worker.getWorkingZone() : "URBAN";

        RiskAggregationService.RiskBreakdown riskBreakdown =
                riskAggregationService.calculateRiskBreakdown(city, zone, worker.getId());
        double riskScore = riskBreakdown.totalScore;
        claim.setRiskScore(riskScore);
        log.info("║ [STEP 2] Risk Score={} ({})", String.format("%.2f", riskScore), riskBreakdown.riskLevel);

        // ── STEP 3: Fraud Detection ───────────────────────────────────────
        double fraudScore = fraudDetectionService.calculateFraudScore(
                claim, workerLocation, claim.getLocation());
        claim.setFraudScore(fraudScore);
        log.info("║ [STEP 3] Fraud Score={}/100", String.format("%.1f", fraudScore));

        // ── STEP 4: Decision Engine ───────────────────────────────────────
        // Disruption is confirmed if risk score exceeds 50 threshold
        boolean disruptionConfirmed = riskScore >= 50.0;
        claim = claimDecisionEngine.processDecision(claim, disruptionConfirmed, 50.0);
        log.info("║ [STEP 4] Decision={} | Status={}", claim.getDecision(), claim.getStatus());

        // ── STEP 5 & 6: Payment Calculation + Auto-Trigger ───────────────
        if ("APPROVED".equals(claim.getStatus())) {
            double approvedAmount = paymentCalculationService.calculateApprovedAmount(claim, lostHours);
            claim.setApprovedAmount(approvedAmount);
            log.info("║ [STEP 5] Parametric Payout Calculated: ₹{}", String.format("%.2f", approvedAmount));

            // ── STEP 7: Trigger Payment ───────────────────────────────────
            boolean paymentSuccess = triggerInstantPayment(claim, approvedAmount);
            log.info("║ [STEP 6] Payment Triggered: {}", paymentSuccess ? "SUCCESS" : "FAILED");
        } else {
            claim.setApprovedAmount(0.0);
            log.info("║ [STEP 5] Claim not approved — no payment triggered.");
        }

        // ── STEP 7: Persist final state ───────────────────────────────────
        claim.setProcessedAt(LocalDateTime.now());
        Claim saved = claimRepository.save(claim);

        log.info("╚══ [AI PIPELINE COMPLETED] ══ ClaimID={} | Decision={} | Payout=₹{}",
                saved.getId(), saved.getDecision(),
                saved.getApprovedAmount() != null ? String.format("%.2f", saved.getApprovedAmount()) : "0.00");

        return saved;
    }

    // =========================================================
    // @Async overload — for fire-and-forget from REST trigger
    // =========================================================
    @Async
    public void processAutomatedClaimAsync(Claim claim, int lostHours, String workerLocation) {
        try {
            processAutomatedClaim(claim, lostHours, workerLocation);
        } catch (Exception e) {
            log.error("[AI PIPELINE] Async processing failed for Worker={}: {}",
                    claim.getWorkerId(), e.getMessage(), e);
        }
    }

    // =========================================================
    // Payment execution
    // =========================================================
    private boolean triggerInstantPayment(Claim claim, double amount) {
        try {
            Payment payment = Payment.builder()
                    .workerId(claim.getWorkerId())
                    .policyId(claim.getPolicyId())
                    .amount(BigDecimal.valueOf(amount))
                    .paymentType("PAYOUT")
                    .paymentMethod("SYSTEM_AUTO_TRANSFER")
                    .currency("INR")
                    .status("SUCCESS")
                    .notes("AUTO_PAYOUT | ClaimID=" + claim.getId()
                            + " | Disruption=" + claim.getDisruptionType()
                            + " | TxnRef=GIGS-" + System.currentTimeMillis())
                    .build();

            Payment saved = paymentRepository.save(payment);
            log.info("[PAYMENT] Payment record created. PaymentID={} | Amount=₹{} | Status={}",
                    saved.getId(), amount, saved.getStatus());
            return true;
        } catch (Exception e) {
            log.error("[PAYMENT] Payment trigger failed for ClaimID={}: {}", claim.getId(), e.getMessage());
            return false;
        }
    }

    // =========================================================
    // Helpers
    // =========================================================
    private Claim rejectClaim(Claim claim, String reason) {
        claim.setStatus("REJECTED");
        claim.setDecision(reason);
        claim.setApprovedAmount(0.0);
        claim.setFraudScore(0.0);
        claim.setRiskScore(0.0);
        claim.setProcessedAt(LocalDateTime.now());
        return claimRepository.save(claim);
    }
}
