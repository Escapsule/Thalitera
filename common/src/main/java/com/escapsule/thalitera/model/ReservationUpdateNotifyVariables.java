package com.escapsule.thalitera.model;

import java.time.LocalDateTime;
import java.util.List;

public class ReservationUpdateNotifyVariables extends TemplateVariables {

    public ReservationUpdateNotifyVariables withOldRoomName(String oldRoomName) {
        bind("old_room_name", oldRoomName);
        return this;
    }

    public ReservationUpdateNotifyVariables withNewRoomName(String newRoomName) {
        bind("new_room_name", newRoomName);
        return this;
    }

    public ReservationUpdateNotifyVariables withOldBuilding(String oldBuilding) {
        bind("old_building", oldBuilding);
        return this;
    }

    public ReservationUpdateNotifyVariables withNewBuilding(String newBuilding) {
        bind("new_building", newBuilding);
        return this;
    }

    public ReservationUpdateNotifyVariables withOldFloor(int oldFloor) {
        bind("old_floor", oldFloor);
        return this;
    }

    public ReservationUpdateNotifyVariables withNewFloor(int newFloor) {
        bind("new_floor", newFloor);
        return this;
    }

    public ReservationUpdateNotifyVariables withOldStartTime(LocalDateTime oldStartTime) {
        bind("old_start_time", oldStartTime);
        return this;
    }

    public ReservationUpdateNotifyVariables withNewStartTime(LocalDateTime newStartTime) {
        bind("new_start_time", newStartTime);
        return this;
    }

    public ReservationUpdateNotifyVariables withOldEndTime(LocalDateTime oldEndTime) {
        bind("old_end_time", oldEndTime);
        return this;
    }

    public ReservationUpdateNotifyVariables withNewEndTime(LocalDateTime newEndTime) {
        bind("new_end_time", newEndTime);
        return this;
    }

    public ReservationUpdateNotifyVariables withOldAttendees(List<String> oldAttendees) {
        bind("old_attendees", oldAttendees);
        return this;
    }

    public ReservationUpdateNotifyVariables withNewAttendees(List<String> newAttendees) {
        bind("new_attendees", newAttendees);
        return this;
    }

    public ReservationUpdateNotifyVariables withOldPurpose(String oldPurpose) {
        bind("old_purpose", oldPurpose);
        return this;
    }

    public ReservationUpdateNotifyVariables withNewPurpose(String newPurpose) {
        bind("new_purpose", newPurpose);
        return this;
    }

    public ReservationUpdateNotifyVariables withCreator(String creator) {
        bind("creator", creator);
        return this;
    }
}
