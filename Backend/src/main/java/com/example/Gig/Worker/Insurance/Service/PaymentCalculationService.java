package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.Model.Claim;
import com.example.Gig.Worker.Insurance.Model.Policy;
import com.example.Gig.Worker.Insurance.Model.Worker;
import com.example.Gig.Worker.Insurance.Repository.PolicyRepository;
import com.example.Gig.Worker.Insurance.Repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentCalculationService {

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private PolicyRepository policyRepository;

    public double calculateApprovedAmount(Claim claim, int lostHours) {
        Worker worker = workerRepository.findById(claim.getWorkerId()).orElse(null);
        Policy policy = policyRepository.findById(claim.getPolicyId()).orElse(null);

        if (worker == null || policy == null) {
            return 0.0;
        }

        // Daily income fallback to 500 if not set
        double dailyIncome = worker.getAvgIncome() != null ? worker.getAvgIncome() : 500.0;
        
        // Assume 8 working hours per day for hourly rate calculation
        double hourlyRate = dailyIncome / 8.0;
        double calculatedAmount = hourlyRate * lostHours;

        double policyMaxLimit = policy.getCoverageAmount();

        return Math.min(calculatedAmount, policyMaxLimit);
    }
}
