package com.escapsule.thalitera.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.escapsule.thalitera.handler.PgUUIDTypeHandler;
import com.escapsule.thalitera.json.MeetingRoomFacilities;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingRoom implements Serializable {

    private String image;

    @TableField(value = "room_id", typeHandler = PgUUIDTypeHandler.class)
    private UUID roomId;

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
    private MeetingRoomFacilities facilities;

    /**
     * Created by user ID
     */
    private UUID createdBy;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;

}
