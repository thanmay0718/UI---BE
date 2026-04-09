package com.example.Gig.Worker.Insurance.mapper;

import com.example.Gig.Worker.Insurance.DTO.WorkerRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.WorkerResponseDTO;
import com.example.Gig.Worker.Insurance.Model.Worker;
import com.example.Gig.Worker.Insurance.Model.User;

public class WorkerMapper {

    public static Worker toEntity(WorkerRequestDTO dto, User user) {
        Worker worker = new Worker();
        worker.setUser(user);
        worker.setArea(dto.getArea());
        worker.setPincode(dto.getPincode());
        worker.setAddress(dto.getAddress());
        worker.setDeliverySegment(dto.getDeliverySegment());
        worker.setAvgIncome(dto.getAvgIncome());
        worker.setAadhaarNumber(dto.getAadhaarNumber());   // encrypted by converter
        worker.setPanNumber(dto.getPanNumber());           // encrypted by converter
        worker.setBankAccountNumber(dto.getBankAccountNumber()); // encrypted
        worker.setBankName(dto.getBankName());
        return worker;
    }

    public static WorkerResponseDTO toResponseDTO(Worker worker) {
        WorkerResponseDTO dto = new WorkerResponseDTO();
        dto.setId(worker.getId());
        dto.setArea(worker.getArea());
        dto.setPincode(worker.getPincode());
        dto.setAddress(worker.getAddress());
        dto.setDeliverySegment(worker.getDeliverySegment());
        dto.setAvgIncome(worker.getAvgIncome());
        dto.setBankName(worker.getBankName());
        dto.setRiskScore(worker.getRiskScore());
        dto.setKycStatus(worker.getKycStatus());
        dto.setCreatedAt(worker.getCreatedAt());
        dto.setWorkingCity(worker.getWorkingCity());
        dto.setWorkingZone(worker.getWorkingZone());
        dto.setWorkingHours(worker.getWorkingHours());
        dto.setActivePlatforms(worker.getActivePlatforms());

        // Never expose aadhaar, PAN, bank account in response
        dto.setAadhaarNumber("XXXX-XXXX-" + maskLast4(worker.getAadhaarNumber()));
        dto.setPanNumber(maskPan(worker.getPanNumber()));
        dto.setBankAccountNumber("XXXX-XXXX-" + maskLast4(worker.getBankAccountNumber()));

        if (worker.getUser() != null) {
            dto.setUserId(worker.getUser().getId());
            dto.setEmail(worker.getUser().getEmail());
            dto.setUsername(worker.getUser().getUsername());
        }
        return dto;
    }

    private static String maskLast4(String value) {
        if (value == null || value.length() < 4) return "****";
        return value.substring(value.length() - 4);
    }

    private static String maskPan(String pan) {
        if (pan == null || pan.length() < 10) return "**********";
        return pan.substring(0, 2) + "XXXXXXX" + pan.substring(9);
    }
}