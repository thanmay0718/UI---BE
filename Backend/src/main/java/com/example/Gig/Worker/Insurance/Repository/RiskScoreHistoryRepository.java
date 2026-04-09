package com.example.Gig.Worker.Insurance.Repository;

import com.example.Gig.Worker.Insurance.Model.RiskScoreHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RiskScoreHistoryRepository extends JpaRepository<RiskScoreHistory, Long> {

    /** Fetch history within a date range (used for WEEK, MONTH, etc.) */
    @Query("SELECT r FROM RiskScoreHistory r WHERE r.workerId = :workerId AND r.recordedAt >= :startDate ORDER BY r.recordedAt ASC")
    List<RiskScoreHistory> findByWorkerIdAndRecordedAtAfterOrderByRecordedAtAsc(
            @Param("workerId") Long workerId,
            @Param("startDate") LocalDateTime startDate);

    /** Fetch ALL history from registration date — no date filter */
    @Query("SELECT r FROM RiskScoreHistory r WHERE r.workerId = :workerId ORDER BY r.recordedAt ASC")
    List<RiskScoreHistory> findByWorkerIdOrderByRecordedAtAsc(@Param("workerId") Long workerId);

    /** Check if any record exists for this worker (to avoid duplicate daily snapshots) */
    boolean existsByWorkerIdAndRecordedAtBetween(Long workerId, LocalDateTime start, LocalDateTime end);
}
