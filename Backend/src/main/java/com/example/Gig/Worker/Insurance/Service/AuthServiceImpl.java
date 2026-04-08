package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.DTO.AuthResponseDTO;
import com.example.Gig.Worker.Insurance.DTO.RegisterRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.WorkerResponseDTO;
import com.example.Gig.Worker.Insurance.Model.AppRole;
import com.example.Gig.Worker.Insurance.Model.User;
import com.example.Gig.Worker.Insurance.Repository.UserRepository;
import com.example.Gig.Worker.Insurance.security.JwtUtil;
import com.example.Gig.Worker.Insurance.security.request.LoginRequestDTO;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public AuthResponseDTO register(RegisterRequestDTO request) {

        if (userRepository.findByEmail(request.getEmail().toLowerCase()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        if (userRepository.findByUsername(request.getUsername().toLowerCase()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        // ✅ FIX 1: Read role from request — default to WORKER if null/invalid
        AppRole role;
        try {
            role = (request.getRole() != null && !request.getRole().isBlank())
                    ? AppRole.valueOf(request.getRole().toUpperCase())
                    : AppRole.WORKER;
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role. Allowed values: WORKER, ADMIN");
        }

        User user = new User();
        user.setName(request.getName());
        user.setUsername(request.getUsername().toLowerCase());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(role); // ✅ Now uses dynamic role
        user.setIsLoggedIn(false);

        User savedUser = userRepository.save(user);

        return AuthResponseDTO.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .loggedIn(savedUser.getIsLoggedIn())
                .success(true)
                .message("User registered successfully as " + savedUser.getRole().name())
                .build();
    }

    @Override
    public String login(LoginRequestDTO request) {

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        user.setIsLoggedIn(true);
        userRepository.save(user);

        return jwtUtil.generateAccessToken(user.getEmail());
    }

    @Override
    public String generateAccessToken(String email) {
        return jwtUtil.generateAccessToken(email);
    }

    @Override
    public String generateRefreshToken(String email) {
        return jwtUtil.generateRefreshToken(email);
    }

    @Override
    public WorkerResponseDTO getProfile(String email) {

        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return WorkerResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name()) // ✅ Return role in profile too
                .loggedIn(user.getIsLoggedIn())
                .message("Profile fetched successfully")
                .build();
    }

    @Override
    public String logout(String email) {

        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsLoggedIn(false);
        userRepository.save(user);

        return "Logged out successfully";
    }
}