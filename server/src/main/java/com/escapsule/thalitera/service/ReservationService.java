package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.ReservationDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.vo.ReservationVO;

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
     * @return True if the booking is successful, throw an exception otherwise.
     */
    boolean makeReservation(ReservationDTO reservationDTO);

    /**
     * Update a reservation.
     *
     * @param reservationDTO The DTO object containing the parameters for the reservation.
     * @return True if the update is successful, throw an exception otherwise.
     */
    boolean updateReservation(ReservationDTO reservationDTO);

    /**
     * Cancel a meeting room reservation.
     *
     * @param reservationId The ID of the reservation to cancel.
     * @return True if the cancellation is successful, throw an exception otherwise.
     */
    boolean cancelReservation(UUID reservationId);


    /**
     * Fetch all reservations
     *
     * @return List of all reservations
     */
    List<ReservationVO> getAllReservations();
}
