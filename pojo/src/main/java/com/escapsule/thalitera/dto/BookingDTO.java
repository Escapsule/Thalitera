package com.escapsule.thalitera.dto;

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
public class BookingDTO {
    private String reservationId;
    private String roomId;
    private String userId;
    private List<String> attendees;
    private String purpose;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
}
