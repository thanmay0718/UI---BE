package com.example.Gig.Worker.Insurance.Controller;

import com.example.Gig.Worker.Insurance.Model.User;
import com.example.Gig.Worker.Insurance.Repository.UserRepository;
import com.example.Gig.Worker.Insurance.Service.EmailService;
import com.example.Gig.Worker.Insurance.Service.TwilioVoiceOtpService;
import com.example.Gig.Worker.Insurance.security.JwtUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/auth/otp")
@RequiredArgsConstructor
public class VerificationController {

    private final TwilioVoiceOtpService twilioVoiceOtpService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    // In-memory email OTP store: email -> generated OTP
    private final Map<String, String> emailOtpCache = new ConcurrentHashMap<>();

    // In-memory attempt tracker: email/phone -> attempt count
    private final Map<String, Integer> otpAttempts = new ConcurrentHashMap<>();

    private final SecureRandom secureRandom = new SecureRandom();

    // ─────────────────────────────────────────────────────────────
    // POST /api/v1/auth/otp/initiate
    // Body: { "channel": "email" | "call", "phoneNumber": "+91..." }
    // Header: Authorization: Bearer <scopedJwt>
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/initiate")
    public ResponseEntity<Map<String, Object>> initiateOtp(
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {

        // Extract email from the scoped JWT (passed as Bearer header directly)
        String token = authHeader.replace("Bearer ", "").trim();
        String email = jwtUtil.extractUsername(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        String channel = body.getOrDefault("channel", "email").toLowerCase();

        if ("email".equals(channel)) {
            // Generate 6-digit OTP
            String otp = String.format("%06d", secureRandom.nextInt(1000000));
            emailOtpCache.put(email, otp);

            boolean sent = emailService.sendOtpEmail(email, otp);
            if (!sent) {
                return respond(false, HttpStatus.INTERNAL_SERVER_ERROR,
                        "Failed to send email OTP. Please check spring.mail configuration.");
            }

            System.out.println("[GigShield] \uD83D\uDCE7 Email OTP sent to: " + email + " | OTP: " + otp);
            return respond(true, HttpStatus.OK, "Email OTP sent to " + email);

        } else if ("call".equals(channel)) {
            String phone = body.get("phoneNumber");
            if (phone == null || phone.isBlank()) {
                return respond(false, HttpStatus.BAD_REQUEST, "phoneNumber is required for voice call channel");
            }

            // Save phone number to DB for verification step
            user.setPhoneNumber(phone);
            userRepository.save(user);

            twilioVoiceOtpService.initiateVoiceOtp(phone);
            System.out.println("[GigShield] \uD83D\uDCDE Voice OTP call initiated to: " + phone);
            return respond(true, HttpStatus.OK, "AI Voice call initiated to " + phone + ". Please answer your phone.");
        }

        return respond(false, HttpStatus.BAD_REQUEST, "Invalid channel. Use 'email' or 'call'.");
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/v1/auth/otp/verify
    // Body: { "channel": "email" | "call", "code": "123456" }
    // Header: Authorization: Bearer <scopedJwt>
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyOtp(
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader,
            HttpServletResponse response) {

        String token = authHeader.replace("Bearer ", "").trim();
        String email = jwtUtil.extractUsername(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        String channel = body.getOrDefault("channel", "email").toLowerCase();
        String code = body.get("code");

        // Rate-limit key: email for email OTP, phone for voice
        String rateLimitKey = "email".equals(channel) ? email : user.getPhoneNumber();
        int attempts = otpAttempts.getOrDefault(rateLimitKey, 0);

        if (attempts >= 3) {
            return respond(false, HttpStatus.TOO_MANY_REQUESTS,
                    "Maximum attempts reached. Please restart the verification process.");
        }

        boolean valid = false;

        if ("email".equals(channel)) {
            String cached = emailOtpCache.get(email);
            valid = cached != null && cached.equals(code);
            if (valid) emailOtpCache.remove(email);

        } else if ("call".equals(channel)) {
            String phone = user.getPhoneNumber();
            if (phone == null) {
                return respond(false, HttpStatus.BAD_REQUEST,
                        "No phone number found. Please initiate voice call first.");
            }
            valid = twilioVoiceOtpService.verifyOtp(phone, code);
        }

        if (valid) {
            // Mark user verified
            user.setIsVerified(true);
            userRepository.save(user);
            otpAttempts.remove(rateLimitKey);

            // Issue a full-access JWT (7-day) in an httpOnly cookie
            String fullJwt = jwtUtil.generateToken(email);

            Cookie accessCookie = new Cookie("accessToken", fullJwt);
            accessCookie.setHttpOnly(true);
            accessCookie.setSecure(false); // set to true in production (HTTPS)
            accessCookie.setPath("/");
            accessCookie.setMaxAge(7 * 24 * 60 * 60);
            response.addCookie(accessCookie);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Verification complete! Redirecting to dashboard...");
            resp.put("token", fullJwt); // also return in body for frontend flexibility
            return ResponseEntity.ok(resp);

        } else {
            int newAttempts = attempts + 1;
            otpAttempts.put(rateLimitKey, newAttempts);
            int remaining = 3 - newAttempts;

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "Incorrect code. " + remaining + " attempt(s) remaining.");
            resp.put("attemptsRemaining", remaining);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(resp);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────────────────────
    private ResponseEntity<Map<String, Object>> respond(boolean success, HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", success);
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
