package com.escapsule.thalitera.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.escapsule.thalitera.handler.GeographyPointTypeHandler;
import com.escapsule.thalitera.handler.GsonTypeHandler;
import com.escapsule.thalitera.handler.PgUUIDTypeHandler;
import com.escapsule.thalitera.json.DeviceFingerprint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Point;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("login_history")
public class LoginHistory implements Serializable {

    private long logId;

    @TableField(value = "user_id", typeHandler = PgUUIDTypeHandler.class)
    private UUID userId;

    private OffsetDateTime loginTime;

    private String ipAddress;

    /**
     * See {@link com.escapsule.thalitera.json.DeviceFingerprint}
     */
    @TableField(value = "device_fingerprint",
            typeHandler = GsonTypeHandler.class)
    private DeviceFingerprint deviceFingerprint;

    private boolean success;

    /**
     * If login failed, the reason for failure<br>
     * See {@link com.escapsule.thalitera.constant.LoginFailureReasonConstant}
     */
    private String failureReason;

    @TableField(value = "location", typeHandler = GeographyPointTypeHandler.class)
    private Point location;
}
