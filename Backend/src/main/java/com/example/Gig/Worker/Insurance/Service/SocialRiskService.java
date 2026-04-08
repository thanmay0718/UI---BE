package com.example.Gig.Worker.Insurance.Service;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class SocialRiskService {

    public double calculate(String city) {
        // Mock social disruption risk
        // In future replace with real news/curfew API

        // Cities currently with high social disruption risk
        List<String> highRiskCities    = List.of("Manipur", "Jammu", "Srinagar");
        List<String> mediumRiskCities  = List.of("Delhi", "Kolkata", "Mumbai");

        if (highRiskCities.contains(city))   return 80.0;
        if (mediumRiskCities.contains(city)) return 50.0;

        return 20.0; // Default low social risk
    }
}