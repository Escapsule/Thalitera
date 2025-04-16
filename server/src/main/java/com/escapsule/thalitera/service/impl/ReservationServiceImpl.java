package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.constant.ReservationStatusConstant;
import com.escapsule.thalitera.dto.ReservationDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.entity.Reservation;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.mapper.MeetingRoomMapper;
import com.escapsule.thalitera.mapper.ReservationMapper;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.po.MeetingRoomPO;
import com.escapsule.thalitera.service.ReservationService;
import com.escapsule.thalitera.transfer.MeetingRoomTransfer;
import com.escapsule.thalitera.transfer.ReservationTransfer;
import com.escapsule.thalitera.utils.TokenUtils;
import com.escapsule.thalitera.vo.ReservationVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationServiceImpl implements ReservationService {

    private final ReservationMapper reservationMapper;
    private final MeetingRoomMapper meetingRoomMapper;
    private final UserMapper userMapper;

    private final OffsetDateTime undefinedTime = OffsetDateTime.parse("1970-01-01T00:00:00Z");

    /**
     * Get all active meeting rooms.
     *
     * @return The list of all active meeting rooms.
     */
    @Override
    public List<MeetingRoom> getAllActiveMeetingRooms() {
        return meetingRoomMapper.getActiveMeetingRoomsByFilter(
                MeetingRoomPO.builder()
                        .build()
        );
    }

    @Override
    public List<MeetingRoom> getMeetingRoom(ReservationDTO reservationDTO) {
        // Check if the start time is after the end time
        if (reservationDTO.getStartTime() != null && reservationDTO.getEndTime() != null) {
            if (reservationDTO.getStartTime().isAfter(reservationDTO.getEndTime())
                    || reservationDTO.getStartTime().isEqual(reservationDTO.getEndTime())) {
                throw new BaseException(ErrorCode.INVALID_TIME_RANGE);
            }
        }
        // Construct the query object
        MeetingRoomPO meetingRoomPO = new MeetingRoomPO();
        if (reservationDTO.getAttendeesCount() != null) {
            meetingRoomPO.setAttendeesCount(reservationDTO.getAttendeesCount());
        }
        if (StringUtils.isNotBlank(reservationDTO.getBuilding())) {
            meetingRoomPO.setBuilding(reservationDTO.getBuilding());
        }
        if (reservationDTO.getFloor() != null) {
            meetingRoomPO.setFloor(reservationDTO.getFloor());
        }
        if (reservationDTO.getFacilities() != null) {
            meetingRoomPO.setFacilities(
                    MeetingRoomTransfer.INSTANCE.mapMapToFacilities(
                            reservationDTO.getFacilities()
                    )
            );
        }
        // Get the list of meeting rooms
        List<MeetingRoom> suitableMeetingRooms = meetingRoomMapper.getActiveMeetingRoomsByFilter(meetingRoomPO);
        Set<UUID> conflictRoomIds = new HashSet<>();
        // Check conflicts
        for (MeetingRoom meetingRoom : suitableMeetingRooms) {
            List<Reservation> reservations = reservationMapper.getConfirmedReservationsByRoomId(meetingRoom.getRoomId());
            for (Reservation r : reservations) {
                if (
                        checkConflict(
                                reservationDTO.getStartTime(), reservationDTO.getEndTime(),
                                r.getStartTime(),          r.getEndTime()
                        )
                ) {
                    conflictRoomIds.add(meetingRoom.getRoomId());
                }
            }
        }
        // Remove the conflicting meeting rooms
        suitableMeetingRooms.removeIf(meetingRoom -> conflictRoomIds.contains(meetingRoom.getRoomId()));
        return suitableMeetingRooms;
    }

    /**
     * Book a meeting room.
     *
     * @param reservationDTO The DTO object containing the parameters for the meeting room.
     * @return True if the booking is successful, throw an exception otherwise.
     */
    @Override
    @Transactional
    public boolean makeReservation(ReservationDTO reservationDTO,
                                   UUID userId) {
        // Generate a reservation ID
        UUID reservationId = UUID.randomUUID();
        // Construct the reservation object
        Reservation reservation = ReservationTransfer.INSTANCE.newReservationDTO2Reservation(
                reservationDTO, reservationId, TokenUtils.generateShortToken(), userId
        );
        reservationDTO.getAttendees().forEach(
                userEmail -> {
                    // Get the user ID by email
                    // TODO optimize to one query per request (instead of one query per attendee)
                    User user = userMapper.getUserByEmail(userEmail);
                    if (user == null) {
                        throw new BaseException(ErrorCode.USER_NOT_FOUND.getCode(),
                                userEmail + " not found");
                    }
                    reservation.getAttendees().add(user.getUserId());
                }
        );
        reservationMapper.makeReservation(reservation);
        // Get the list of confirmed reservations
        List<Reservation> reservations = reservationMapper.getConfirmedReservationsByRoomId(reservationDTO.getRoomId());
        // Check conflicts
        for (Reservation r : reservations) {
            if (
                    checkConflict(
                            reservationDTO.getStartTime(), reservationDTO.getEndTime(),
                            r.getStartTime(),              r.getEndTime()
                    )
                    && r.getStatus().equals(ReservationStatusConstant.CONFIRMED)
            ) {
                reservationMapper.deleteReservation(reservationId);
                throw new BaseException(ErrorCode.CONFLICT_RESERVATION);
            }
        }
        // Update the reservation status
        reservationMapper.updateReservationStatus(reservationId, ReservationStatusConstant.CONFIRMED);
        return true;
    }

    /**
     * Update a reservation.
     *
     * @param reservationDTO The DTO object containing the parameters for the reservation.
     * @param userId Operator
     * @return True if the update is successful, throw an exception otherwise.
     */
    @Override
    @Transactional
    public boolean updateReservation(ReservationDTO reservationDTO, UUID userId) {
        // Get the old reservation
        Reservation oldReservation = reservationMapper.getReservationsByReservationId(reservationDTO.getReservationId());
        if (oldReservation == null) {
            throw new BaseException(ErrorCode.RESERVATION_NOT_FOUND);
        }
        if (!oldReservation.getUserId().equals(userId)) {
            throw new BaseException(ErrorCode.PERMISSION_DENIED.getCode(), "Cannot edit reservation created by other.");
        }
        // Get the list of confirmed reservations
        List<Reservation> reservations = reservationMapper.getConfirmedReservationsByRoomId(reservationDTO.getRoomId());
        for (Reservation r : reservations) {
            // Skip the current reservation
            if (r.getReservationId().equals(reservationDTO.getReservationId())) {
                continue;
            }
            // Check conflicts
            if (
                    checkConflict(
                            reservationDTO.getStartTime(), reservationDTO.getEndTime(),
                            r.getStartTime(),              r.getEndTime()
                    )
                    && r.getStatus().equals(ReservationStatusConstant.CONFIRMED)
            ) {
                throw new BaseException(ErrorCode.CONFLICT_RESERVATION);
            }
        }
        // Update the reservation
        Reservation newReservation = ReservationTransfer.INSTANCE.updateReservationDTO2Reservation(
                reservationDTO, oldReservation.getVersion(), oldReservation.getQrToken(), oldReservation.getUserId()
        );
        reservationDTO.getAttendees().forEach(
                userEmail -> {
                    // Get the user ID by email
                    // TODO optimize to one query per request (instead of one query per attendee)
                    User user = userMapper.getUserByEmail(userEmail);
                    if (user == null) {
                        throw new BaseException(ErrorCode.USER_NOT_FOUND.getCode(),
                                userEmail + " not found");
                    }
                    newReservation.getAttendees().add(user.getUserId());
                }
        );
        reservationMapper.updateReservation(newReservation);
        return true;
    }

    /**
     * Cancel a meeting room reservation.
     *
     * @param reservationId The ID of the reservation to cancel.
     * @param userId Operator
     * @return True if the cancellation is successful, throw an exception otherwise.
     */
    @Override
    @Transactional
    public boolean cancelReservation(UUID reservationId, UUID userId) {
        // Check if the reservation ID is provided
        if (reservationId == null) {
            throw new BaseException(ErrorCode.MISSING_RESERVATION_ID);
        }
        // Get the reservation
        Reservation reservation = reservationMapper.getReservationsByReservationId(reservationId);
        // Check if the reservation exists
        if (reservation == null) {
            throw new BaseException(ErrorCode.RESERVATION_NOT_FOUND);
        }
        if (!reservation.getUserId().equals(userId)) {
            throw new BaseException(ErrorCode.PERMISSION_DENIED.getCode(), "Cannot cancel reservation created by other.");
        }
        // Update the reservation status
        reservationMapper.updateReservationStatus(reservationId, ReservationStatusConstant.CANCELED);
        return true;
    }

    /**
     * Fetch all reservations
     *
     * @return List of all reservations
     */
    @Override
    public List<ReservationVO> getAllReservations() {
        List<Reservation> reservations = reservationMapper.getAllReservations();
        return ReservationTransfer.INSTANCE.mapReservation2ReservationVO(reservations, meetingRoomMapper, userMapper);
    }

    /**
     * Fetch all reservations related to a specific user
     *
     * @param userId target user ID
     * @return List of all reservations
     */
    @Override
    public List<ReservationVO> getMyReservations(UUID userId) {
        List<Reservation> reservations = reservationMapper.getUserRelatedReservationByUserId(userId);
        return ReservationTransfer.INSTANCE.mapReservation2ReservationVO(reservations, meetingRoomMapper, userMapper);
    }

    /**
     * Check if the reservation time conflicts with the existing reservations
     * @param startTime requested start time
     * @param endTime requested end time
     * @param reservationStartTime existing reservation start time
     * @param reservationEndTime existing reservation end time
     * @return <code>true</code> if there is a conflict, <code>false</code> otherwise
     */
    private boolean checkConflict(OffsetDateTime startTime, OffsetDateTime endTime,
                                  OffsetDateTime reservationStartTime, OffsetDateTime reservationEndTime) {
        // 1. st <= rs < et
        // 2. st < re <= et
        // 3. rs <= st < et <= re
        return
                //case 1
                (
                        // st <= rs
                        (
                                startTime.isBefore(reservationStartTime) ||
                                startTime.isEqual(reservationStartTime)
                        ) &&
                        // rs < et
                        endTime.isAfter(reservationStartTime)
                ) ||
                //case 2
                (
                        // st < re
                        startTime.isBefore(reservationEndTime) &&
                        // re <= et
                        (
                                endTime.isEqual(reservationEndTime) ||
                                endTime.isAfter(reservationEndTime)
                        )
                ) ||
                //case 3
                (
                        // rs <= st
                        (
                                reservationStartTime.isBefore(startTime) ||
                                reservationStartTime.isEqual(startTime)
                        ) &&
                        // st < et
                        (
                                reservationEndTime.isEqual(endTime) ||
                                reservationEndTime.isAfter(endTime)
                        )
                )
        ;
    }
}
