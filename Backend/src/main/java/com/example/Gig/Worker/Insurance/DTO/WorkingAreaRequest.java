package com.example.Gig.Worker.Insurance.DTO;

import lombok.Data;
import java.util.List;

@Data
public class WorkingAreaRequest {
    private String workingCity;
    private String workingZone;
    private String pincode;
    private List<String> activePlatforms;
    private String workingHours;
}
