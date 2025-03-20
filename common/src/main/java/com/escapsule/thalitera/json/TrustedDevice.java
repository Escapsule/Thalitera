package com.escapsule.thalitera.json;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrustedDevice {

    /**
     * Device ID
     */
    private String deviceId;

    /**
     * Encrypted data (AES-256)
     */
    private String fingerPrint;

    /**
     * Last used time
     */
    private Timestamp lastUsed;

    /**
     * Expire time (30 days after creation)
     */
    private Timestamp expiresAt;

}
