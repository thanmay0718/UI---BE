package com.example.Gig.Worker.Insurance.DTO;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkerRequestDTO {

    @Email @NotBlank(message = "Email is required to link your account")
    private String email;

    @NotBlank(message = "Area is required")
    private String area;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Enter a valid 6-digit pincode")
    private String pincode;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Delivery segment is required")
    private String deliverySegment;   // FOOD, ECOMMERCE, GROCERY

    @NotNull(message = "Average income is required")
    private Double avgIncome;

    @NotBlank(message = "Aadhaar number is required")
    @Pattern(regexp = "^[2-9]{1}[0-9]{11}$", message = "Enter a valid 12-digit Aadhaar number")
    private String aadhaarNumber;

    @NotBlank(message = "PAN number is required")
    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$", message = "Enter a valid PAN (e.g. ABCDE1234F)")
    private String panNumber;

    @NotBlank(message = "Bank account number is required")
    private String bankAccountNumber;

    @NotBlank(message = "Bank name is required")
    private String bankName;
}