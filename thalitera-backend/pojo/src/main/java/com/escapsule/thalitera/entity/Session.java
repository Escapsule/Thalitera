package com.escapsule.thalitera.entity;

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
public class Session {

    private String sessionId;

    private String userId;

    /**
     * See {@link com.escapsule.thalitera.json.DeviceFingerprint}
     */
    private DeviceFingerprint deviceFingerprint;

    private String ipAddress;

    private OffsetDateTime lastActive;

    private OffsetDateTime expiresAt;

    private boolean isRevoked;

}
