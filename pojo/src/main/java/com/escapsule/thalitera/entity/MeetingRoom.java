package com.escapsule.thalitera.entity;

import com.escapsule.thalitera.json.MeetingRoomFacility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingRoom {

    private String roomId;

    /**
     * Readable name of the meeting room
     */
    private String name;

    private short capacityMin;

    private short capacityMax;

    private String building;

    private short floor;

    /**
     * See {@link com.escapsule.thalitera.constant.MeetingRoomStatusConstant}
     */
    private String status;

    /**
     * See {@link com.escapsule.thalitera.json.MeetingRoomFacility}
     */
    private MeetingRoomFacility facilities;

    /**
     * Created by user ID
     */
    private String createdBy;

    private Timestamp createdAt;

    private Timestamp updatedAt;

}
