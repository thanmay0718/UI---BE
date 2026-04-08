package com.example.Gig.Worker.Insurance.Repository;

import com.example.Gig.Worker.Insurance.Model.RiskScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RiskScoreRepository extends JpaRepository<RiskScore, Long> {

    // Get all risk scores for a worker
    List<RiskScore> findByWorkerId(Long workerId);

    // Get latest risk score for a worker
    Optional<RiskScore> findTopByWorkerIdOrderByCalculatedAtDesc(Long workerId);

    // Get risk score for a worker for a specific week
    Optional<RiskScore> findByWorkerIdAndWeekStartDate(Long workerId, LocalDate weekStartDate);

    // Count how many HIGH risk scores a worker has
    int countByWorkerIdAndRiskLevel(Long workerId, String riskLevel);
}