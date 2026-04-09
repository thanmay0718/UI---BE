package com.example.Gig.Worker.Insurance.DTO;

import lombok.Data;
import java.util.List;

@Data
public class WorkingAreaResponse {
    private Long workerId;
    private String workingCity;
    private String workingZone;
    private String pincode;
    private List<String> activePlatforms;
    private String workingHours;
    private String message;
}
