package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.constant.BookingStatusConstant;
import com.escapsule.thalitera.constant.FacilitiesItemsConstant;
import com.escapsule.thalitera.dto.BookingDTO;
import com.escapsule.thalitera.dto.MeetingRoomDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.entity.Reservation;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.json.MeetingRoomFacilities;
import com.escapsule.thalitera.mapper.MeetingRoomMapper;
import com.escapsule.thalitera.po.MeetingRoomPO;
import com.escapsule.thalitera.service.MeetingRoomService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class MeetingRoomServiceImpl implements MeetingRoomService {

    private MeetingRoomMapper meetingRoomMapper;

    public MeetingRoomServiceImpl(MeetingRoomMapper meetingRoomMapper) {
        this.meetingRoomMapper = meetingRoomMapper;
    }

    @Override
    public List<MeetingRoom> getAllActiveMeetingRooms() {
        return meetingRoomMapper.getAllActiveMeetingRooms();
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<MeetingRoom> getMeetingRoom(MeetingRoomDTO meetingRoomDTO) {
        // Check if the start time is after the end time
        if (meetingRoomDTO.getStartTime().isAfter(meetingRoomDTO.getEndTime())
                || meetingRoomDTO.getStartTime().isEqual(meetingRoomDTO.getEndTime())) {
            throw new BaseException(ErrorCode.INVALID_TIME_RANGE);
        }
        // Construct the query object
        MeetingRoomPO meetingRoomPO = MeetingRoomPO.builder()
                .startTime(meetingRoomDTO.getStartTime())
                .endTime(meetingRoomDTO.getEndTime())
                .attendeesCount(meetingRoomDTO.getAttendeesCount())
                .building(meetingRoomDTO.getBuilding())
                .floor(meetingRoomDTO.getFloor())
                .page(meetingRoomDTO.getPage())
                .build();
        // Check if the facilities are provided
        if (meetingRoomDTO.facilities != null) {
            LinkedHashMap<String, Object> facilitiesMap = (LinkedHashMap<String, Object>) meetingRoomDTO.facilities;
            MeetingRoomFacilities facilities = MeetingRoomFacilities.builder()
                    .projector((Boolean) facilitiesMap.get(FacilitiesItemsConstant.PROJECTOR))
                    .whiteboard((Integer) facilitiesMap.get(FacilitiesItemsConstant.WHITEBOARD))
                    .powerSockets((Integer) facilitiesMap.get(FacilitiesItemsConstant.POWER_SOCKETS))
                    .coffeeBreak((Boolean) facilitiesMap.get(FacilitiesItemsConstant.COFFEE_BREAK))
                    .specialNotes((List<String>) facilitiesMap.get(FacilitiesItemsConstant.SPECIAL_NOTES))
                    .build();
            meetingRoomPO.setFacilities(facilities);
        }
        // Get the list of meeting rooms
        List<MeetingRoom> suitableMeetingRooms = meetingRoomMapper.getMeetingRoom(meetingRoomPO);
        Set<String> conflictRoomIds = new HashSet<>();
        // Check conflicts
        for (MeetingRoom meetingRoom : suitableMeetingRooms) {
            List<Reservation> reservations = meetingRoomMapper.getConfirmedReservationsByRoomId(meetingRoom.getRoomId());
            for (Reservation r : reservations) {
                if (
                        checkConflict(
                            meetingRoomDTO.getStartTime(), meetingRoomDTO.getEndTime(),
                            r.getStartTime(),              r.getEndTime()
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

    @Override
    @Transactional
    public boolean bookMeetingRoom(BookingDTO bookingDTO) {
        // Generate a reservation ID
        String reservationId = UUID.randomUUID().toString();
        // Construct the reservation object
        Reservation reservation = Reservation.builder()
                .reservationId(reservationId)
                .roomId(bookingDTO.getRoomId())
                .userId(bookingDTO.getUserId())
                .attendees(bookingDTO.getAttendees())
                .purpose(bookingDTO.getPurpose())
                .startTime(bookingDTO.getStartTime())
                .endTime(bookingDTO.getEndTime())
                .build();
        meetingRoomMapper.bookMeetingRoom(reservation);
        // Get the list of confirmed reservations
        List<Reservation> reservations = meetingRoomMapper.getConfirmedReservationsByRoomId(bookingDTO.getRoomId());
        // Check conflicts
        for (Reservation r : reservations) {
            if (
                    checkConflict(
                            bookingDTO.getStartTime(), bookingDTO.getEndTime(),
                            r.getStartTime(),          r.getEndTime()
                    )
                    && r.getStatus().equals(BookingStatusConstant.CONFIRMED)) {
                meetingRoomMapper.deleteReservation(reservationId);
                throw new BaseException(ErrorCode.CONFLICT_RESERVATION);
            }
        }
        // Update the reservation status
        meetingRoomMapper.updateReservationStatus(reservationId, BookingStatusConstant.CONFIRMED);
        return true;
    }

    @Override
    @Transactional
    public boolean updateMeetingRoom(BookingDTO bookingDTO) {
        // Get the old reservation
        Reservation oldReservation = meetingRoomMapper.getReservationsByReservationId(bookingDTO.getReservationId());
        if (oldReservation == null) {
            throw new BaseException(ErrorCode.RESERVATION_NOT_FOUND);
        }
        // Construct the new reservation object
        Reservation newReservation = Reservation.builder()
                .reservationId(bookingDTO.getReservationId())
                .roomId(bookingDTO.getRoomId())
                .userId(bookingDTO.getUserId())
                .attendees(bookingDTO.getAttendees())
                .purpose(bookingDTO.getPurpose())
                .startTime(bookingDTO.getStartTime())
                .endTime(bookingDTO.getEndTime())
                .version(oldReservation.getVersion() + 1)
                .build();
        meetingRoomMapper.updateReservation(newReservation);
        // Get the list of confirmed reservations
        List<Reservation> reservations = meetingRoomMapper.getConfirmedReservationsByRoomId(bookingDTO.getRoomId());
        for (Reservation r : reservations) {
            // Skip the current reservation
            if (r.getReservationId().equals(bookingDTO.getReservationId())) {
                continue;
            }
            // Check conflicts
            if (
                    checkConflict(
                            bookingDTO.getStartTime(), bookingDTO.getEndTime(),
                            r.getStartTime(),          r.getEndTime()
                    )
                    && r.getStatus().equals(BookingStatusConstant.CONFIRMED)
            ) {
                meetingRoomMapper.deleteReservation(newReservation.getReservationId());
                throw new BaseException(ErrorCode.CONFLICT_RESERVATION);
            }
        }
        // Update the reservation status
        meetingRoomMapper.updateReservationStatus(newReservation.getReservationId(), BookingStatusConstant.CONFIRMED);
        return true;
    }

    @Override
    @Transactional
    public boolean cancelMeetingRoom(String reservationId) {
        // Check if the reservation ID is provided
        if (reservationId == null || reservationId.isEmpty()) {
            throw new BaseException(ErrorCode.PARAM_ERROR);
        }
        // Get the reservation
        Reservation reservation = meetingRoomMapper.getReservationsByReservationId(reservationId);
        // Check if the reservation exists
        if (reservation == null) {
            throw new BaseException(ErrorCode.RESERVATION_NOT_FOUND);
        }
        // Update the reservation status
        meetingRoomMapper.updateReservationStatus(reservationId, BookingStatusConstant.CANCELED);
        return true;
    }

    private boolean checkConflict(OffsetDateTime startTime,            OffsetDateTime endTime,
                                  OffsetDateTime reservationStartTime, OffsetDateTime reservationEndTime) {
        // 1. st <= rs < et
        // 2. st < re <= et
        // 3. rs <= st < et <= re
        return (
                //case 1
                (
                    // st <= rs
                    (startTime.isBefore(reservationStartTime) || startTime.isEqual(reservationStartTime)) &&
                    // rs < et
                    endTime.isAfter(reservationStartTime)
                ) ||
                //case 2
                (
                    // st < re
                    startTime.isBefore(reservationEndTime) &&
                    // re <= et
                    (endTime.isEqual(reservationEndTime) || endTime.isAfter(reservationEndTime))
                ) ||
                //case 3
                (
                    // rs <= st
                    (reservationStartTime.isBefore(startTime) || reservationStartTime.isEqual(startTime)) &&
                    // st < et
                    (reservationEndTime.isEqual(endTime) || reservationEndTime.isAfter(endTime))
                )
        );
    }
}
