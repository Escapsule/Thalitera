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
public class Session {

    private String sessionId;

    private String userId;

    /**
     * See {@link com.escapsule.thalitera.json.DeviceFingerprint}
     */
    private DeviceFingerprint deviceFingerprint;

    private String ipAddress;

    private Timestamp lastActive;

    private Timestamp expiresAt;

    private boolean isRevoked;

}
