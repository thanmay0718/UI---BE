package com.example.Gig.Worker.Insurance.Controller;

import com.example.Gig.Worker.Insurance.DTO.WorkerRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.WorkerResponseDTO;
import com.example.Gig.Worker.Insurance.Service.WorkerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workers")         // ✅ plural + versioned
public class WorkerController {

    private final WorkerService workerService;

    public WorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }

    @PostMapping
    public ResponseEntity<WorkerResponseDTO> createWorker(   // ✅ ResponseEntity for status codes
                                                             @Valid @RequestBody WorkerRequestDTO request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)                  // ✅ 201 instead of 200
                .body(workerService.createWorker(request));
    }

    @GetMapping
    public ResponseEntity<List<WorkerResponseDTO>> getAllWorkers() {
        return ResponseEntity.ok(workerService.getAllWorkers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkerResponseDTO> getWorkerById(@PathVariable Long id) {
        return ResponseEntity.ok(workerService.getWorkerById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkerResponseDTO> updateWorker(
            @PathVariable Long id,
            @Valid @RequestBody WorkerRequestDTO request) {  // ✅ Added @Valid
        return ResponseEntity.ok(workerService.updateWorker(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteWorker(@PathVariable Long id) {
        workerService.deleteWorker(id);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body("Worker deleted successfully");        // ✅ lowercase consistent msg
    }
}