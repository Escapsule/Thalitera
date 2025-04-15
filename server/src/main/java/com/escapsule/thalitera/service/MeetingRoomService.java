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

    /**
     * Get all active meeting rooms.
     *
     * @return The list of all active meeting rooms.
     */
    List<MeetingRoom> getAllActiveMeetingRooms();

    /**
     * Book a meeting room.
     *
     * @param bookingDTO The DTO object containing the parameters for the meeting room.
     * @return True if the booking is successful, throw an exception otherwise.
     */
    boolean bookMeetingRoom(BookingDTO bookingDTO);

    /**
     * Update a booking.
     *
     * @param bookingDTO The DTO object containing the parameters for the meeting room.
     * @return True if the update is successful, throw an exception otherwise.
     */
    boolean updateBooking(BookingDTO bookingDTO);

    /**
     * Cancel a meeting room booking.
     *
     * @param reservationId The ID of the reservation to cancel.
     * @return True if the cancellation is successful, throw an exception otherwise.
     */
    boolean cancelMeetingRoom(String reservationId);

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
}
