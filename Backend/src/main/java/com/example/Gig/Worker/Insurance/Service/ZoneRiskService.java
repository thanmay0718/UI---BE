package com.example.Gig.Worker.Insurance.Service;

import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class ZoneRiskService {

    public double calculate(String zone) {
        // Zone risk based on area type
        Map<String, Double> zoneRiskMap = Map.of(
                "URBAN",       30.0,   // Good roads, low disruption
                "SEMI_URBAN",  50.0,   // Moderate risk
                "RURAL",       75.0,   // Poor roads, high disruption
                "COASTAL",     80.0,   // Flood + cyclone risk
                "INDUSTRIAL",  60.0,   // Strike prone
                "HILLY",       85.0    // Landslide, road block risk
        );

        return zoneRiskMap.getOrDefault(zone, 50.0);
    }
}