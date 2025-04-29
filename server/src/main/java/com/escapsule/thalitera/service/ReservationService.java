package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.ReservationDTO;
import com.escapsule.thalitera.dto.TimeRangeDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.vo.ReservationVO;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface ReservationService {

    /**
     * Get all active meeting rooms.
     *
     * @return The list of all active meeting rooms.
     */
    List<MeetingRoom> getAllActiveMeetingRooms();

    /**
     * Get the list of meeting rooms.
     *
     * @param reservationDTO The DTO object containing the parameters for the meeting room.
     * @return The list of meeting rooms.
     */
    List<MeetingRoom> getMeetingRoom(ReservationDTO reservationDTO);

    /**
     * Book a meeting room.
     *
     * @param reservationDTO The DTO object containing the parameters for the reservation.
     * @param userId The ID of the user making the reservation.
     * @return True if the booking is successful, throw an exception otherwise.
     */
    boolean makeReservation(ReservationDTO reservationDTO, UUID userId);

    /**
     * Update a reservation.
     *
     * @param reservationDTO The DTO object containing the parameters for the reservation.
     * @param userId Operator
     * @return True if the update is successful, throw an exception otherwise.
     */
    boolean updateReservation(ReservationDTO reservationDTO, UUID userId);

    /**
     * Cancel a meeting room reservation.
     *
     * @param reservationId The ID of the reservation to cancel.
     * @param user Operator
     * @return True if the cancellation is successful, throw an exception otherwise.
     */
    boolean cancelReservation(UUID reservationId, User user);


    /**
     * Fetch all reservations
     *
     * @return List of all reservations
     */
    List<ReservationVO> getAllReservations();

    /**
     * Fetch all reservations related to a specific user
     *
     * @param userId target user ID
     * @return List of all reservations
     */
    List<ReservationVO> getMyReservations(UUID userId);

    /**
     * Fetch all reserved time ranges related to a specific meeting room
     *
     * @param roomId target meeting room ID
     * @param dateTime target date
     * @return List of all reserved time ranges
     */
    List<TimeRangeDTO> getMeetingRoomReservedTime(UUID roomId, OffsetDateTime dateTime);
}
