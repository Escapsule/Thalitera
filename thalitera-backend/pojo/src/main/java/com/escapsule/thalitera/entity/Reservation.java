package com.escapsule.thalitera.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.escapsule.thalitera.constant.ReservationStatusConstant;
import com.escapsule.thalitera.handler.PgUUIDTypeHandler;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @TableField(value = "reservation_id", typeHandler = PgUUIDTypeHandler.class)
    private UUID reservationId;

    @TableField(value = "user_id", typeHandler = PgUUIDTypeHandler.class)
    private UUID userId;

    @TableField(value = "room_id", typeHandler = PgUUIDTypeHandler.class)
    private UUID roomId;

    private OffsetDateTime startTime;

    private OffsetDateTime endTime;

    /**
     * userId
     */
    private List<UUID> attendees;

    private String purpose;

    /**
     * See {@link ReservationStatusConstant}
     */
    private String status;

    private int version;

    /**
     * HMAC_SHA256(reservation_id + salt + timestamp)
     */
    private String qrToken;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;

}
