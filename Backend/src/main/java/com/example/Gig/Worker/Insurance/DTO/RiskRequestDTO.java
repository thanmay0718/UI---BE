package com.example.Gig.Worker.Insurance.DTO;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskRequestDTO {

    @NotNull(message = "Worker ID is required")
    private Long workerId;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Zone is required")
    @Pattern(regexp = "URBAN|SEMI_URBAN|RURAL|COASTAL|INDUSTRIAL|HILLY",
            message = "Invalid zone type")
    private String zone;

    @NotBlank(message = "Platform is required")
    private String platform;
}