package com.example.Gig.Worker.Insurance.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.concurrent.Executor;

/**
 * AsyncConfig — Thread pool for @Async AI processing
 *
 * Ensures TriggerEngine and AI Orchestration run on a dedicated thread pool,
 * not the main HTTP request thread. This keeps API responses instant.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "aiTaskExecutor")
    public Executor aiTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);        // Base threads always alive
        executor.setMaxPoolSize(10);        // Max concurrent AI pipelines
        executor.setQueueCapacity(50);      // Queue up to 50 pending claims
        executor.setThreadNamePrefix("GigShieldAI-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }
}
