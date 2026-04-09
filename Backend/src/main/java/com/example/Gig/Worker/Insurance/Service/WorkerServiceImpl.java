package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.DTO.WorkerRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.WorkerResponseDTO;
import com.example.Gig.Worker.Insurance.Model.Worker;
import com.example.Gig.Worker.Insurance.Model.User;
import com.example.Gig.Worker.Insurance.Repository.WorkerRepository;
import com.example.Gig.Worker.Insurance.Repository.UserRepository;
import com.example.Gig.Worker.Insurance.exception.ResourceNotFoundException;
import com.example.Gig.Worker.Insurance.mapper.WorkerMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkerServiceImpl implements WorkerService {

    private final WorkerRepository workerRepository;
    private final UserRepository userRepository;

    @Autowired
    private DailyRiskSnapshotService dailyRiskSnapshotService;

    public WorkerServiceImpl(WorkerRepository workerRepository,
                             UserRepository userRepository) {
        this.workerRepository = workerRepository;
        this.userRepository = userRepository;
    }

    @Override
    public WorkerResponseDTO createWorker(WorkerRequestDTO request) {

        // Step 1: Find existing user
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found. Please register first."));

        // Step 2: Prevent duplicate worker
        if (workerRepository.existsByUser(user)) {
            throw new IllegalStateException("Worker profile already exists");
        }

        // Step 3: Create Worker (ONLY worker fields)
        Worker worker = WorkerMapper.toEntity(request, user);

        Worker savedWorker = workerRepository.save(worker);

        // Capture Day-1 risk snapshot immediately after registration
        // so Risk History is populated from registration date
        try {
            dailyRiskSnapshotService.captureSnapshotForWorker(savedWorker);
        } catch (Exception e) {
            System.err.println("[WorkerServiceImpl] Could not capture Day-1 snapshot: " + e.getMessage());
        }

        return WorkerMapper.toResponseDTO(savedWorker);
    }

    @Override
    public List<WorkerResponseDTO> getAllWorkers() {
        return workerRepository.findAll()
                .stream()
                .map(WorkerMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public WorkerResponseDTO getWorkerById(Long id) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Worker not found with id: " + id));
        return WorkerMapper.toResponseDTO(worker);
    }

    @Override
    public WorkerResponseDTO updateWorker(Long id, WorkerRequestDTO request) {

        Worker worker = workerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Worker not found with id: " + id));

        worker.setArea(request.getArea());
        worker.setPincode(request.getPincode());
        worker.setAddress(request.getAddress());
        worker.setDeliverySegment(request.getDeliverySegment());
        worker.setAvgIncome(request.getAvgIncome());
        worker.setBankName(request.getBankName());

        if (request.getAadhaarNumber() != null && !request.getAadhaarNumber().contains("X")) {
            worker.setAadhaarNumber(request.getAadhaarNumber());
        }
        if (request.getPanNumber() != null && !request.getPanNumber().contains("X")) {
            worker.setPanNumber(request.getPanNumber());
        }
        if (request.getBankAccountNumber() != null && !request.getBankAccountNumber().contains("X")) {
            worker.setBankAccountNumber(request.getBankAccountNumber());
        }

        Worker updatedWorker = workerRepository.save(worker);

        return WorkerMapper.toResponseDTO(updatedWorker);
    }

    @Override
    public void deleteWorker(Long id) {

        Worker worker = workerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Worker not found with id: " + id));

        workerRepository.delete(worker);
    }

    @Override
    public com.example.Gig.Worker.Insurance.DTO.WorkingAreaResponse updateWorkingArea(Long workerId, com.example.Gig.Worker.Insurance.DTO.WorkingAreaRequest request) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id: " + workerId));

        worker.setWorkingCity(request.getWorkingCity());
        worker.setWorkingZone(request.getWorkingZone());
        worker.setPincode(request.getPincode());
        
        if (request.getActivePlatforms() != null && !request.getActivePlatforms().isEmpty()) {
            worker.setActivePlatforms(String.join(",", request.getActivePlatforms()));
        } else {
            worker.setActivePlatforms("");
        }
        
        worker.setWorkingHours(request.getWorkingHours());

        Worker savedWorker = workerRepository.save(worker);

        com.example.Gig.Worker.Insurance.DTO.WorkingAreaResponse response = new com.example.Gig.Worker.Insurance.DTO.WorkingAreaResponse();
        response.setWorkerId(savedWorker.getId());
        response.setWorkingCity(savedWorker.getWorkingCity());
        response.setWorkingZone(savedWorker.getWorkingZone());
        response.setPincode(savedWorker.getPincode());
        response.setWorkingHours(savedWorker.getWorkingHours());
        
        if (savedWorker.getActivePlatforms() != null && !savedWorker.getActivePlatforms().isEmpty()) {
            response.setActivePlatforms(java.util.Arrays.asList(savedWorker.getActivePlatforms().split(",")));
        } else {
            response.setActivePlatforms(new java.util.ArrayList<>());
        }
        
        response.setMessage("Working Area successfully updated");

        return response;
    }
}