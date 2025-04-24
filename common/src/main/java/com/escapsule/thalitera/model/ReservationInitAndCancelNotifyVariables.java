package com.escapsule.thalitera.model;

import java.time.LocalDateTime;
import java.util.List;

public class ReservationInitAndCancelNotifyVariables extends TemplateVariables {

    public ReservationInitAndCancelNotifyVariables withRoomName(String roomName) {
        bind("room_name", roomName);
        return this;
    }

    public ReservationInitAndCancelNotifyVariables withStartTime(LocalDateTime startTime) {
        bind("start_time", startTime);
        return this;
    }

    public ReservationInitAndCancelNotifyVariables withEndTime(LocalDateTime endTime) {
        bind("end_time", endTime);
        return this;
    }

    public ReservationInitAndCancelNotifyVariables withBuilding(String building) {
        bind("building", building);
        return this;
    }

    public ReservationInitAndCancelNotifyVariables withFloor(int floor) {
        bind("floor", floor);
        return this;
    }

    public ReservationInitAndCancelNotifyVariables withCreator(String creator) {
        bind("creator", creator);
        return this;
    }

    public ReservationInitAndCancelNotifyVariables withAttendees(List<String> attendees) {
        bind("attendees", attendees);
        return this;
    }

    public TemplateVariables withPurpose(String purpose) {
        bind("purpose", purpose);
        return this;
    }
}
