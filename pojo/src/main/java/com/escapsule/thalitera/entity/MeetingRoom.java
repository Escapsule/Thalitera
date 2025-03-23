package com.escapsule.thalitera.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingRoom implements Serializable {

    private String image;

    private String roomId;

    /**
     * Readable name of the meeting room
     */
    private String name;

    private int capacityMin;

    private int capacityMax;

    private String building;

    private int floor;

    /**
     * See {@link com.escapsule.thalitera.constant.MeetingRoomStatusConstant}
     */
    private String status;

    /**
     * See {@link com.escapsule.thalitera.json.MeetingRoomFacilities}
     */
    private String facilities;

    /**
     * Created by user ID
     */
    private String createdBy;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;

}
