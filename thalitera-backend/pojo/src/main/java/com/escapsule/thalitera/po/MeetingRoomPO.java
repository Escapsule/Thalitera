package com.escapsule.thalitera.po;

import com.escapsule.thalitera.json.MeetingRoomFacilities;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingRoomPO {
    public Integer attendeesCount;
    public String building;
    public Integer floor;
    public MeetingRoomFacilities facilities;
    public Integer page;
}
