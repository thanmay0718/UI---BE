package com.example.Gig.Worker.Insurance.Fraud;
import com.example.Gig.Worker.Insurance.Model.Claim;
import com.example.Gig.Worker.Insurance.Repository.ClaimRepository;
import org.springframework.stereotype.Service;

import java.util.List;

    @Service
    public class FraudDetectionService {

        private final ClaimRepository claimRepository;

        public FraudDetectionService(ClaimRepository claimRepository) {
            this.claimRepository=claimRepository;
        }

        public boolean isDuplicateClaim(Claim newClaim){
            List<Claim> previousClaims=
                    claimRepository.findByWorkerIdAndPolicyId(
                            newClaim.getWorkerId(),
                            newClaim.getPolicyId()
                    );
            for(Claim claim:previousClaims){
                if(Math.abs(claim.getAmount() - newClaim.getAmount())<500){
                    return true;
                }
            }return false;

    }
}
