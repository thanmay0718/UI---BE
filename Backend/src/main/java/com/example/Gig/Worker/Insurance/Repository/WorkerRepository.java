package com.example.Gig.Worker.Insurance.Repository;

import com.example.Gig.Worker.Insurance.Model.User;
import com.example.Gig.Worker.Insurance.Model.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {

    Optional<Worker> findByUser_Email(String email);

    // ✅ Required by WorkerServiceImpl duplicate-guard check
    boolean existsByUser(User user);
}