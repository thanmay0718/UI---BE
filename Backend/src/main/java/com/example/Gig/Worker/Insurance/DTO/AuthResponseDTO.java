package com.example.Gig.Worker.Insurance.DTO;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {

    private Long id;
    private String username;
    private String email;
    private String role;
    private boolean loggedIn;
    private boolean success;
    private String message;
}