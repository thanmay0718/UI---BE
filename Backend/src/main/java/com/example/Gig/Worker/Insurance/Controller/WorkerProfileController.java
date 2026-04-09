package com.example.Gig.Worker.Insurance.Controller;

import com.example.Gig.Worker.Insurance.DTO.WorkingAreaRequest;
import com.example.Gig.Worker.Insurance.DTO.WorkingAreaResponse;
import com.example.Gig.Worker.Insurance.Service.WorkerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/worker/profile")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkerProfileController {

    private final WorkerService workerService;

    public WorkerProfileController(WorkerService workerService) {
        this.workerService = workerService;
    }

    @PutMapping("/working-area")
    public ResponseEntity<WorkingAreaResponse> updateWorkingArea(
            @RequestParam Long workerId, // In real app, extract from JWT SecurityContext
            @RequestBody WorkingAreaRequest request) {
        return ResponseEntity.ok(workerService.updateWorkingArea(workerId, request));
    }
}
