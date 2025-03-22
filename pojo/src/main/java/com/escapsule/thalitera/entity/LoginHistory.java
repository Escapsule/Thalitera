package com.escapsule.thalitera.entity;

import com.escapsule.thalitera.Location;
import com.escapsule.thalitera.json.DeviceFingerprint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginHistory {

    private long logId;

    private String userId;

    private OffsetDateTime loginTime;

    private String ipAddress;

    /**
     * See {@link com.escapsule.thalitera.json.DeviceFingerprint}
     */
    private DeviceFingerprint deviceFingerprint;

    private boolean success;

    /**
     * If login failed, the reason for failure<br>
     * See {@link com.escapsule.thalitera.constant.LoginFailureReasonConstant}
     */
    private String failureReason;

    /**
     * Location information<br>
     * See {@link com.escapsule.thalitera.Location}
     */
    private Location location;

}
