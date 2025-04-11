package com.escapsule.thalitera.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class MeetingRoomDTO {

    public String roomId;

    @NotBlank
    public String name;

    @Positive
    public int capacityMin;

    @Positive
    public int capacityMax;

    @NotBlank
    public String building;

    @NotNull
    public Integer floor;

    public String status;

    @NotNull
    public Object facilities;

    @NotBlank
    public String createdBy;

    public OffsetDateTime createdAt;

    public OffsetDateTime updatedAt;

    public String image;
}
