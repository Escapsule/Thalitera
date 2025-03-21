package com.escapsule.thalitera.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    private String notificationId;

    /**
     * See {@link com.escapsule.thalitera.constant.NotificationTypeConstant}
     */
    private String type;

    private String recipient;

    private String content;

    /**
     * See {@link com.escapsule.thalitera.constant.NotificationStatusConstant}
     */
    private String status;

    private Timestamp sentAt;

    private short retries;

    private Timestamp createdAt;
}
