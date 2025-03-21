package com.escapsule.thalitera.json;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingHistorySnapshot {

    private String userId;

    private String roomId;

    private Timestamp startTime;

    private Timestamp endTime;

    private List<String> attendees;

    private String purpose;

    /**
     * See {@link com.escapsule.thalitera.constant.BookingStatusConstant}
     */
    private String status;
}
