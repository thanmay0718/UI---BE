package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.DTO.RiskScoreResponse;
import com.example.Gig.Worker.Insurance.Model.RiskScoreHistory;

import java.util.List;
import java.util.Map;

public interface RiskScoreService {
    RiskScoreResponse getWeatherRisk(String city);
    RiskScoreResponse getAqiRisk(String city);
    Map<String, Object> getNewsRisk(String city);
    List<RiskScoreHistory> getRiskHistory(Long workerId, String range);
}