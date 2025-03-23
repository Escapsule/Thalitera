package com.escapsule.thalitera.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class MeetingRoomDTO {

    @Future
    public OffsetDateTime startTime;

    @Future
    public OffsetDateTime endTime;

    @Positive
    public short attendeesCount;

    public String building;
    public short floor;
    public Object facilities;

    @Positive
    public int page;
}
