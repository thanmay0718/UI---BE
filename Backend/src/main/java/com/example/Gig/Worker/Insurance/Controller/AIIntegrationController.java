package com.example.Gig.Worker.Insurance.Controller;

import com.example.Gig.Worker.Insurance.Service.RiskAggregationService;
import com.example.Gig.Worker.Insurance.Service.TriggerEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIIntegrationController {

    @Autowired
    private TriggerEngineService triggerEngineService;

    @Autowired
    private RiskAggregationService riskAggregationService;

    /**
     * Endpoint to simulate an external disruption event (e.g., Strike, Rain, High AQI)
     * POST /api/ai/trigger-event
     * Body: { "area": "Mumbai", "disruptionType": "STRIKE", "lostHours": 4 }
     */
    @PostMapping("/trigger-event")
    public ResponseEntity<?> simulateDisruptionEvent(@RequestBody Map<String, Object> payload) {
        String area = (String) payload.getOrDefault("area", "Mumbai");
        String disruptionType = (String) payload.getOrDefault("disruptionType", "RAIN");
        int lostHours = (int) payload.getOrDefault("lostHours", 4);

        triggerEngineService.triggerDisruptionEvent(area, disruptionType, lostHours);
        
        return ResponseEntity.ok(Map.of(
            "message", "AI Trigger Engine activated for area: " + area + " due to disruption: " + disruptionType,
            "status", "Processing Auto-Claims in Background"
        ));
    }

    /**
     * Endpoint to manually check AI risk score for an area (calls Weather & AQI APIs)
     * GET /api/ai/risk-score?city=Mumbai&workerId=1
     */
    @GetMapping("/risk-score")
    public ResponseEntity<?> checkRiskScore(@RequestParam String city, @RequestParam Long workerId) {
        double totalRisk = riskAggregationService.calculateTotalRiskForWorker(city, "URBAN", workerId);
        return ResponseEntity.ok(Map.of(
            "city", city,
            "workerId", workerId,
            "totalRiskScore", totalRisk,
            "riskLevel", totalRisk > 60 ? "HIGH" : (totalRisk > 30 ? "MODERATE" : "LOW")
        ));
    }
}
