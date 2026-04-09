package com.example.Gig.Worker.Insurance.Controller;

import com.example.Gig.Worker.Insurance.Model.Claim;
import com.example.Gig.Worker.Insurance.Repository.ClaimRepository;
import com.example.Gig.Worker.Insurance.Service.AIOrchestrationService;
import com.example.Gig.Worker.Insurance.Service.DisruptionSchedulerService;
import com.example.Gig.Worker.Insurance.Service.RiskAggregationService;
import com.example.Gig.Worker.Insurance.Service.TriggerEngineService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AIIntegrationController — REST API for the AI Orchestration Layer
 *
 * Endpoints:
 *   POST /api/ai/trigger-event          — fire a disruption event (async)
 *   POST /api/ai/trigger-event/sync     — fire & wait for result (demo mode)
 *   GET  /api/ai/risk-score             — inspect risk breakdown for a worker
 *   POST /api/ai/scan-city              — manually run env scan for a city
 *   GET  /api/ai/audit/claims           — view all auto-triggered claims
 *   GET  /api/ai/audit/claims/{id}      — view single claim AI audit trail
 *   GET  /api/ai/audit/decisions        — summarise decisions (counts)
 *   GET  /api/ai/demo/simulate-rain     — one-shot demo: heavy rain → payout
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://localhost:8080"})
public class AIIntegrationController {

    private static final Logger log = LoggerFactory.getLogger(AIIntegrationController.class);

    @Autowired private TriggerEngineService       triggerEngineService;
    @Autowired private RiskAggregationService     riskAggregationService;
    @Autowired private AIOrchestrationService     aiOrchestrationService;
    @Autowired private DisruptionSchedulerService schedulerService;
    @Autowired private ClaimRepository            claimRepository;

    // =========================================================
    // 1. TRIGGER — async (returns immediately)
    // =========================================================
    /**
     * POST /api/ai/trigger-event
     * Body: { "area": "Mumbai", "disruptionType": "RAIN", "lostHours": 4 }
     */
    @PostMapping("/trigger-event")
    public ResponseEntity<Map<String, Object>> triggerEvent(@RequestBody Map<String, Object> body) {
        String area          = (String) body.getOrDefault("area", "Mumbai");
        String disruptionType = (String) body.getOrDefault("disruptionType", "RAIN");
        int    lostHours     = getInt(body, "lostHours", 4);

        log.info("[AI CONTROLLER] Trigger event received: {} in {} for {} hours",
                disruptionType, area, lostHours);

        triggerEngineService.triggerDisruptionEvent(area, disruptionType, lostHours);

        return ResponseEntity.accepted().body(Map.of(
            "status",        "ACCEPTED",
            "message",       "AI Trigger Engine activated. Processing auto-claims in background.",
            "area",          area,
            "disruptionType", disruptionType,
            "lostHours",     lostHours,
            "timestamp",      LocalDateTime.now().toString()
        ));
    }

