package com.example.Gig.Worker.Insurance.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * RiskAggregationService — Weighted Multi-Factor Risk Engine
 *
 * Formula:
 *   risk_score = (weather * 0.30) + (zone * 0.20) + (history * 0.30) + (social * 0.20)
 *
 * Each component is normalised to 0–100.
 */
@Service
public class RiskAggregationService {

    private static final Logger log = LoggerFactory.getLogger(RiskAggregationService.class);

    @Autowired
    private ExternalApiService externalApiService;

    @Autowired
    private ZoneRiskService zoneRiskService;

    @Autowired
    private WorkerHistoryRiskService workerHistoryRiskService;

    // =========================================================
    // Main scoring entry-point (returns a single double)
    // =========================================================
    public double calculateTotalRiskForWorker(String city, String zone, Long workerId) {
        RiskBreakdown breakdown = calculateRiskBreakdown(city, zone, workerId);
        return breakdown.totalScore;
    }

    // =========================================================
    // Detailed breakdown for AI controller / audit trail
    // =========================================================
    public RiskBreakdown calculateRiskBreakdown(String city, String zone, Long workerId) {
        double weatherRisk  = calculateWeatherRisk(city);
        double aqiRisk      = calculateAqiRisk(city);
        double zoneRisk     = zoneRiskService.calculate(zone != null ? zone : "URBAN");
        double historyRisk  = workerHistoryRiskService.calculate(workerId);
        double socialRisk   = calculateSocialRisk(city);

        // Blend AQI into weather component (both environmental)
        double envRisk = Math.max(weatherRisk, aqiRisk);  // take the worse condition

        // Weighted formula
        double total = (envRisk * 0.30) + (zoneRisk * 0.20) + (historyRisk * 0.30) + (socialRisk * 0.20);
        total = Math.min(total, 100.0);

        log.info("[RISK ENGINE] City={} | Weather={} | AQI={} | Zone={} | History={} | Social={} || TOTAL={}",
                city, weatherRisk, aqiRisk, zoneRisk, historyRisk, socialRisk, String.format("%.2f", total));

        RiskBreakdown bd = new RiskBreakdown();
        bd.weatherScore  = weatherRisk;
        bd.aqiScore      = aqiRisk;
        bd.zoneScore     = zoneRisk;
        bd.historyScore  = historyRisk;
        bd.socialScore   = socialRisk;
        bd.totalScore    = total;
        bd.riskLevel     = total > 70 ? "HIGH" : (total > 40 ? "MODERATE" : "LOW");
        return bd;
    }

    // =========================================================
    // Individual factor calculators
    // =========================================================

    private double calculateWeatherRisk(String city) {
        Map<String, Object> data = externalApiService.getWeatherData(city);
        if (data == null || !data.containsKey("weather")) {
            log.warn("[RISK] Weather API returned null for city={}", city);
            return 50.0;
        }
        try {
            List<Map<String, Object>> weatherList = (List<Map<String, Object>>) data.get("weather");
            if (weatherList != null && !weatherList.isEmpty()) {
                String main = (String) weatherList.get(0).get("main");
                log.debug("[RISK] Weather condition for {}: {}", city, main);
                return switch (main.toUpperCase()) {
                    case "THUNDERSTORM", "EXTREME" -> 95.0;
                    case "RAIN", "DRIZZLE"         -> 80.0;
                    case "SNOW", "FOG", "MIST"     -> 65.0;
                    case "CLOUDS"                  -> 30.0;
                    case "CLEAR"                   -> 15.0;
                    default                        -> 50.0;
                };
            }
        } catch (Exception e) {
            log.error("[RISK] Error parsing weather data for {}: {}", city, e.getMessage());
        }
        return 50.0;
    }

    private double calculateAqiRisk(String city) {
        Map<String, Object> data = externalApiService.getAqiData(city);
        if (data == null || !data.containsKey("data")) {
            log.warn("[RISK] AQI API returned null for city={}", city);
            return 30.0;
        }
        try {
            Map<String, Object> inner = (Map<String, Object>) data.get("data");
            if (inner != null && inner.containsKey("aqi")) {
                int aqi = Integer.parseInt(inner.get("aqi").toString());
                log.debug("[RISK] AQI for {}: {}", city, aqi);
                if (aqi > 300) return 95.0;  // Hazardous
                if (aqi > 200) return 80.0;  // Very Unhealthy
                if (aqi > 150) return 65.0;  // Unhealthy
                if (aqi > 100) return 40.0;  // Moderate
                return 15.0;                 // Good
            }
        } catch (Exception e) {
            log.error("[RISK] Error parsing AQI data for {}: {}", city, e.getMessage());
        }
        return 30.0;
    }

    private double calculateSocialRisk(String city) {
        Map<String, Object> data = externalApiService.getSocialDisruptionNews(city);
        if (data == null || !data.containsKey("totalResults")) {
            log.warn("[RISK] News API returned null for city={}", city);
            return 10.0;
        }
        try {
            Object rawCount = data.get("totalResults");
            int total = rawCount instanceof Integer ? (Integer) rawCount
                                                    : Integer.parseInt(rawCount.toString());
            log.debug("[RISK] News disruption count for {}: {}", city, total);
            if (total > 50) return 95.0;
            if (total > 25) return 80.0;
            if (total > 10) return 60.0;
            if (total > 0)  return 30.0;
        } catch (Exception e) {
            log.error("[RISK] Error parsing news data for {}: {}", city, e.getMessage());
        }
        return 10.0;
    }

    // =========================================================
    // Data class for detailed breakdown
    // =========================================================
    public static class RiskBreakdown {
        public double weatherScore;
        public double aqiScore;
        public double zoneScore;
        public double historyScore;
        public double socialScore;
        public double totalScore;
        public String riskLevel;

        public Map<String, Object> toMap() {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("weatherScore",  weatherScore);
            m.put("aqiScore",      aqiScore);
            m.put("zoneScore",     zoneScore);
            m.put("historyScore",  historyScore);
            m.put("socialScore",   socialScore);
            m.put("totalScore",    totalScore);
            m.put("riskLevel",     riskLevel);
            return m;
        }
    }
}
