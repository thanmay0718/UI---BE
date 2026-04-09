package com.example.Gig.Worker.Insurance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GigWorkerInsuranceApplication {

	public static void main(String[] args) {
		SpringApplication.run(GigWorkerInsuranceApplication.class, args);
	}
}