package com.escapsule.thalitera.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.escapsule.thalitera.handler.PgUUIDTypeHandler;
import com.escapsule.thalitera.json.DeviceFingerprint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckIn {

    private String checkinId;

    private String reservationId;

    @TableField(value = "user_id", typeHandler = PgUUIDTypeHandler.class)
    private UUID userId;

    private OffsetDateTime checkinTime;

    /**
     * See {@link com.escapsule.thalitera.constant.CheckinTypeConstant}
     */
    private String checkinType;

    /**
     * See {@link com.escapsule.thalitera.json.DeviceFingerprint}
     */
    private DeviceFingerprint deviceFingerprint;

    private String ipAddress;

}
