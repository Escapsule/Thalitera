package com.escapsule.thalitera.dto;

import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class MeetingRoomDTO {

    public String roomId;

    public String name;

    @Positive
    public int capacityMin;

    @Positive
    public int capacityMax;

    public String building;

    public int floor;

    public String status;

    public Object facilities;

    public String createdBy;

    public OffsetDateTime createdAt;

    public OffsetDateTime updatedAt;

    public String image;
}
