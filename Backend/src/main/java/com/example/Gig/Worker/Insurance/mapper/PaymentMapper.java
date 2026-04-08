package com.example.Gig.Worker.Insurance.mapper;

import com.example.Gig.Worker.Insurance.DTO.PaymentRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.PaymentResponseDTO;
import com.example.Gig.Worker.Insurance.Model.Payment;

public class PaymentMapper {

    public static Payment toEntity(PaymentRequestDTO dto) {
        return Payment.builder()
                .workerId(dto.getWorkerId())
                .policyId(dto.getPolicyId())
                .amount(dto.getAmount())
                .paymentType(dto.getPaymentType())
                .paymentMethod(dto.getPaymentMethod())
                .currency(dto.getCurrency())
                .notes(dto.getNotes())
                .status("PENDING")
                .build();
    }

    public static PaymentResponseDTO toResponseDTO(Payment payment) {
        return PaymentResponseDTO.builder()
                .id(payment.getId())
                .workerId(payment.getWorkerId())
                .policyId(payment.getPolicyId())
                .amount(payment.getAmount())
                .paymentType(payment.getPaymentType())
                .paymentMethod(payment.getPaymentMethod())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .notes(payment.getNotes())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }

    private PaymentMapper() {}
}