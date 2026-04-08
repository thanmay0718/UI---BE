package com.example.Gig.Worker.Insurance.DTO;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentRequestDTO {

    @NotNull(message = "Worker ID is required")
    @Positive(message = "Worker ID must be a positive number")
    private Long workerId;

    @NotNull(message = "Policy ID is required")
    @Positive(message = "Policy ID must be a positive number")
    private Long policyId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Amount must be at least ₹1.00")
    @DecimalMax(value = "100000.00", message = "Amount cannot exceed ₹1,00,000")
    @Digits(integer = 8, fraction = 2, message = "Amount must have at most 2 decimal places")
    private BigDecimal amount;

    @NotBlank(message = "Payment type is required")
    @Pattern(
            regexp = "^(PREMIUM|PAYOUT|REFUND)$",
            message = "Payment type must be one of: PREMIUM, PAYOUT, REFUND"
    )
    private String paymentType;

    @NotBlank(message = "Payment method is required")
    @Pattern(
            regexp = "^(UPI|BANK_TRANSFER|WALLET|CARD)$",
            message = "Payment method must be one of: UPI, BANK_TRANSFER, WALLET, CARD"
    )
    private String paymentMethod;

    @NotBlank(message = "Currency is required")
    @Pattern(
            regexp = "^(INR|USD)$",
            message = "Currency must be INR or USD"
    )
    private String currency;

    @Size(max = 255, message = "Notes cannot exceed 255 characters")
    private String notes;
}