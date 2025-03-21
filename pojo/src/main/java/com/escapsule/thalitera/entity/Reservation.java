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
public class Reservation {

    private String reservationId;

    private String userId;

    private String roomId;

    private Timestamp startTime;

    private Timestamp endTime;

    private short attendeesCount;

    private String purpose;

    /**
     * See {@link com.escapsule.thalitera.constant.BookingStatusConstant}
     */
    private String status;

    private int version;

    /**
     * HMAC_SHA256(reservation_id + salt + timestamp)
     */
    private String qrToken;

    private Timestamp createdAt;

    private Timestamp updatedAt;

}
