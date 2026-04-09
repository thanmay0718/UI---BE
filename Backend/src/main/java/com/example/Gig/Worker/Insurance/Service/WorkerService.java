package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.DTO.WorkerRequestDTO;
import com.example.Gig.Worker.Insurance.DTO.WorkerResponseDTO;
import com.example.Gig.Worker.Insurance.Model.Worker;

import java.util.List;

public interface WorkerService {

    WorkerResponseDTO createWorker(WorkerRequestDTO request);

    List<WorkerResponseDTO> getAllWorkers();

    WorkerResponseDTO getWorkerById(Long id);

    void deleteWorker(Long id);

    WorkerResponseDTO updateWorker(Long id, WorkerRequestDTO request);

    com.example.Gig.Worker.Insurance.DTO.WorkingAreaResponse updateWorkingArea(Long workerId, com.example.Gig.Worker.Insurance.DTO.WorkingAreaRequest request);
}