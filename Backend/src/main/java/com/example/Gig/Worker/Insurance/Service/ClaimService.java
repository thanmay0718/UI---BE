package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.DTO.ClaimRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.ClaimResponseDTO;
import com.example.Gig.Worker.Insurance.Fraud.FraudDetectionService;
import com.example.Gig.Worker.Insurance.Model.Claim;
import com.example.Gig.Worker.Insurance.Repository.ClaimRepository;
import com.example.Gig.Worker.Insurance.mapper.ClaimMapper;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final FraudDetectionService fraudService;

    public ClaimService(ClaimRepository claimRepository,
                        FraudDetectionService fraudService) {
        this.claimRepository = claimRepository;
        this.fraudService = fraudService;
    }

    public ClaimResponseDTO createClaim(ClaimRequestDTO request) {

        Claim claim = ClaimMapper.toEntity(request);

        claim.setStatus("PENDING");
        claim.setClaimDate(LocalDateTime.now());

        // Fraud Detection
        boolean fraud = fraudService.isDuplicateClaim(claim);
        claim.setFraudFlag(fraud);

        Claim savedClaim = claimRepository.save(claim);

        return ClaimMapper.toResponseDTO(savedClaim);
    }

    public List<ClaimResponseDTO> getAllClaims() {

        return claimRepository.findAll()
                .stream()
                .map(ClaimMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public ClaimResponseDTO getClaimById(Long id) {

        Claim claim = claimRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Claim not found with id: " + id));

        return ClaimMapper.toResponseDTO(claim);
    }

    public ClaimResponseDTO approveClaim(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));
        claim.setStatus("APPROVED");
        return ClaimMapper.toResponseDTO(claimRepository.save(claim));
    }

    public ClaimResponseDTO flagClaim(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));
        claim.setStatus("FLAGGED");
        return ClaimMapper.toResponseDTO(claimRepository.save(claim));
    }
}