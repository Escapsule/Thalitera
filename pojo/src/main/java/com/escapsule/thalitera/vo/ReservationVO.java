package com.escapsule.thalitera.vo;

import com.escapsule.thalitera.constant.ReservationStatusConstant;
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

    private String building;

    private int floor;

    private String userId;

    private String userName;

    private OffsetDateTime startTime;

    private OffsetDateTime endTime;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;

    private List<UserVO> attendees;

    private String purpose;

    /**
     * See {@link ReservationStatusConstant}
     */
    private String status;
}
