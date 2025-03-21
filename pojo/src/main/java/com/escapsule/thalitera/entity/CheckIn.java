package com.escapsule.thalitera.entity;

import com.escapsule.thalitera.json.DeviceFingerprint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckIn {

    private String checkinId;

    private String reservationId;

    private String userId;

    private Timestamp checkinTime;

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
