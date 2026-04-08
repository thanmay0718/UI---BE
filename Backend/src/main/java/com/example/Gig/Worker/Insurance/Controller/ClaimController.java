package com.example.Gig.Worker.Insurance.Controller;

import com.example.Gig.Worker.Insurance.DTO.ClaimRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.ClaimResponseDTO;
import com.example.Gig.Worker.Insurance.Service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/claims")           // ✅ versioned + plural
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping
    public ResponseEntity<ClaimResponseDTO> createClaim(
            @Valid @RequestBody ClaimRequestDTO request) {      // ✅ Added @Valid
        return ResponseEntity
                .status(HttpStatus.CREATED)                     // ✅ 201 Created
                .body(claimService.createClaim(request));
    }

    @GetMapping
    public ResponseEntity<List<ClaimResponseDTO>> getAllClaims() {
        return ResponseEntity.ok(claimService.getAllClaims());  // ✅ 200 OK
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClaimResponseDTO> getClaimById(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.getClaimById(id)); // ✅ 200 OK
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ClaimResponseDTO> approveClaim(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.approveClaim(id));
    }

    @PutMapping("/{id}/flag")
    public ResponseEntity<ClaimResponseDTO> flagClaim(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.flagClaim(id));
    }
}