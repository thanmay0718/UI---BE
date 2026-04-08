package com.example.Gig.Worker.Insurance.Service;

import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class PlatformRiskService {

    public double calculate(String platform) {
        // Risk based on platform type
        // Q-Commerce = highest risk (10min delivery pressure)
        Map<String, Double> platformRiskMap = Map.of(
                "ZOMATO",   40.0,   // Food delivery
                "SWIGGY",   40.0,   // Food delivery
                "BLINKIT",  70.0,   // Q-Commerce, high pressure
                "ZEPTO",    70.0,   // Q-Commerce, high pressure
                "AMAZON",   35.0,   // Scheduled delivery, lower risk
                "FLIPKART", 35.0,   // Scheduled delivery, lower risk
                "DUNZO",    65.0,   // Hyperlocal, moderate-high
                "BIGBASKET", 45.0   // Grocery, moderate
        );

        return platformRiskMap.getOrDefault(platform.toUpperCase(), 50.0);
    }
}