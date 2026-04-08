package com.example.Gig.Worker.Insurance.Controller;

import com.example.Gig.Worker.Insurance.DTO.PolicyRequestDTO;
import com.example.Gig.Worker.Insurance.Service.PolicyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/policies")
public class PolicyController {

    private final PolicyService policyService;

    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    // POST /api/v1/policies
    @PostMapping
    public ResponseEntity<?> createPolicy(@Valid @RequestBody PolicyRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(policyService.createPolicy(request));
    }

    // GET /api/v1/policies
    @GetMapping
    public ResponseEntity<?> getAllPolicies() {
        return ResponseEntity.ok(policyService.getAllPolicies());
    }

    // GET /api/v1/policies/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getPolicyById(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.getPolicyById(id));
    }

    // GET /api/v1/policies?workerId=123
    @GetMapping(params = "workerId")
    public ResponseEntity<?> getPoliciesByWorker(@RequestParam Long workerId) {
        return ResponseEntity.ok(policyService.getPoliciesByWorker(workerId));
    }

    // PUT /api/v1/policies/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePolicy(@PathVariable Long id,
                                          @Valid @RequestBody PolicyRequestDTO dto) {
        return ResponseEntity.ok(policyService.updatePolicy(id, dto));
    }

    // DELETE /api/v1/policies/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return ResponseEntity.noContent().build();
    }
}