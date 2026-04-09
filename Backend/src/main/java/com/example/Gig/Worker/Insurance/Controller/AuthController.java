package com.example.Gig.Worker.Insurance.Controller;

import com.example.Gig.Worker.Insurance.DTO.RegisterRequestDTO;
import com.example.Gig.Worker.Insurance.Service.AuthService;
import com.example.Gig.Worker.Insurance.security.JwtUtil;
import com.example.Gig.Worker.Insurance.security.request.LoginRequestDTO;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final com.example.Gig.Worker.Insurance.Service.EmailService emailService;

    public AuthController(AuthService authService,
                          JwtUtil jwtUtil,
                          AuthenticationManager authenticationManager,
                          com.example.Gig.Worker.Insurance.Service.EmailService emailService) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    // ✅ REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // ✅ SEND OTP (MOCKED / REAL)
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody java.util.Map<String, String> payload) {
        String contact = payload.get("contact");
        String method = payload.get("method");
        String generatedOtp = payload.get("otp");

        System.out.println("\n============ GIGSHIELD SECURITY LOG ============");
        System.out.println("Dispatching OTP: " + generatedOtp);
        System.out.println("Method: " + method);
        System.out.println("Destination: " + contact);
        System.out.println("================================================\n");

        if ("email".equalsIgnoreCase(method)) {
            // Once application.properties is configured, this will explicitly shoot the email.
            boolean sent = emailService.sendOtpEmail(contact, generatedOtp);
            if (!sent) {
                System.err.println("WARNING: spring.mail properties not set. Bypassing physical delivery.");
            }
        }

        return ResponseEntity.ok("OTP dispatched to " + contact + " via " + method);
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request,
                                   HttpServletResponse response) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = authService.login(request);
        String refreshToken = jwtUtil.generateRefreshToken(request.getEmail());

        // 🔥 ACCESS COOKIE
        Cookie accessCookie = new Cookie("accessToken", accessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(false); // ✅ for localhost
        accessCookie.setPath("/");
        accessCookie.setMaxAge(24 * 60 * 60);

        // 🔥 REFRESH COOKIE
        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false); // ✅ for localhost
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(7 * 24 * 60 * 60);

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok("Login successful");
    }

    // ✅ PROFILE
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(HttpServletRequest request) {

        String token = extractTokenFromCookies(request, "accessToken");

        if (token == null || !jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String email = jwtUtil.extractUsername(token);
        return ResponseEntity.ok(authService.getProfile(email));
    }

    // ✅ LOGOUT
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {

        Cookie accessCookie = new Cookie("accessToken", null);
        accessCookie.setMaxAge(0);
        accessCookie.setPath("/");

        Cookie refreshCookie = new Cookie("refreshToken", null);
        refreshCookie.setMaxAge(0);
        refreshCookie.setPath("/");

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok("Logged out successfully");
    }

    private String extractTokenFromCookies(HttpServletRequest request, String name) {

        if (request.getCookies() == null) return null;

        for (Cookie cookie : request.getCookies()) {
            if (cookie.getName().equals(name)) {
                return cookie.getValue();
            }
        }
        return null;
    }
}