package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.Model.Claim;
import com.example.Gig.Worker.Insurance.Model.Policy;
import com.example.Gig.Worker.Insurance.Model.Worker;
import com.example.Gig.Worker.Insurance.Repository.PolicyRepository;
import com.example.Gig.Worker.Insurance.Repository.WorkerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * PaymentCalculationService — Parametric Income Loss Calculator
 *
 * Formula (as per GigShield parametric model):
 *   hourly_rate  = daily_income / 8          (assuming 8-hour workday)
 *   income_loss  = hourly_rate × hours_lost
 *   approved     = min(income_loss, policy_max_limit)
 */
@Service
public class PaymentCalculationService {

    private static final Logger log = LoggerFactory.getLogger(PaymentCalculationService.class);

    private static final double DEFAULT_DAILY_INCOME = 500.0;  // ₹500 fallback
    private static final double HOURS_IN_WORKDAY     = 8.0;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private PolicyRepository policyRepository;

    /**
     * Calculates the approved payout amount.
     *
     * @param claim     the claim (workerId and policyId must be set)
     * @param lostHours number of working hours lost due to disruption
     * @return the approved payout amount in INR
     */
    public double calculateApprovedAmount(Claim claim, int lostHours) {
        Worker worker = workerRepository.findById(claim.getWorkerId()).orElse(null);
        Policy policy = policyRepository.findById(claim.getPolicyId()).orElse(null);

        if (worker == null) {
            log.error("[PAYMENT CALC] Worker not found for ID={}", claim.getWorkerId());
            return 0.0;
        }
        if (policy == null) {
            log.error("[PAYMENT CALC] Policy not found for ID={}", claim.getPolicyId());
            return 0.0;
        }

        // Daily income (fall back to default if not set)
        double dailyIncome = (worker.getAvgIncome() != null && worker.getAvgIncome() > 0)
                ? worker.getAvgIncome()
                : DEFAULT_DAILY_INCOME;

        // Hourly rate derived from daily income
        double hourlyRate = dailyIncome / HOURS_IN_WORKDAY;

        // Parametric income loss
        double incomeLoss = hourlyRate * lostHours;

        // Cap at policy coverage limit
        double policyLimit    = policy.getCoverageAmount();
        double approvedAmount = Math.min(incomeLoss, policyLimit);

        log.info("[PAYMENT CALC] Worker={} | DailyIncome=₹{} | HourlyRate=₹{} | LostHours={} | IncomeLoss=₹{} | PolicyLimit=₹{} | Approved=₹{}",
                claim.getWorkerId(),
                dailyIncome,
                String.format("%.2f", hourlyRate),
                lostHours,
                String.format("%.2f", incomeLoss),
                policyLimit,
                String.format("%.2f", approvedAmount));

        return approvedAmount;
    }

    /**
     * Convenience: calculate income loss without capping (for display/audit purposes).
     */
    public double calculateRawIncomeLoss(Long workerId, int lostHours) {
        Worker worker = workerRepository.findById(workerId).orElse(null);
        if (worker == null) return 0.0;
        double dailyIncome = (worker.getAvgIncome() != null && worker.getAvgIncome() > 0)
                ? worker.getAvgIncome() : DEFAULT_DAILY_INCOME;
        return (dailyIncome / HOURS_IN_WORKDAY) * lostHours;
    }
}
