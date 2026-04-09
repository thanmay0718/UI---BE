package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.Model.Claim;
import com.example.Gig.Worker.Insurance.Model.Policy;
import com.example.Gig.Worker.Insurance.Model.Worker;
import com.example.Gig.Worker.Insurance.Repository.ClaimRepository;
import com.example.Gig.Worker.Insurance.Repository.PolicyRepository;
import com.example.Gig.Worker.Insurance.Repository.WorkerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * TriggerEngineService — Automated Claim Creation
 *
 * Responsibilities:
 *  1. Receive disruption event (area + type + hours)
 *  2. Find all workers in that area who have an active policy
 *  3. Guard against duplicate auto-triggers (same area + disruption within 3h)
 *  4. Create claim skeleton and forward to AIOrchestrationService
 */
@Service
public class TriggerEngineService {

    private static final Logger log = LoggerFactory.getLogger(TriggerEngineService.class);

    /** Dedup guard — don't re-trigger same area+disruption within 3 hours */
    private static final int DEDUP_WINDOW_HOURS = 3;

    @Autowired private WorkerRepository       workerRepository;
    @Autowired private PolicyRepository       policyRepository;
    @Autowired private ClaimRepository        claimRepository;
    @Autowired private AIOrchestrationService aiOrchestrationService;

    // =========================================================
    // MAIN TRIGGER — @Async so REST returns immediately
    // =========================================================

    /**
     * Fire-and-forget entry point called from the REST controller or scheduler.
     *
     * @param area          city/area name (must match worker.area)
     * @param disruptionType e.g. "RAIN", "AQI", "STRIKE", "CURFEW"
     * @param lostHours     estimated hours of income loss
     */
    @Async
    public void triggerDisruptionEvent(String area, String disruptionType, int lostHours) {

        log.info("╔══ [TRIGGER ENGINE] ══ Event: {} | Area: {} | LostHours: {}",
                disruptionType, area, lostHours);

        // ── Dedup guard ───────────────────────────────────────────────────
        LocalDateTime dedupSince = LocalDateTime.now().minusHours(DEDUP_WINDOW_HOURS);
        long existingAutoTriggers = claimRepository.countAutoClaimsForAreaSince(area, dedupSince);
        if (existingAutoTriggers > 0) {
            log.warn("║ [TRIGGER ENGINE] DEDUP: Auto-claims already raised for {} in last {}h. Skipping.",
                    area, DEDUP_WINDOW_HOURS);
            return;
        }

        // ── Find affected workers ─────────────────────────────────────────
        List<Worker> allWorkers = workerRepository.findAll();
        List<Worker> affectedWorkers = allWorkers.stream()
                .filter(w -> {
                    String workerArea = w.getWorkingCity() != null ? w.getWorkingCity() : w.getArea();
                    return workerArea != null && workerArea.equalsIgnoreCase(area);
                })
                .toList();

        log.info("║ [TRIGGER ENGINE] Found {} worker(s) in area '{}'", affectedWorkers.size(), area);

        if (affectedWorkers.isEmpty()) {
            log.warn("╚══ [TRIGGER ENGINE] No workers found in area '{}'. No claims created.", area);
            return;
        }

        int claimsCreated = 0;
        for (Worker worker : affectedWorkers) {
            // Only workers with ACTIVE policy get auto-claims
            List<Policy> policies = policyRepository.findByWorkerId(worker.getId());
            List<Policy> activePolicies = policies.stream()
                    .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus()))
                    .toList();

            if (activePolicies.isEmpty()) {
                log.debug("║ [TRIGGER ENGINE] Worker {} has no ACTIVE policy — skipping.", worker.getId());
                continue;
            }

            Policy policy = activePolicies.get(0);

            // ── Build claim skeleton ──────────────────────────────────────
            Claim claim = new Claim();
            claim.setWorkerId(worker.getId());
            claim.setPolicyId(policy.getId());
            claim.setDescription("Auto-triggered parametric claim: " + disruptionType + " in " + area);
            claim.setAmount(0.0);     // AI calculates actual amount
            claim.setLocation(area);  // Worker's current area
            claim.setFraudFlag(false);
            claim.setTriggerSource("SYSTEM_AUTO_TRIGGER");
            claim.setDisruptionType(disruptionType);

            // ── Forward to AI Pipeline ────────────────────────────────────
            log.info("║ [TRIGGER ENGINE] Sending claim to AI pipeline → Worker={} Policy={}",
                    worker.getId(), policy.getId());
            aiOrchestrationService.processAutomatedClaimAsync(claim, lostHours, area);
            claimsCreated++;
        }

        log.info("╚══ [TRIGGER ENGINE] Done. {} auto-claim(s) dispatched to AI pipeline.", claimsCreated);
    }
}
