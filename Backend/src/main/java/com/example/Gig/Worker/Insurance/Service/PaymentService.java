package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.DTO.PaymentRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.PaymentResponseDTO;

import java.util.List;

public interface PaymentService {
    PaymentResponseDTO createPayment(PaymentRequestDTO request);
    List<PaymentResponseDTO> getAllPayments();
    PaymentResponseDTO getPaymentById(Long id);
    List<PaymentResponseDTO> getPaymentsByWorker(Long workerId);    // ← new
    List<PaymentResponseDTO> getPaymentsByPolicy(Long policyId);    // ← new
    List<PaymentResponseDTO> getPaymentsByStatus(String status);    // ← new
    PaymentResponseDTO updatePaymentStatus(Long id, String status); // ← new
}