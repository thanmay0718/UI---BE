package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.DTO.AuthResponseDTO;
import com.example.Gig.Worker.Insurance.DTO.RegisterRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.WorkerRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.WorkerResponseDTO;
import com.example.Gig.Worker.Insurance.security.request.LoginRequestDTO;

public interface AuthService {

//    WorkerResponseDTO register(WorkerRequestDTO request);
    // In AuthService.java — change this one line
    AuthResponseDTO register(RegisterRequestDTO request);  // ✅ was WorkerRequestDTO

    String login(LoginRequestDTO request);

    String generateAccessToken(String email);

    String generateRefreshToken(String email);

    WorkerResponseDTO getProfile(String email);

    String logout(String email);
}