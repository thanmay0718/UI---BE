package com.example.Gig.Worker.Insurance.Controller;

import com.example.Gig.Worker.Insurance.DTO.RiskScoreResponse;
import com.example.Gig.Worker.Insurance.Model.RiskScoreHistory;
import com.example.Gig.Worker.Insurance.Service.RiskScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/risk")
@CrossOrigin(origins = "http://localhost:5173")
public class RiskScoreController {

    @Autowired
    private RiskScoreService riskScoreService;

    /** Real-time weather risk for a city — calls OpenWeatherMap live */
    @GetMapping("/weather")
    public ResponseEntity<RiskScoreResponse> getWeatherRisk(@RequestParam String city) {
        return ResponseEntity.ok(riskScoreService.getWeatherRisk(city));
    }

    /** Real-time AQI risk for a city — calls WAQI live */
    @GetMapping("/aqi")
    public ResponseEntity<RiskScoreResponse> getAqiRisk(@RequestParam String city) {
        return ResponseEntity.ok(riskScoreService.getAqiRisk(city));
    }

    /** News disruption signals for a city — calls NewsAPI live */
    @GetMapping("/news")
    public ResponseEntity<Map<String, Object>> getNewsRisk(@RequestParam String city) {
        return ResponseEntity.ok(riskScoreService.getNewsRisk(city));
    }

    /**
     * Risk history for a worker.
     * range: DAY | WEEK | MONTH | SIX_MONTHS | YEAR | ALL
     * Use ALL to return the full history since registration.
     */
    @GetMapping("/history")
    public ResponseEntity<List<RiskScoreHistory>> getRiskHistory(
            @RequestParam Long workerId,
            @RequestParam(defaultValue = "ALL") String range) {
        return ResponseEntity.ok(riskScoreService.getRiskHistory(workerId, range));
    }
}
