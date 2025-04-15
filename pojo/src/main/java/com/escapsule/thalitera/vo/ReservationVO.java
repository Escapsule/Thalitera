package com.escapsule.thalitera.vo;

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
public class ReservationVO {

    private String reservationId;

    private String roomId;

    private String roomName;

    private String userId;

    private String userName;

    private OffsetDateTime startTime;

    private OffsetDateTime endTime;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;

    /**
     * userId
     */
    private List<String> attendees;

    private String purpose;

    /**
     * See {@link com.escapsule.thalitera.constant.BookingStatusConstant}
     */
    private String status;
}
