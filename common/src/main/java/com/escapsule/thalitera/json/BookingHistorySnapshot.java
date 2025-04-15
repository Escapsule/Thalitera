package com.escapsule.thalitera.json;

import com.escapsule.thalitera.constant.ReservationStatusConstant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingHistorySnapshot extends Jsonb {

    private String userId;

    private String roomId;

    private OffsetDateTime startTime;

    private OffsetDateTime endTime;

    private List<String> attendees;

    private String purpose;

    /**
     * See {@link ReservationStatusConstant}
     */
    private String status;
}
