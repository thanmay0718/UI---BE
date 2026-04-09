package com.example.Gig.Worker.Insurance.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username:#{null}}")
    private String senderEmail;

    public boolean sendOtpEmail(String toEmail, String otp) {
        if (javaMailSender == null || senderEmail == null) {
            System.err.println(
                    "[GigShield] ⚠️ JavaMailSender not configured. Set spring.mail properties in application.properties.");
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("GigShield AI <" + senderEmail + ">");
            message.setTo(toEmail);
            message.setSubject("🔐 Your GigShield AI Security Verification Code");
            message.setText(
                    "Hello!\n\n" +
                            "Your GigShield AI verification code is:\n\n" +
                            "  " + otp + "\n\n" +
                            "This code expires in 10 minutes. Do NOT share it with anyone.\n\n" +
                            "If you didn't request this, please ignore this email.\n\n" +
                            "— GigShield AI Security Team");

            javaMailSender.send(message);
            System.out.println("[GigShield] ✅ OTP email sent to: " + toEmail);
            return true;

        } catch (Exception e) {
            System.err.println("[GigShield] ❌ Failed to send email to " + toEmail + ": " + e.getMessage());
            return false;
        }
    }
}
