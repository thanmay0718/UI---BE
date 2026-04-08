package com.example.Gig.Worker.Insurance.Controller;

import com.example.Gig.Worker.Insurance.DTO.RiskFactorsDTO;
import com.example.Gig.Worker.Insurance.DTO.RiskRequestDTO;
import com.example.Gig.Worker.Insurance.Model.RiskScore;
import com.example.Gig.Worker.Insurance.Repository.RiskScoreRepository;
import com.example.Gig.Worker.Insurance.Service.RiskScoreService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/risk")
public class RiskController {

    @Autowired
    private RiskScoreService riskScoreService;

    @Autowired
    private RiskScoreRepository riskScoreRepository;

    // ✅ Calculate Risk Score for a worker
    @PostMapping("/calculate")
    public ResponseEntity<RiskFactorsDTO> calculateRisk(
            @Valid @RequestBody RiskRequestDTO request) {

        RiskFactorsDTO result = riskScoreService.calculateRisk(
                request.getWorkerId(),
                request.getCity(),
                request.getZone(),
                request.getPlatform());

        return ResponseEntity.ok(result);
    }

    // ✅ Get all risk scores for a worker
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<RiskScore>> getWorkerRiskHistory(
            @PathVariable Long workerId) {

        List<RiskScore> scores = riskScoreRepository
                .findByWorkerId(workerId);

        return ResponseEntity.ok(scores);
    }

    // ✅ Get latest risk score for a worker
    @GetMapping("/worker/{workerId}/latest")
    public ResponseEntity<RiskScore> getLatestRiskScore(
            @PathVariable Long workerId) {

        return riskScoreRepository
                .findTopByWorkerIdOrderByCalculatedAtDesc(workerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}