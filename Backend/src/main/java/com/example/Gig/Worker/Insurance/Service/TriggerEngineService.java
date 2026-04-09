package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.Model.Claim;
import com.example.Gig.Worker.Insurance.Model.Policy;
import com.example.Gig.Worker.Insurance.Model.Worker;
import com.example.Gig.Worker.Insurance.Repository.PolicyRepository;
import com.example.Gig.Worker.Insurance.Repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TriggerEngineService {

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private AIClaimProcessingService aiClaimProcessingService;

    /**
     * Automatic Trigger Engine
     * Simulates an external webhook or chron job triggering a disruption event for a particular area.
     * @param area e.g., "Mumbai"
     * @param disruptionType e.g., "RAIN", "AQI", "STRIKE"
     * @param lostHours estimated lost working hours
     */
    @Async
    public void triggerDisruptionEvent(String area, String disruptionType, int lostHours) {
        System.out.println("TRIGGER ENGINE: Detected " + disruptionType + " in Area: " + area);
        
        // Find workers in this area
        List<Worker> affectedWorkers = workerRepository.findAll().stream()
                .filter(w -> w.getArea() != null && w.getArea().equalsIgnoreCase(area))
                .toList();

        System.out.println("TRIGGER ENGINE: Found " + affectedWorkers.size() + " affected workers in " + area);

        for (Worker worker : affectedWorkers) {
            // Find active policy for worker
            List<Policy> activePolicies = policyRepository.findByWorkerId(worker.getId());
            if (activePolicies.isEmpty()) {
                continue;
            }

            Policy policy = activePolicies.get(0); // Take first active policy

            // Create Auto Claim Skeleton
            Claim newClaim = new Claim();
            newClaim.setWorkerId(worker.getId());
            newClaim.setPolicyId(policy.getId());
            newClaim.setDescription("Auto-triggered claim for disruption: " + disruptionType);
            newClaim.setAmount(0.0); // handled by AI
            newClaim.setLocation(worker.getArea());
            newClaim.setFraudFlag(false);
            newClaim.setTriggerSource("SYSTEM_AUTO_TRIGGER");
            newClaim.setDisruptionType(disruptionType);
            newClaim.setCreatedAt(LocalDateTime.now());
            
            // Send to AI Processing Pipeline
            System.out.println("Processing auto-claim for Worker ID: " + worker.getId());
            aiClaimProcessingService.processAutomatedClaim(newClaim, lostHours, worker.getArea());
        }
    }
}
