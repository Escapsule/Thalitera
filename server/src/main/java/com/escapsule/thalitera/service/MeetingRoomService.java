package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.BookingDTO;
import com.escapsule.thalitera.dto.MeetingRoomDTO;
import com.escapsule.thalitera.entity.MeetingRoom;

import java.util.List;

public interface MeetingRoomService {

    /**
     * Get the list of meeting rooms.
     *
     * @param meetingRoomDTO The DTO object containing the parameters for the meeting room.
     * @return The list of meeting rooms.
     */
    List<MeetingRoom> getMeetingRoom(MeetingRoomDTO meetingRoomDTO);

    List<MeetingRoom> getAllActiveMeetingRooms();

    boolean bookMeetingRoom(BookingDTO bookingDTO);

    boolean updateMeetingRoom(BookingDTO bookingDTO);

    boolean deleteMeetingRoom(String reservationId);
}
