package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.DTO.PolicyTemplateRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.PolicyTemplateResponseDTO;
import com.example.Gig.Worker.Insurance.Model.PolicyTemplate;
import com.example.Gig.Worker.Insurance.Repository.PolicyTemplateRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PolicyTemplateService {
    
    private final PolicyTemplateRepository repository;

    public PolicyTemplateService(PolicyTemplateRepository repository) {
        this.repository = repository;
    }

    public PolicyTemplateResponseDTO createTemplate(PolicyTemplateRequestDTO dto) {
        PolicyTemplate template = PolicyTemplate.builder()
                .policyName(dto.getPolicyName())
                .category(dto.getCategory())
                .oracleFeed(dto.getOracleFeed())
                .description(dto.getDescription())
                .triggers(dto.getTriggers())
                .premiumAmount(dto.getPremiumAmount())
                .coverageAmount(dto.getCoverageAmount())
                .aiConfidence(dto.getAiConfidence())
                .createdAt(LocalDateTime.now())
                .build();
        
        PolicyTemplate saved = repository.save(template);
        return mapToDTO(saved);
    }
    
    public List<PolicyTemplateResponseDTO> getAllTemplates() {
        return repository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private PolicyTemplateResponseDTO mapToDTO(PolicyTemplate entity) {
        return PolicyTemplateResponseDTO.builder()
                .id(entity.getId())
                .policyName(entity.getPolicyName())
                .category(entity.getCategory())
                .oracleFeed(entity.getOracleFeed())
                .description(entity.getDescription())
                .triggers(entity.getTriggers())
                .premiumAmount(entity.getPremiumAmount())
                .coverageAmount(entity.getCoverageAmount())
                .aiConfidence(entity.getAiConfidence())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
