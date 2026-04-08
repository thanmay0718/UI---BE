package com.example.Gig.Worker.Insurance.Controller;

import com.example.Gig.Worker.Insurance.DTO.PaymentRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.PaymentResponseDTO;
import com.example.Gig.Worker.Insurance.Service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // POST /api/v1/payments
    @PostMapping
    public ResponseEntity<PaymentResponseDTO> createPayment(
            @Valid @RequestBody PaymentRequestDTO request) {
        PaymentResponseDTO response = paymentService.createPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/v1/payments
    @GetMapping
    public ResponseEntity<List<PaymentResponseDTO>> getAllPayments() {
        List<PaymentResponseDTO> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    // GET /api/v1/payments/{id}
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDTO> getPaymentById(
            @PathVariable Long id) {
        PaymentResponseDTO payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(payment);
    }

    // GET /api/v1/payments/worker/{workerId}
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByWorker(
            @PathVariable Long workerId) {
        List<PaymentResponseDTO> payments = paymentService.getPaymentsByWorker(workerId);
        return ResponseEntity.ok(payments);
    }

    // GET /api/v1/payments/policy/{policyId}
    @GetMapping("/policy/{policyId}")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByPolicy(
            @PathVariable Long policyId) {
        List<PaymentResponseDTO> payments = paymentService.getPaymentsByPolicy(policyId);
        return ResponseEntity.ok(payments);
    }

    // GET /api/v1/payments/status/{status}
    @GetMapping("/status/{status}")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByStatus(
            @PathVariable String status) {
        List<PaymentResponseDTO> payments = paymentService.getPaymentsByStatus(status);
        return ResponseEntity.ok(payments);
    }

    // PATCH /api/v1/payments/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<PaymentResponseDTO> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        PaymentResponseDTO updated = paymentService.updatePaymentStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}