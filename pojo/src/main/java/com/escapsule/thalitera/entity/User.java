package com.escapsule.thalitera.entity;

import com.escapsule.thalitera.json.TrustedDevice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    private String userId;

    private String password;

    private String email;

    /**
     * See {@link com.escapsule.thalitera.constant.UserStatusConstant}
     */
    private String status;

    /**
     * Base64 encoded TOTP secret key, used for MFA verification, nullable
     */
    private String mfaSecret;

    private Timestamp lastPasswordUpdate;

    /**
     * When "Trusted Device" is enabled, add a new record to the table
     * and skip MFA verification for this device.<br>
     * See {@link com.escapsule.thalitera.json.TrustedDevice}
     */
    private TrustedDevice trustedDevice;

    private Timestamp createdAt;

    private Timestamp updatedAt;

}
