package com.escapsule.thalitera.event;

import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.model.ReservationRemindNotifyVariables;
import com.escapsule.thalitera.model.TemplateVariables;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ReservationRemindNotifyEvent extends BaseNotifyEvent {

    private final String roomName;
    private final LocalDateTime startTime;
    private final LocalDateTime endTime;
    private final long targetTime;
    private final String building;
    private final int floor;
    private final String creator;
    private final List<String> attendees;
    private final String purpose;
    private final String baseUrl;

    private final List<UUID> targetUser;

    private final NotifyType notifyType;

    public ReservationRemindNotifyEvent(Object source,
                                        String roomName,
                                        LocalDateTime startTime,
                                        LocalDateTime endTime,
                                        long targetTime,
                                        String building,
                                        int floor,
                                        String creator,
                                        List<String> attendees,
                                        List<UUID> targetUser,
                                        String baseUrl,
                                        String purpose) {
        super(source);
        this.roomName = roomName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.targetTime = targetTime;
        this.building = building;
        this.floor = floor;
        this.creator = creator;
        this.attendees = attendees;
        this.purpose = purpose;
        this.baseUrl = baseUrl;
        this.notifyType = NotifyType.RESERVATION_REMIND_EMAIL;
        this.targetUser = targetUser;

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
        return new ReservationRemindNotifyVariables()
                .withRoomName(roomName)
                .withStartTime(startTime)
                .withEndTime(endTime)
                .withTargetTime(targetTime)
                .withBuilding(building)
                .withFloor(floor)
                .withCreator(creator)
                .withAttendees(attendees)
                .withPurpose(purpose)
                .withBaseUrl(baseUrl);
    }
}