    // =========================================================
    // 2. TRIGGER — synchronous (waits for result, good for demo)
    // =========================================================
    /**
     * POST /api/ai/trigger-event/sync
     * Body: { "workerId": 1, "policyId": 1, "area": "Mumbai",
     *         "disruptionType": "RAIN", "lostHours": 4 }
     *
     * Directly creates and processes ONE claim synchronously for demo.
     */
    @PostMapping("/trigger-event/sync")
    public ResponseEntity<Map<String, Object>> triggerEventSync(@RequestBody Map<String, Object> body) {
        String area           = (String) body.getOrDefault("area", "Mumbai");
        String disruptionType = (String) body.getOrDefault("disruptionType", "RAIN");
        int    lostHours      = getInt(body, "lostHours", 4);
        Long   workerId       = getLong(body, "workerId");
        Long   policyId       = getLong(body, "policyId");

        if (workerId == null || policyId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "workerId and policyId are required for sync trigger"
            ));
        }

        log.info("[AI CONTROLLER] SYNC trigger: worker={} policy={} disruption={}", workerId, policyId, disruptionType);

        // Build skeleton claim and run pipeline synchronously
        Claim claim = new Claim();
        claim.setWorkerId(workerId);
        claim.setPolicyId(policyId);
        claim.setDescription("Sync-triggered demo claim: " + disruptionType + " in " + area);
        claim.setAmount(0.0);
        claim.setLocation(area);
        claim.setFraudFlag(false);
        claim.setTriggerSource("SYSTEM_AUTO_TRIGGER");
        claim.setDisruptionType(disruptionType);

        Claim result = aiOrchestrationService.processAutomatedClaim(claim, lostHours, area);

        return ResponseEntity.ok(buildClaimAuditMap(result));
    }

    // =========================================================
    // 3. RISK SCORE — inspect breakdown
    // =========================================================
    /**
     * GET /api/ai/risk-score?city=Mumbai&workerId=1&zone=URBAN
     */
    @GetMapping("/risk-score")
    public ResponseEntity<Map<String, Object>> getRiskScore(
            @RequestParam String city,
            @RequestParam Long workerId,
            @RequestParam(defaultValue = "URBAN") String zone) {

        RiskAggregationService.RiskBreakdown bd =
                riskAggregationService.calculateRiskBreakdown(city, zone, workerId);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("city",           city);
        response.put("workerId",        workerId);
        response.put("zone",            zone);
        response.put("breakdown",       bd.toMap());
        response.put("recommendation",  bd.totalScore >= 70 ? "TRIGGER_ELIGIBLE"
                                      : bd.totalScore >= 50 ? "MONITOR"
                                      : "NO_ACTION");
        return ResponseEntity.ok(response);
    }

    // =========================================================
    // 4. MANUAL ENV SCAN (for demo)
    // =========================================================
    /**
     * POST /api/ai/scan-city
     * Body: { "city": "Mumbai" }
     */
    @PostMapping("/scan-city")
    public ResponseEntity<Map<String, Object>> manualCityScan(@RequestBody Map<String, Object> body) {
        String city = (String) body.getOrDefault("city", "Mumbai");
        schedulerService.runManualScanForCity(city);
        return ResponseEntity.ok(Map.of(
            "status",  "SCAN_COMPLETE",
            "city",    city,
            "message", "Environmental scan finished. Check logs for trigger decisions."
        ));
    }

    // =========================================================
    // 5. AUDIT — all auto claims
    // =========================================================
    /**
     * GET /api/ai/audit/claims?source=SYSTEM_AUTO_TRIGGER
     */
    @GetMapping("/audit/claims")
    public ResponseEntity<List<Map<String, Object>>> auditAllClaims(
            @RequestParam(defaultValue = "SYSTEM_AUTO_TRIGGER") String source) {

        List<Claim> claims = claimRepository.findByTriggerSource(source);
        List<Map<String, Object>> result = claims.stream()
                .map(this::buildClaimAuditMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/ai/audit/claims/{id}
     */
    @GetMapping("/audit/claims/{id}")
    public ResponseEntity<?> auditClaim(@PathVariable Long id) {
        return claimRepository.findById(id)
                .map(c -> ResponseEntity.ok(buildClaimAuditMap(c)))
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================================================
    // 6. AUDIT — decision summary
    // =========================================================
    /**
     * GET /api/ai/audit/decisions
     */
    @GetMapping("/audit/decisions")
    public ResponseEntity<Map<String, Object>> auditDecisions() {
        List<Claim> all = claimRepository.findAll();
        Map<String, Long> summary = all.stream()
                .filter(c -> c.getDecision() != null)
                .collect(Collectors.groupingBy(Claim::getDecision, Collectors.counting()));

        long total    = all.size();
        long approved = all.stream().filter(c -> "APPROVED".equals(c.getStatus())).count();
        long rejected = all.stream().filter(c -> "REJECTED".equals(c.getStatus())).count();
        long flagged  = all.stream().filter(c -> "FLAGGED_FOR_REVIEW".equals(c.getStatus())).count();
        long pending  = all.stream().filter(c -> "PENDING".equals(c.getStatus())).count();

        double totalPayout = all.stream()
                .filter(c -> c.getApprovedAmount() != null)
                .mapToDouble(Claim::getApprovedAmount)
                .sum();

        return ResponseEntity.ok(Map.of(
            "totalClaims",      total,
            "approved",         approved,
            "rejected",         rejected,
            "flaggedForReview", flagged,
            "pending",          pending,
            "totalPayout",      String.format("₹%.2f", totalPayout),
            "decisionBreakdown", summary
        ));
    }

    // =========================================================
    // 7. DEMO — one-shot heavy rain simulation
    // =========================================================
    /**
     * GET /api/ai/demo/simulate-rain?workerId=1&policyId=1&city=Mumbai
     *
     * Instant demo: simulates heavy rain → creates claim → AI evaluates → payout.
     */
    @GetMapping("/demo/simulate-rain")
    public ResponseEntity<Map<String, Object>> simulateRainDemo(
            @RequestParam Long workerId,
            @RequestParam Long policyId,
            @RequestParam(defaultValue = "Mumbai") String city) {

        log.info("🌧  [DEMO] Simulating RAIN disruption → Worker={} Policy={} City={}", workerId, policyId, city);

        Claim claim = new Claim();
        claim.setWorkerId(workerId);
        claim.setPolicyId(policyId);
        claim.setDescription("DEMO: Heavy rain disruption simulation in " + city);
        claim.setAmount(0.0);
        claim.setLocation(city);
        claim.setFraudFlag(false);
        claim.setTriggerSource("SYSTEM_AUTO_TRIGGER");
        claim.setDisruptionType("RAIN");

        Claim result = aiOrchestrationService.processAutomatedClaim(claim, 4, city);

        Map<String, Object> demoResult = new LinkedHashMap<>();
        demoResult.put("demoScenario",   "Heavy Rain → Auto Claim → AI Evaluation → Instant Payout");
        demoResult.put("triggerEvent",   "RAIN detected in " + city);
        demoResult.put("claimResult",    buildClaimAuditMap(result));
        demoResult.put("interviewLine",  "GigShield AI automatically processed a parametric insurance claim in real-time using risk scoring, fraud detection, and instant payout — zero manual intervention.");

        return ResponseEntity.ok(demoResult);
    }

    // =========================================================
    // Helpers
    // =========================================================
    private Map<String, Object> buildClaimAuditMap(Claim claim) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("claimId",        claim.getId());
        m.put("workerId",       claim.getWorkerId());
        m.put("policyId",       claim.getPolicyId());
        m.put("disruptionType", claim.getDisruptionType());
        m.put("triggerSource",  claim.getTriggerSource());
        m.put("location",       claim.getLocation());
        m.put("riskScore",      claim.getRiskScore());
        m.put("fraudScore",     claim.getFraudScore());
        m.put("decision",       claim.getDecision());
        m.put("status",         claim.getStatus());
        m.put("approvedAmount", claim.getApprovedAmount() != null
                ? String.format("₹%.2f", claim.getApprovedAmount()) : "₹0.00");
        m.put("claimDate",      claim.getClaimDate());
        m.put("processedAt",    claim.getProcessedAt());
        m.put("description",    claim.getDescription());
        return m;
    }

    private int getInt(Map<String, Object> map, String key, int def) {
        Object val = map.get(key);
        if (val == null) return def;
        if (val instanceof Integer) return (Integer) val;
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return def; }
    }

    private Long getLong(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null) return null;
        if (val instanceof Long)    return (Long) val;
        if (val instanceof Integer) return ((Integer) val).longValue();
        try { return Long.parseLong(val.toString()); } catch (Exception e) { return null; }
    }
}
