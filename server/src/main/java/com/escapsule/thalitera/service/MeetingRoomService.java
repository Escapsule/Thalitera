package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.BookingDTO;
import com.escapsule.thalitera.dto.MeetingRoomDTO;
import com.escapsule.thalitera.entity.MeetingRoom;

import java.util.List;

public interface MeetingRoomService {

    /**
     * Get the list of meeting rooms.
     *
     * @param bookingDTO The DTO object containing the parameters for the meeting room.
     * @return The list of meeting rooms.
     */
    List<MeetingRoom> getMeetingRoom(BookingDTO bookingDTO);

    List<MeetingRoom> getAllActiveMeetingRooms();

    boolean bookMeetingRoom(BookingDTO bookingDTO);

    boolean updateMeetingRoom(BookingDTO bookingDTO);

    boolean cancelMeetingRoom(String reservationId);

    boolean modifyMeetingRoom(MeetingRoomDTO meetingRoomDTO);
}
