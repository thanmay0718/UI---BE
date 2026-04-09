package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.DTO.RiskScoreResponse;
import com.example.Gig.Worker.Insurance.Model.RiskScoreHistory;
import com.example.Gig.Worker.Insurance.Repository.RiskScoreHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class RiskScoreServiceImpl implements RiskScoreService {

    @Autowired
    private ExternalApiService externalApiService;

    @Autowired
    private RiskScoreHistoryRepository riskScoreHistoryRepository;

    @Override
    public RiskScoreResponse getWeatherRisk(String city) {
        Map<String, Object> data = externalApiService.getWeatherData(city);
        double score = 5.0; // Base baseline risk
        double rainMm = 0;
        double windKmh = 0;
        double visibilityM = 10000;
        double temp = 25.0;
        String conditionMain = "Clear";
        String conditionDesc = "Clear sky";
        final double RAIN_THRESHOLD = 10.0; // mm in 1h triggers payout

        if (data != null) {
            // Temperature & Humidity Risk (Continuous)
            if (data.containsKey("main")) {
                Map<String, Object> main = (Map<String, Object>) data.get("main");
                if (main.containsKey("temp")) {
                    temp = Double.parseDouble(main.get("temp").toString());
                    // Deviation from ideal 22C adds risk linearly
                    score += Math.abs(temp - 22.0) * 1.2;
                }
                if (main.containsKey("humidity")) {
                    double humidity = Double.parseDouble(main.get("humidity").toString());
                    if (humidity > 50) {
                        score += (humidity - 50) * 0.25; // 0.25 risk per % above 50
                    }
                }
            }

            // Wind Risk (Continuous)
            if (data.containsKey("wind")) {
                Map<String, Object> wind = (Map<String, Object>) data.get("wind");
                if (wind.containsKey("speed")) {
                    windKmh = Double.parseDouble(wind.get("speed").toString()) * 3.6;
                    score += (windKmh * 0.4); // 0.4 risk per km/h
                }
            }

            // Visibility Risk
            if (data.containsKey("visibility")) {
                visibilityM = Double.parseDouble(data.get("visibility").toString());
                if (visibilityM < 5000) {
                    score += ((5000 - visibilityM) / 100.0) * 0.5; // Up to 25 extra risk
                }
            }

            // Rain volume Risk
            if (data.containsKey("rain")) {
                Map<String, Object> rain = (Map<String, Object>) data.get("rain");
                if (rain.containsKey("1h")) {
                    rainMm = Double.parseDouble(rain.get("1h").toString());
                    score += (rainMm * 4.0); // 4 score per mm of rain
                }
            }

            // Weather condition categorical boost
            if (data.containsKey("weather")) {
                List<Map<String, Object>> weatherList = (List<Map<String, Object>>) data.get("weather");
                if (!weatherList.isEmpty()) {
                    conditionMain = (String) weatherList.get(0).getOrDefault("main", "Clear");
                    conditionDesc = (String) weatherList.get(0).getOrDefault("description", "Clear sky");
                    if (conditionMain.equalsIgnoreCase("Thunderstorm")) score += 25.0;
                    if (conditionMain.equalsIgnoreCase("Snow")) score += 20.0;
                    if (conditionMain.equalsIgnoreCase("Rain")) score += 10.0;
                }
            }
        }

        score = Math.min(score, 100.0);
        // riskMultiplier: 1.0 = baseline, >1.0 = elevated risk
        double riskMult = 1.0 + (score / 100.0);

        String label = score < 25 ? "Safe" : (score < 50 ? "Moderate" : (score < 75 ? "High" : "Severe"));

        return RiskScoreResponse.builder()
                .city(city)
                .weatherScore(score)
                // Default unused fields for this endpoint
                .aqiScore(0.0)
                .overallScore(0.0)
                .timestamp(LocalDateTime.now())
                .label(label)
                .riskMultiplier(riskMult)
                .triggerValue(rainMm)        // mm of rain in last 1h
                .threshold(RAIN_THRESHOLD)   // 10mm threshold for payout trigger
                .condition(conditionMain)
                .description(conditionDesc)
                .build();
    }

    @Override
    public RiskScoreResponse getAqiRisk(String city) {
        Map<String, Object> dataResponse = externalApiService.getAqiData(city);
        double score = 5.0;
        double aqiValue = 0;
        String label = "Good";
        final double AQI_THRESHOLD = 100.0; // AQI > 100 = unhealthy

        if (dataResponse != null && dataResponse.containsKey("data")) {
            Map<String, Object> data = (Map<String, Object>) dataResponse.get("data");
            if (data.containsKey("aqi")) {
                aqiValue = Double.parseDouble(data.get("aqi").toString());
                
                // Continuous AQI scoring algorithm
                // Real-world AQI mapping: 0-50 = Good, 51-100 = Moderate, 101-150 = Unhealthy for Sensitive, 151+ = Unhealthy
                score = Math.min(100.0, 5.0 + (aqiValue * 0.45));

                if (aqiValue <= 50) {
                    label = "Good";
                } else if (aqiValue <= 100) {
                    label = "Moderate";
                } else if (aqiValue <= 150) {
                    label = "Unhealthy (Sensitive)";
                } else if (aqiValue <= 200) {
                    label = "Unhealthy";
                } else if (aqiValue <= 300) {
                    label = "Very Unhealthy";
                } else {
                    label = "Hazardous";
                }
            }
        }

        double riskMult = 1.0 + (score / 100.0);

        return RiskScoreResponse.builder()
                .city(city)
                .aqiScore(score)
                .timestamp(LocalDateTime.now())
                .label(label)
                .riskMultiplier(riskMult)
                .triggerValue(aqiValue)
                .threshold(AQI_THRESHOLD)
                .condition("AQI")
                .description("Air Quality Index: " + (int) aqiValue + " - " + label)
                .build();
    }

    @Override
    public Map<String, Object> getNewsRisk(String city) {
        return externalApiService.getSocialDisruptionNews(city);
    }

    @Override
    public List<RiskScoreHistory> getRiskHistory(Long workerId, String range) {
        // "ALL" = from worker's registration date (i.e. the very beginning)
        if ("ALL".equalsIgnoreCase(range)) {
            return riskScoreHistoryRepository.findByWorkerIdOrderByRecordedAtAsc(workerId);
        }

        LocalDateTime startDate = LocalDateTime.now();
        switch (range.toUpperCase()) {
            case "DAY":
                startDate = startDate.minusDays(1); break;
            case "WEEK":
                startDate = startDate.minusWeeks(1); break;
            case "MONTH":
                startDate = startDate.minusMonths(1); break;
            case "SIX_MONTHS":
                startDate = startDate.minusMonths(6); break;
            case "YEAR":
                startDate = startDate.minusYears(1); break;
            default:
                startDate = startDate.minusYears(10); // effectively "all"
        }

        return riskScoreHistoryRepository.findByWorkerIdAndRecordedAtAfterOrderByRecordedAtAsc(workerId, startDate);
    }
}
