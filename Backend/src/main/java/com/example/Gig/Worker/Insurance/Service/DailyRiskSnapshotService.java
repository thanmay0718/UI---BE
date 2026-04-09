package com.example.Gig.Worker.Insurance.Service;

import com.example.Gig.Worker.Insurance.DTO.RiskScoreResponse;
import com.example.Gig.Worker.Insurance.Model.RiskScoreHistory;
import com.example.Gig.Worker.Insurance.Model.Worker;
import com.example.Gig.Worker.Insurance.Repository.RiskScoreHistoryRepository;
import com.example.Gig.Worker.Insurance.Repository.WorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DailyRiskSnapshotService
 *
 * Runs every day at midnight (and also on app startup for any workers missing
 * historical entries). It calls the real external APIs for each worker's city,
 * calculates combined risk, and persists a RiskScoreHistory record.
 *
 * On worker registration we also call #captureSnapshotForWorker so that
 * every user immediately has a Day-1 record.
 */
@Service
public class DailyRiskSnapshotService {

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private RiskScoreHistoryRepository riskScoreHistoryRepository;

    @Autowired
    private RiskScoreService riskScoreService;

    // ── Runs at 00:05 every day ─────────────────────────────────────────────
    @Scheduled(cron = "0 5 0 * * *")
    public void runDailySnapshots() {
        List<Worker> workers = workerRepository.findAll();
        System.out.println("[DailyRiskSnapshot] Running for " + workers.size() + " workers");
        for (Worker worker : workers) {
            captureSnapshotForWorker(worker);
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // Public helper — called by WorkerServiceImpl on registration so Day-1
    // data is stored immediately and is visible in Risk History right away.
    // ────────────────────────────────────────────────────────────────────────
    public void captureSnapshotForWorker(Worker worker) {
        try {
            String city = worker.getWorkingCity();
            if (city == null || city.isBlank()) {
                city = worker.getArea();   // fallback to old area field
            }
            if (city == null || city.isBlank()) {
                System.out.println("[DailyRiskSnapshot] Skipping worker " + worker.getId() + " — no city configured");
                return;
            }

            // Guard: don't write more than one record per day per worker
            LocalDateTime todayStart = LocalDate.now().atStartOfDay();
            LocalDateTime todayEnd   = todayStart.plusDays(1);
            if (riskScoreHistoryRepository.existsByWorkerIdAndRecordedAtBetween(worker.getId(), todayStart, todayEnd)) {
                return; // already snapshotted today
            }

            // Call real external APIs
            RiskScoreResponse weather = riskScoreService.getWeatherRisk(city);
            RiskScoreResponse aqi     = riskScoreService.getAqiRisk(city);

            double weatherScore = weather.getWeatherScore();
            double aqiScore     = aqi.getAqiScore();
            // Simple combined: weather 60% + aqi 40%
            double overall = Math.min((weatherScore * 0.6) + (aqiScore * 0.4), 100.0);

            RiskScoreHistory snapshot = RiskScoreHistory.builder()
                    .workerId(worker.getId())
                    .weatherScore(weatherScore)
                    .aqiScore(aqiScore)
                    .overallScore(overall)
                    .recordedAt(LocalDateTime.now())
                    .build();

            riskScoreHistoryRepository.save(snapshot);
            System.out.println("[DailyRiskSnapshot] Saved for worker " + worker.getId() + " | city=" + city + " | overall=" + overall);
        } catch (Exception e) {
            System.err.println("[DailyRiskSnapshot] Error for worker " + worker.getId() + ": " + e.getMessage());
        }
    }
}
