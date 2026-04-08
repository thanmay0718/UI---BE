package com.example.Gig.Worker.Insurance.Service;

import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class WeatherRiskScore {

    public double calculate(String city) {
        // Mock weather risk data per city
        // In future replace this with real Weather API
        Map<String, Double> weatherRiskMap = Map.of(
                "Mumbai",    75.0,   // Flood prone
                "Delhi",     65.0,   // Extreme heat + pollution
                "Bangalore", 30.0,   // Mostly safe
                "Chennai",   70.0,   // Cyclone prone
                "Hyderabad", 45.0,   // Moderate
                "Kolkata",   80.0,   // Heavy rain + flood
                "Pune",      35.0,   // Mostly safe
                "Ahmedabad", 60.0    // Extreme heat
        );

        return weatherRiskMap.getOrDefault(city, 50.0);
    }
}