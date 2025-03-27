package com.escapsule.thalitera.json;

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
public class BookingHistorySnapshot extends Jsonb{

    private String userId;

    private String roomId;

    private OffsetDateTime startTime;

    private OffsetDateTime endTime;

    public List<String> attendees;

    private String purpose;

    /**
     * See {@link com.escapsule.thalitera.constant.BookingStatusConstant}
     */
    private String status;
}
