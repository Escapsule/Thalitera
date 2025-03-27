package com.escapsule.thalitera.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.escapsule.thalitera.handler.PgUUIDTypeHandler;
import com.escapsule.thalitera.json.TrustedDevice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.JdbcType;


import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName(value = "users")
public class User implements Serializable {

    private String avatar;

    @TableField(value = "user_id", typeHandler = PgUUIDTypeHandler.class)
    private UUID userId;

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
