package com.example.Gig.Worker.Insurance.Service;

import com.twilio.Twilio;
import com.twilio.exception.ApiException;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TwilioVoiceOtpService {

    @Value("${twilio.account.sid:#{null}}")
    private String accountSid;

    @Value("${twilio.auth.token:#{null}}")
    private String authToken;

    @Value("${twilio.verify.service.sid:#{null}}")
    private String verifyServiceSid;

    private boolean twilioEnabled = false;

    @PostConstruct
    public void init() {
        if (accountSid != null && authToken != null &&
            !accountSid.isBlank() && !authToken.isBlank()) {
            Twilio.init(accountSid, authToken);
            twilioEnabled = true;
            System.out.println("[GigShield] ✅ Twilio Voice OTP Service initialized.");
        } else {
            System.err.println("[GigShield] ⚠️  Twilio credentials not set. " +
                "Set twilio.account.sid, twilio.auth.token, twilio.verify.service.sid in application.properties");
        }
    }

    /**
     * Initiates an AI voice call to the given phone number.
     * Twilio's AI reads: "Your GigShield verification code is X X X X X X. I repeat..."
     *
     * @param phoneNumber E.164 format e.g. +919876543210
     * @throws RuntimeException if Twilio is not configured or call fails
     */
    public void initiateVoiceOtp(String phoneNumber) {
        if (!twilioEnabled) {
            throw new RuntimeException(
                "AI Voice Call service is not configured. " +
                "Please set Twilio credentials in application.properties to enable this feature.");
        }

        try {
            Verification verification = Verification.creator(
                    verifyServiceSid,
                    phoneNumber,
                    "call"   // "call" = Twilio AI reads OTP aloud over a voice call
            ).create();

            System.out.println("[GigShield] ✅ Voice OTP call initiated to " + phoneNumber +
                               " | Status: " + verification.getStatus());
        } catch (ApiException e) {
            System.err.println("[GigShield] ❌ Twilio ApiException: " + e.getMessage());
            throw new RuntimeException("Failed to initiate voice call: " + e.getMessage());
        }
    }

    /**
     * Verifies the OTP code entered by the user.
     *
     * @param phoneNumber E.164 format phone number
     * @param code        6-digit code entered by user
     * @return true if approved, false if rejected
     */
    public boolean verifyOtp(String phoneNumber, String code) {
        if (!twilioEnabled) {
            throw new RuntimeException("Twilio service is not configured.");
        }

        try {
            VerificationCheck verificationCheck = VerificationCheck.creator(
                    verifyServiceSid
            ).setTo(phoneNumber).setCode(code).create();

            boolean approved = "approved".equalsIgnoreCase(verificationCheck.getStatus());
            System.out.println("[GigShield] Voice OTP verify for " + phoneNumber +
                               " | Status: " + verificationCheck.getStatus());
            return approved;
        } catch (ApiException e) {
            System.err.println("[GigShield] ❌ Twilio Verify Check failed: " + e.getMessage());
            return false;
        }
    }
}
