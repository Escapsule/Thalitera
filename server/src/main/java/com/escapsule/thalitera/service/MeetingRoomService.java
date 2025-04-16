package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.MeetingRoomDTO;
import com.escapsule.thalitera.entity.MeetingRoom;

import java.util.List;
import java.util.UUID;

public interface MeetingRoomService {

    /**
     * Add a new meeting room.
     *
     * @param meetingRoomDTO The DTO object containing the parameters for the meeting room.
     * @return True if the addition is successful, throw an exception otherwise.
     */
    boolean addMeetingRoom(MeetingRoomDTO meetingRoomDTO);

    /**
     * Modify an existing meeting room.
     *
     * @param meetingRoomDTO The DTO object containing the parameters for the meeting room.
     * @return True if the modification is successful, throw an exception otherwise.
     */
    boolean modifyMeetingRoom(MeetingRoomDTO meetingRoomDTO);

    /**
     * Get all meeting rooms.
     *
     * @return The list of all meeting rooms.
     */
    List<MeetingRoom> getAllMeetingRooms();

    int deleteMeetingRoom(List<UUID> roomIds);
}
