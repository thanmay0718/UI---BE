package com.example.Gig.Worker.Insurance.Controller;

import com.example.Gig.Worker.Insurance.DTO.PolicyTemplateRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.PolicyTemplateResponseDTO;
import com.example.Gig.Worker.Insurance.Service.PolicyTemplateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/policy-templates")
public class PolicyTemplateController {

    private final PolicyTemplateService service;

    public PolicyTemplateController(PolicyTemplateService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<PolicyTemplateResponseDTO> createTemplate(@Valid @RequestBody PolicyTemplateRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createTemplate(request));
    }

    @GetMapping
    public ResponseEntity<List<PolicyTemplateResponseDTO>> getAllTemplates() {
        return ResponseEntity.ok(service.getAllTemplates());
    }
}
