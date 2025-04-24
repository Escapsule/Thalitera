package com.escapsule.thalitera.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingRoomVO {

    private String roomId;

    private String image;

    /**
     * Readable name of the meeting room
     */
    private String name;

    private short capacityMin;

    private short capacityMax;

    private String building;

    private String floor;

    /**
     * See {@link com.escapsule.thalitera.constant.MeetingRoomStatusConstant}
     */
    private String status;

    private Map<String, Object> facilities;

}
