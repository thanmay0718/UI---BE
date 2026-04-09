package com.example.Gig.Worker.Insurance.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * DisruptionSchedulerService — Automated Environmental Monitoring
 *
 * Runs on a schedule and checks real-time weather + AQI for registered cities.
 * If conditions exceed thresholds, auto-fires the TriggerEngine.
 *
 * Schedule: every 30 minutes (configurable via application.properties)
 *
 * NOTE: @EnableScheduling is already on GigWorkerInsuranceApplication.
 */
@Service
public class DisruptionSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(DisruptionSchedulerService.class);

    /** Cities to monitor — in production, load dynamically from worker table */
    private static final String[] MONITORED_CITIES = {
        "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune"
    };

    // Thresholds
    private static final double WEATHER_RISK_TRIGGER  = 70.0;  // trigger if weather risk >= 70
    private static final int    AQI_TRIGGER_THRESHOLD = 200;   // trigger if AQI >= 200
    private static final int    DEFAULT_LOST_HOURS    = 4;     // default lost hours per disruption

    @Autowired private ExternalApiService   externalApiService;
    @Autowired private TriggerEngineService triggerEngineService;

    // =========================================================
    // MAIN SCHEDULER — runs every 30 minutes
    // =========================================================

    /**
     * Cron: every 30 minutes.
     * Change to "0 0 * * * *" for hourly, or "0 * * * * *" for every minute (dev only).
     */
    @Scheduled(cron = "0 0/30 * * * *")
    public void runEnvironmentalScan() {
        log.info("╔══ [AUTO-SCHEDULER] Environmental scan started for {} cities", MONITORED_CITIES.length);

        for (String city : MONITORED_CITIES) {
            try {
                checkWeatherCondition(city);
                checkAqiCondition(city);
            } catch (Exception e) {
                log.error("║ [AUTO-SCHEDULER] Error scanning city {}: {}", city, e.getMessage());
            }
        }

        log.info("╚══ [AUTO-SCHEDULER] Scan complete.");
    }

    // =========================================================
    // Weather condition check
    // =========================================================
    private void checkWeatherCondition(String city) {
        Map<String, Object> weatherData = externalApiService.getWeatherData(city);
        if (weatherData == null || !weatherData.containsKey("weather")) return;

        try {
            @SuppressWarnings("unchecked")
            java.util.List<Map<String, Object>> weatherList =
                    (java.util.List<Map<String, Object>>) weatherData.get("weather");

            if (weatherList != null && !weatherList.isEmpty()) {
                String main = (String) weatherList.get(0).get("main");
                log.debug("[SCHEDULER] {} weather: {}", city, main);

                if ("Thunderstorm".equalsIgnoreCase(main) || "Extreme".equalsIgnoreCase(main)) {
                    log.warn("[SCHEDULER] 🌩  EXTREME WEATHER in {}! Firing trigger engine.", city);
                    triggerEngineService.triggerDisruptionEvent(city, "EXTREME_WEATHER", DEFAULT_LOST_HOURS + 2);
                } else if ("Rain".equalsIgnoreCase(main) || "Drizzle".equalsIgnoreCase(main)) {
                    log.warn("[SCHEDULER] 🌧  RAIN detected in {}. Firing trigger engine.", city);
                    triggerEngineService.triggerDisruptionEvent(city, "RAIN", DEFAULT_LOST_HOURS);
                }
            }
        } catch (Exception e) {
            log.error("[SCHEDULER] Failed to parse weather for {}: {}", city, e.getMessage());
        }
    }

    // =========================================================
    // AQI condition check
    // =========================================================
    private void checkAqiCondition(String city) {
        Map<String, Object> aqiData = externalApiService.getAqiData(city);
        if (aqiData == null || !aqiData.containsKey("data")) return;

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> inner = (Map<String, Object>) aqiData.get("data");
            if (inner != null && inner.containsKey("aqi")) {
                int aqi = Integer.parseInt(inner.get("aqi").toString());
                log.debug("[SCHEDULER] {} AQI: {}", city, aqi);

                if (aqi >= AQI_TRIGGER_THRESHOLD) {
                    log.warn("[SCHEDULER] 😷 HAZARDOUS AQI ({}) in {}! Firing trigger engine.", aqi, city);
                    triggerEngineService.triggerDisruptionEvent(city, "HIGH_AQI", DEFAULT_LOST_HOURS);
                }
            }
        } catch (Exception e) {
            log.error("[SCHEDULER] Failed to parse AQI for {}: {}", city, e.getMessage());
        }
    }

    // =========================================================
    // Manual scan trigger (callable from controller for demo)
    // =========================================================
    public void runManualScanForCity(String city) {
        log.info("[SCHEDULER] Manual scan requested for city: {}", city);
        checkWeatherCondition(city);
        checkAqiCondition(city);
    }
}
