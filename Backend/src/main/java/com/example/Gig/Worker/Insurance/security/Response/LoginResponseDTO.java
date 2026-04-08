package com.example.Gig.Worker.Insurance.security.Response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

// ✅ Only include non-null fields in JSON
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoginResponseDTO {

    private String message;

    private String email;

    private String role;

    private Boolean success;

    // 🔥 Optional fields
    private String accessToken;
    private String refreshToken;

    private LocalDateTime loginTime;
}