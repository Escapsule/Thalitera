package com.escapsule.thalitera.entity;

import com.escapsule.thalitera.json.Jsonb;
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
public class Notification {

    private Long notificationId;

    /**
     * See {@link com.escapsule.thalitera.constant.NotificationTypeConstant}
     */
    private String type;

    private UUID recipient;

    private Jsonb content;

    /**
     * See {@link com.escapsule.thalitera.constant.NotificationStatusConstant}
     */
    private String status;

    private short retries;

    private OffsetDateTime createdAt;

    private String failureReason;
}
