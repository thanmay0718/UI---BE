package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.DTO.PolicyRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.PolicyResponseDTO;
import com.example.Gig.Worker.Insurance.Model.Policy;

import java.util.List;

public interface PolicyService {

    PolicyResponseDTO createPolicy(PolicyRequestDTO request);
    List<PolicyResponseDTO> getPoliciesByWorker(Long workerId);
    List<PolicyResponseDTO> getAllPolicies();

    PolicyResponseDTO getPolicyById(Long id);

    PolicyResponseDTO updatePolicy(Long id, PolicyRequestDTO dto);

    void deletePolicy(Long id);

//    PremiumResponseDTO calculatePremium(PremiumRequestDTO dto);
//
//    PolicyResponseDTO activatePolicy(PolicyActivationDTO dto);

//    List<PolicyRecommendationDTO> recommendPolicies(Long workerId);

}
