package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.DTO.*;
import com.example.Gig.Worker.Insurance.Model.Policy;
import com.example.Gig.Worker.Insurance.Repository.PolicyRepository;
import com.example.Gig.Worker.Insurance.exception.ResourceNotFoundException;
import com.example.Gig.Worker.Insurance.mapper.PolicyMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PolicyServiceImpl implements PolicyService {

    private final PolicyRepository policyRepository;
    private final PolicyMapper policyMapper;

    public PolicyServiceImpl(PolicyRepository policyRepository,
                             PolicyMapper policyMapper) {
        this.policyRepository = policyRepository;
        this.policyMapper = policyMapper;
    }

    @Override
    public PolicyResponseDTO createPolicy(PolicyRequestDTO requestDTO) {

        Policy policy = policyMapper.toEntity(requestDTO);
        policy.setStatus("ACTIVE");

        Policy saved = policyRepository.save(policy);

        return policyMapper.toDTO(saved);
    }

    @Override
    public List<PolicyResponseDTO> getPoliciesByWorker(Long workerId) {

        List<Policy> policies = policyRepository.findByWorkerId(workerId);

        if (policies.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No policies found for worker id: " + workerId);
        }

        return policies.stream()
                .map(policyMapper::toDTO)
                .toList();
    }

    @Override
    public List<PolicyResponseDTO> getAllPolicies() {
        return policyRepository.findAll()
                .stream()
                .map(policyMapper::toDTO)
                .toList();
    }

    @Override
    public PolicyResponseDTO getPolicyById(Long id) {

        Policy policy = policyRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Policy not found with id: " + id));

        return policyMapper.toDTO(policy);
    }

    @Override
    public PolicyResponseDTO updatePolicy(Long id, PolicyRequestDTO dto) {

        Policy policy = policyRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Policy not found with id: " + id));

        policy.setPolicyType(dto.getPolicyType());
        policy.setPremium(dto.getPremium());
        policy.setCoverageAmount(dto.getCoverageAmount());
        policy.setDuration(dto.getDuration());
        policy.setStartDate(dto.getStartDate());
        policy.setEndDate(dto.getEndDate());

        Policy updated = policyRepository.save(policy);

        return policyMapper.toDTO(updated);
    }

    @Override
    public void deletePolicy(Long id) {

        Policy policy = policyRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Policy not found with id: " + id));

        policyRepository.delete(policy);
    }
}