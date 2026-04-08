package com.example.Gig.Worker.Insurance.mapper;

import com.example.Gig.Worker.Insurance.DTO.*;
import com.example.Gig.Worker.Insurance.Model.Policy;
import org.springframework.stereotype.Component;

@Component
public class PolicyMapper {

    public Policy toEntity(PolicyRequestDTO dto) {
        return Policy.builder()
                .workerId(dto.getWorkerId())
                .policyType(dto.getPolicyType())
                .premium(dto.getPremium())
                .coverageAmount(dto.getCoverageAmount())
                .duration(dto.getDuration())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .build();
    }

    public PolicyResponseDTO toDTO(Policy policy) {
        return PolicyResponseDTO.builder()
                .id(policy.getId())
                .workerId(policy.getWorkerId())
                .policyType(policy.getPolicyType())
                .premium(policy.getPremium())
                .coverageAmount(policy.getCoverageAmount())
                .duration(policy.getDuration())
                .startDate(policy.getStartDate())
                .endDate(policy.getEndDate())
                .status(policy.getStatus())
                .build();
    }
}