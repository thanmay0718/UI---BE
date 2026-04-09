package com.example.Gig.Worker.Insurance.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.List;

@Service
public class RiskAggregationService {

    @Autowired
    private ExternalApiService externalApiService;
    
    @Autowired
    private ZoneRiskService zoneRiskService;
    
    @Autowired
    private WorkerHistoryRiskService workerHistoryRiskService;

    public double calculateTotalRiskForWorker(String city, String zone, Long workerId) {
        double weatherRisk = calculateWeatherRisk(city);
        double aqiRisk = calculateAqiRisk(city);
        double zoneRisk = zoneRiskService.calculate(zone != null ? zone : "URBAN");
        double historyRisk = workerHistoryRiskService.calculate(workerId);
        double socialRisk = calculateSocialRisk(city);

        // Weighted Risk Calculation
        // weather * 0.25 + aqi * 0.15 + social * 0.20 + zone * 0.15 + history * 0.25
        double riskScore = (weatherRisk * 0.25) + (aqiRisk * 0.15) + (socialRisk * 0.20) + (zoneRisk * 0.15) + (historyRisk * 0.25);
        
        return Math.min(riskScore, 100.0); // Cap at 100
    }

    private double calculateSocialRisk(String city) {
        Map<String, Object> newsData = externalApiService.getSocialDisruptionNews(city);
        if (newsData == null || !newsData.containsKey("totalResults")) return 10.0; // low default risk

        try {
            int totalResults = (Integer) newsData.get("totalResults");
            if (totalResults > 50) return 95.0;  // High disruption/strikes currently happening
            if (totalResults > 25) return 80.0;
            if (totalResults > 10) return 60.0;
            if (totalResults > 0) return 30.0;  // Minor mentions
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 10.0;
    }

    private double calculateWeatherRisk(String city) {
        Map<String, Object> weatherData = externalApiService.getWeatherData(city);
        if (weatherData == null || !weatherData.containsKey("weather")) return 50.0; // default risk

        try {
            List<Map<String, Object>> weatherList = (List<Map<String, Object>>) weatherData.get("weather");
            if (weatherList != null && !weatherList.isEmpty()) {
                String main = (String) weatherList.get(0).get("main");
                if (main.equalsIgnoreCase("Rain")) return 80.0;
                if (main.equalsIgnoreCase("Thunderstorm") || main.equalsIgnoreCase("Extreme")) return 95.0;
                if (main.equalsIgnoreCase("Clear") || main.equalsIgnoreCase("Clouds")) return 20.0;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 50.0;
    }

    private double calculateAqiRisk(String city) {
        Map<String, Object> aqiData = externalApiService.getAqiData(city);
        if (aqiData == null || !aqiData.containsKey("data")) return 30.0; // default risk

        try {
            Map<String, Object> data = (Map<String, Object>) aqiData.get("data");
            if (data.containsKey("aqi")) {
                int aqi = Integer.parseInt(data.get("aqi").toString());
                if (aqi > 300) return 90.0; // Hazardous
                if (aqi > 200) return 75.0; // Very Unhealthy
                if (aqi > 150) return 60.0; // Unhealthy
                if (aqi > 100) return 40.0; // Moderate
                return 20.0; // Good
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 30.0;
    }
}
