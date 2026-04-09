package com.example.Gig.Worker.Insurance.Repository;

import com.example.Gig.Worker.Insurance.Model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByWorkerId(Long workerId);

    List<Claim> findByWorkerIdAndPolicyId(Long workerId, Long policyId);

    // Fraud Detection: Claims within a recent time window
    @Query("SELECT c FROM Claim c WHERE c.workerId = :workerId AND c.claimDate >= :since ORDER BY c.claimDate DESC")
    List<Claim> findRecentClaimsByWorker(@Param("workerId") Long workerId,
                                         @Param("since") LocalDateTime since);

    // Audit / Dashboard: All claims by trigger source
    List<Claim> findByTriggerSource(String triggerSource);

    // Audit: Claims by decision
    List<Claim> findByDecision(String decision);

    // Audit: Claims by disruption type for a time range
    @Query("SELECT c FROM Claim c WHERE c.disruptionType = :type AND c.claimDate >= :since")
    List<Claim> findByDisruptionTypeSince(@Param("type") String disruptionType,
                                           @Param("since") LocalDateTime since);

    // Count: active auto-claims per area in the last N hours (for scheduler dedup)
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.location = :area AND c.triggerSource = 'SYSTEM_AUTO_TRIGGER' AND c.claimDate >= :since")
    long countAutoClaimsForAreaSince(@Param("area") String area,
                                      @Param("since") LocalDateTime since);

    // Claims by status
    List<Claim> findByStatus(String status);
}