package com.escapsule.thalitera.vo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarVO {

    /**
     * Start time of the calendar event
     */
    private OffsetDateTime startTime;

    /**
     * End time of the calendar event
     */
    private OffsetDateTime endTime;

    /**
     * Meeting Room
     */
    @JsonProperty("meeting_room")
    private MeetingRoomVO meetingRoom;
}
