package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.DTO.PaymentRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.PaymentResponseDTO;
import com.example.Gig.Worker.Insurance.Model.Payment;
import com.example.Gig.Worker.Insurance.mapper.PaymentMapper;
import com.example.Gig.Worker.Insurance.Repository.PaymentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    public PaymentResponseDTO createPayment(PaymentRequestDTO request) {
        Payment payment = PaymentMapper.toEntity(request);
        Payment saved = paymentRepository.save(payment);
        return PaymentMapper.toResponseDTO(saved);
    }

    @Override
    public List<PaymentResponseDTO> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(PaymentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PaymentResponseDTO getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Payment not found with ID: " + id));
        return PaymentMapper.toResponseDTO(payment);
    }

    @Override
    public List<PaymentResponseDTO> getPaymentsByWorker(Long workerId) {
        return paymentRepository.findByWorkerId(workerId)
                .stream()
                .map(PaymentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentResponseDTO> getPaymentsByPolicy(Long policyId) {
        return paymentRepository.findByPolicyId(policyId)
                .stream()
                .map(PaymentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentResponseDTO> getPaymentsByStatus(String status) {
        return paymentRepository.findByStatus(status)
                .stream()
                .map(PaymentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PaymentResponseDTO updatePaymentStatus(Long id, String status) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Payment not found with ID: " + id));
        payment.setStatus(status);
        Payment updated = paymentRepository.save(payment);
        return PaymentMapper.toResponseDTO(updated);
    }
}