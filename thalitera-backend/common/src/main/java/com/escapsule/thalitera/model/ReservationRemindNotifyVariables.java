package com.escapsule.thalitera.model;

import java.time.LocalDateTime;
import java.util.List;

public class ReservationRemindNotifyVariables extends TemplateVariables {
    public ReservationRemindNotifyVariables withRoomName(String roomName) {
        bind("room_name", roomName);
        return this;
    }

    public ReservationRemindNotifyVariables withStartTime(LocalDateTime startTime) {
        bind("start_time", startTime);
        return this;
    }

    public ReservationRemindNotifyVariables withEndTime(LocalDateTime endTime) {
        bind("end_time", endTime);
        return this;
    }

    public ReservationRemindNotifyVariables withTargetTime(long targetTime) {
        bind("target_time", targetTime);
        return this;
    }

    public ReservationRemindNotifyVariables withBuilding(String building) {
        bind("building", building);
        return this;
    }

    public ReservationRemindNotifyVariables withFloor(int floor) {
        bind("floor", floor);
        return this;
    }

    public ReservationRemindNotifyVariables withCreator(String creator) {
        bind("creator", creator);
        return this;
    }

    public ReservationRemindNotifyVariables withAttendees(List<String> attendees) {
        bind("attendees", attendees);
        return this;
    }

    public ReservationRemindNotifyVariables withPurpose(String purpose) {
        bind("purpose", purpose);
        return this;
    }

    public ReservationRemindNotifyVariables withBaseUrl(String baseUrl) {
        bind("base_url", baseUrl);
        return this;
    }
}
