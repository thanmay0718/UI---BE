package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.Fraud.FraudDetectionService;
import com.example.Gig.Worker.Insurance.Model.Claim;
import com.example.Gig.Worker.Insurance.Model.Payment;
import com.example.Gig.Worker.Insurance.Repository.ClaimRepository;
import com.example.Gig.Worker.Insurance.Repository.PaymentRepository;
import com.example.Gig.Worker.Insurance.Repository.WorkerRepository;
import com.example.Gig.Worker.Insurance.Model.Worker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AIClaimProcessingService {

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private RiskAggregationService riskAggregationService;

    @Autowired
    private FraudDetectionService fraudDetectionService;

    @Autowired
    private ClaimDecisionEngine claimDecisionEngine;

    @Autowired
    private PaymentCalculationService paymentCalculationService;
    
    @Autowired
    private PaymentRepository paymentRepository;

    @Transactional
    public Claim processAutomatedClaim(Claim claim, int lostHours, String currentLatLon) {
        
        // 1. Fetch Worker Details for Context
        Worker worker = workerRepository.findById(claim.getWorkerId()).orElse(null);
        if (worker == null) {
            claim.setStatus("REJECTED");
            claim.setDecision("WORKER_NOT_FOUND");
            return claimRepository.save(claim);
        }

        // 2. Risk Scoring
        double riskScore = riskAggregationService.calculateTotalRiskForWorker(
            worker.getArea(), 
            "URBAN", // Mock zone for demonstration
            worker.getId()
        );
        claim.setRiskScore(riskScore);

        // 3. Fraud Detection
        double fraudScore = fraudDetectionService.calculateFraudScore(claim, currentLatLon, claim.getLocation());
        claim.setFraudScore(fraudScore);

        // 4. Decision Engine
        boolean disruptionConfirmed = riskScore > 60.0; // Automatically confirm disruption if risk is high enough
        claim = claimDecisionEngine.processDecision(claim, disruptionConfirmed, 60.0);

        // 5. Payment Calculation and Mock Payout Trigger
        if ("APPROVED".equals(claim.getStatus())) {
            double approvedAmount = paymentCalculationService.calculateApprovedAmount(claim, lostHours);
            claim.setApprovedAmount(approvedAmount);
            
            triggerMockInstantPayout(claim, approvedAmount);
        } else {
            claim.setApprovedAmount(0.0);
        }

        claim.setProcessedAt(LocalDateTime.now());
        
        return claimRepository.save(claim);
    }
    
    private void triggerMockInstantPayout(Claim claim, double amount) {
        Payment mockPayment = new Payment();
        mockPayment.setWorkerId(claim.getWorkerId());
        mockPayment.setPolicyId(claim.getPolicyId());
        mockPayment.setAmount(java.math.BigDecimal.valueOf(amount));
        mockPayment.setPaymentType("PAYOUT");
        mockPayment.setPaymentMethod("BANK_TRANSFER");
        mockPayment.setCurrency("INR");
        mockPayment.setStatus("SUCCESS");
        mockPayment.setNotes("MOCK_TXN_" + System.currentTimeMillis());
        paymentRepository.save(mockPayment);
    }
}
