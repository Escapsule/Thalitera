package com.escapsule.thalitera.dto;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class MeetingRoomDTO {
    public OffsetDateTime startTime;
    public OffsetDateTime endTime;
    public short attendeesCount;
    public String building;
    public short floor;
    public Object facilities;
    public int page;
}
