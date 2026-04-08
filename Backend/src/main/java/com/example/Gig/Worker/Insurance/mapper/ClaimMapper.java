package com.example.Gig.Worker.Insurance.mapper;

import com.example.Gig.Worker.Insurance.DTO.ClaimRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.ClaimResponseDTO;
import com.example.Gig.Worker.Insurance.Model.Claim;

public class ClaimMapper {

    public static Claim toEntity(ClaimRequestDTO dto){

        Claim claim = new Claim();

        claim.setWorkerId(dto.getWorkerId());
        claim.setPolicyId(dto.getPolicyId());
        claim.setDescription(dto.getDescription());
        claim.setAmount(dto.getAmount());
        claim.setLocation(dto.getLocation());

        return claim;
    }

    public static ClaimResponseDTO toResponseDTO(Claim claim){

        ClaimResponseDTO dto = new ClaimResponseDTO();

        dto.setId(claim.getId());
        dto.setWorkerId(claim.getWorkerId());
        dto.setPolicyId(claim.getPolicyId());
        dto.setDescription(claim.getDescription());
        dto.setAmount(claim.getAmount());
        dto.setLocation(claim.getLocation());
        dto.setStatus(claim.getStatus());
        dto.setFraudFlag(claim.getFraudFlag());
        dto.setClaimDate(claim.getClaimDate());

        return dto;
    }
}