package com.escapsule.thalitera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
public class MeetingRoomUtilizationDTO {
    private UUID roomId;

    private String roomName;

    private double bookedHours;
    
    private double availableHours;

    private BigDecimal utilizationRate; // utilizationRate = bookedHours / availableHours
}
