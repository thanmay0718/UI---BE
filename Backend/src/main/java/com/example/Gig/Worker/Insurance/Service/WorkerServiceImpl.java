package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.DTO.WorkerRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.WorkerResponseDTO;
import com.example.Gig.Worker.Insurance.Model.Worker;
import com.example.Gig.Worker.Insurance.Model.User;
import com.example.Gig.Worker.Insurance.Repository.WorkerRepository;
import com.example.Gig.Worker.Insurance.Repository.UserRepository;
import com.example.Gig.Worker.Insurance.exception.ResourceNotFoundException;
import com.example.Gig.Worker.Insurance.mapper.WorkerMapper;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkerServiceImpl implements WorkerService {

    private final WorkerRepository workerRepository;
    private final UserRepository userRepository;

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

        // Update only worker fields
        worker.setArea(request.getArea());
        worker.setPincode(request.getPincode());
        worker.setAddress(request.getAddress());
        worker.setDeliverySegment(request.getDeliverySegment());
        worker.setAvgIncome(request.getAvgIncome());
        worker.setAadhaarNumber(request.getAadhaarNumber());
        worker.setPanNumber(request.getPanNumber());
        worker.setBankAccountNumber(request.getBankAccountNumber());
        worker.setBankName(request.getBankName());

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
}