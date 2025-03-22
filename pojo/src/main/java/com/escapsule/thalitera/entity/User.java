package com.escapsule.thalitera.entity;

import com.escapsule.thalitera.json.TrustedDevice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    private String avatar;

    private String userId;

    private String passwordHash;

    private String email;

    private String username;

    /**
     * See {@link com.escapsule.thalitera.constant.UserStatusConstant}
     */
    private String status;

    /**
     * Base64 encoded TOTP secret key, used for MFA verification, nullable
     */
    private String mfaSecret;

    private OffsetDateTime lastPasswordUpdate;

    /**
     * When "Trusted Device" is enabled, add a new record to the table
     * and skip MFA verification for this device.<br>
     * See {@link com.escapsule.thalitera.json.TrustedDevice}
     */
    private List<TrustedDevice> trustedDevice;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;

}
