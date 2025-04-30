package com.escapsule.thalitera.event;

import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.model.ReservationInitAndCancelNotifyVariables;
import com.escapsule.thalitera.model.TemplateVariables;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ReservationInitAndCancelNotifyEvent extends BaseNotifyEvent {

    private final String roomName;
    private final LocalDateTime startTime;
    private final LocalDateTime endTime;
    private final String building;
    private final int floor;
    private final String creator;
    private final List<String> attendees;
    private final String purpose;

    private final List<UUID> targetUser;

    private final NotifyType notifyType;

    public ReservationInitAndCancelNotifyEvent(Object source,
                                               String roomName,
                                               LocalDateTime startTime,
                                               LocalDateTime endTime,
                                               String building,
                                               int floor,
                                               String creator,
                                               List<String> attendees,
                                               String purpose,

                                               List<UUID> targetUser,
                                               NotifyType notifyType) {
        super(source);
        this.roomName = roomName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.building = building;
        this.floor = floor;
        this.creator = creator;
        this.attendees = attendees;
        this.purpose = purpose;
        this.targetUser = targetUser;
        this.notifyType = notifyType;
    }

    @Override
    public NotifyType getNotifyType() {
        return notifyType;
    }

    @Override
    public List<UUID> getTargetUser() {
        return targetUser;
    }

    @Override
    public TemplateVariables buildVariables() {
        return new ReservationInitAndCancelNotifyVariables()
                .withRoomName(roomName)
                .withStartTime(startTime)
                .withEndTime(endTime)
                .withBuilding(building)
                .withFloor(floor)
                .withCreator(creator)
                .withAttendees(attendees)
                .withPurpose(purpose);
    }
}
