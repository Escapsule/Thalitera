package com.escapsule.thalitera.po;

import com.escapsule.thalitera.json.MeetingRoomFacilities;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingRoomPO {

    public OffsetDateTime startTime;
    public OffsetDateTime endTime;
    public short attendeesCount;
    public String building;
    public short floor;
    public MeetingRoomFacilities facilities;
    public int page;
}
