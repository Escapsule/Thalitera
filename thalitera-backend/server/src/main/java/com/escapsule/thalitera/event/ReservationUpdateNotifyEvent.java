package com.escapsule.thalitera.event;

import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.model.ReservationUpdateNotifyVariables;
import com.escapsule.thalitera.model.TemplateVariables;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ReservationUpdateNotifyEvent extends BaseNotifyEvent {
    private final String oldRoomName;
    private final String newRoomName;
    private final String oldBuilding;
    private final String newBuilding;
    private final int oldFloor;
    private final int newFloor;
    private final LocalDateTime oldStartTime;
    private final LocalDateTime newStartTime;
    private final LocalDateTime oldEndTime;
    private final LocalDateTime newEndTime;
    private final List<String> oldAttendees;
    private final List<String> newAttendees;
    private final String oldPurpose;
    private final String newPurpose;
    private final String creator;

    private final List<UUID> targetUser;

    public ReservationUpdateNotifyEvent(Object source,
                                        String oldRoomName,
                                        String newRoomName,
                                        String oldBuilding,
                                        String newBuilding,
                                        int oldFloor,
                                        int newFloor,
                                        LocalDateTime oldStartTime,
                                        LocalDateTime newStartTime,
                                        LocalDateTime oldEndTime,
                                        LocalDateTime newEndTime,
                                        List<String> oldAttendees,
                                        List<String> newAttendees,
                                        String oldPurpose,
                                        String newPurpose,
                                        String creator,
                                        List<UUID> targetUser) {
        super(source);
        this.oldRoomName = oldRoomName;
        this.newRoomName = newRoomName;
        this.oldBuilding = oldBuilding;
        this.newBuilding = newBuilding;
        this.oldFloor = oldFloor;
        this.newFloor = newFloor;
        this.oldStartTime = oldStartTime;
        this.newStartTime = newStartTime;
        this.oldEndTime = oldEndTime;
        this.newEndTime = newEndTime;
        this.oldAttendees = oldAttendees;
        this.newAttendees = newAttendees;
        this.oldPurpose = oldPurpose;
        this.newPurpose = newPurpose;
        this.creator = creator;
        this.targetUser = targetUser;
    }

    @Override
    public NotifyType getNotifyType() {
        return NotifyType.RESERVATION_UPDATE_EMAIL;
    }

    @Override
    public List<UUID> getTargetUser() {
        return targetUser;
    }

    @Override
    public TemplateVariables buildVariables() {
        return new ReservationUpdateNotifyVariables()
                .withOldRoomName(oldRoomName)
                .withNewRoomName(newRoomName)
                .withOldBuilding(oldBuilding)
                .withNewBuilding(newBuilding)
                .withOldFloor(oldFloor)
                .withNewFloor(newFloor)
                .withOldStartTime(oldStartTime)
                .withNewStartTime(newStartTime)
                .withOldEndTime(oldEndTime)
                .withNewEndTime(newEndTime)
                .withOldAttendees(oldAttendees)
                .withNewAttendees(newAttendees)
                .withOldPurpose(oldPurpose)
                .withNewPurpose(newPurpose)
                .withCreator(creator);
    }
}
