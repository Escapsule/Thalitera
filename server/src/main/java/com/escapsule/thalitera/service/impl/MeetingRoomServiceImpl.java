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
        if (meetingRoomDTO.getStartTime().isAfter(meetingRoomDTO.getEndTime())
                || meetingRoomDTO.getStartTime().isEqual(meetingRoomDTO.getEndTime())) {
            throw new BaseException(ErrorCode.INVALID_TIME_RANGE);
        }
        MeetingRoomPO meetingRoomPO = MeetingRoomPO.builder()
                .startTime(meetingRoomDTO.getStartTime())
                .endTime(meetingRoomDTO.getEndTime())
                .attendeesCount(meetingRoomDTO.getAttendeesCount())
                .building(meetingRoomDTO.getBuilding())
                .floor(meetingRoomDTO.getFloor())
                .page(meetingRoomDTO.getPage())
                .build();
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
        List<MeetingRoom> suitableMeetingRooms = meetingRoomMapper.getMeetingRoom(meetingRoomPO);
        Set<String> conflictRoomIds = new HashSet<>();
        for (MeetingRoom meetingRoom : suitableMeetingRooms) {
            List<Reservation> reservations = meetingRoomMapper.getConfirmedReservationsByRoomId(meetingRoom.getRoomId());
            for (Reservation reservation : reservations) {
                // 1. st <= rst < et
                // 2. st < ret <= et
                // 3. rst <= st < et <= ret
                if (
                        // case 1
                        // st <= rst
                        (meetingRoomDTO.getStartTime().isBefore(reservation.getStartTime())
                            || meetingRoomDTO.getStartTime().isEqual(reservation.getStartTime()))
                        // rst < et
                        && meetingRoomDTO.getEndTime().isAfter(reservation.getStartTime()) ||
                        // case 2
                        // st < ret
                        (meetingRoomDTO.getStartTime().isBefore(reservation.getEndTime())
                        // ret <= et
                        && (meetingRoomDTO.getEndTime().isEqual(reservation.getEndTime())
                            || meetingRoomDTO.getEndTime().isAfter(reservation.getEndTime()) ||
                        // case 3
                        // rst <= st
                        (reservation.getStartTime().isBefore(meetingRoomDTO.getStartTime())
                            || reservation.getStartTime().isEqual(meetingRoomDTO.getStartTime()))
                        // et <= ret
                        && (reservation.getEndTime().isEqual(meetingRoomDTO.getEndTime())
                            || reservation.getEndTime().isAfter(meetingRoomDTO.getEndTime()))))
                ) {
                    conflictRoomIds.add(meetingRoom.getRoomId());
                }
            }
        }
        suitableMeetingRooms.removeIf(meetingRoom -> conflictRoomIds.contains(meetingRoom.getRoomId()));
        return suitableMeetingRooms;
    }

    @Override
    @Transactional
    public boolean bookMeetingRoom(BookingDTO bookingDTO) {
        String reservationId = UUID.randomUUID().toString();
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
        boolean conflict = checkConflict(bookingDTO);
        if (conflict) {
            meetingRoomMapper.deleteReservation(reservationId);
            throw new BaseException(ErrorCode.CONFLICT_RESERVATION);
        }
        meetingRoomMapper.updateReservationStatus(reservationId, BookingStatusConstant.CONFIRMED);
        return true;
    }

    @Override
    @Transactional
    public boolean updateMeetingRoom(BookingDTO bookingDTO) {
        Reservation oldReservation = meetingRoomMapper.getReservationsByReservationId(bookingDTO.getReservationId());
        if (oldReservation == null) {
            throw new BaseException(ErrorCode.RESERVATION_NOT_FOUND);
        }
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
        boolean conflict = checkConflict(bookingDTO);
        if (conflict) {
            meetingRoomMapper.deleteReservation(newReservation.getReservationId());
            throw new BaseException(ErrorCode.CONFLICT_RESERVATION);
        }
        meetingRoomMapper.updateReservationStatus(newReservation.getReservationId(), BookingStatusConstant.CONFIRMED);
        return true;
    }

    @Override
    @Transactional
    public boolean deleteMeetingRoom(String reservationId) {
        if (reservationId == null) {
            throw new BaseException(ErrorCode.PARAM_ERROR);
        }
        Reservation reservation = meetingRoomMapper.getReservationsByReservationId(reservationId);
        if (reservation == null) {
            throw new BaseException(ErrorCode.RESERVATION_NOT_FOUND);
        }
        meetingRoomMapper.updateReservationStatus(reservationId, BookingStatusConstant.CANCELED);
        return true;
    }

    private boolean checkConflict(BookingDTO bookingDTO) {
        boolean conflict = false;
        List<Reservation> reservations = meetingRoomMapper.getConfirmedReservationsByRoomId(bookingDTO.getRoomId());
        for (Reservation r : reservations) {
            if (
                    (bookingDTO.getStartTime().isBefore(r.getStartTime())
                        || bookingDTO.getStartTime().isEqual(r.getStartTime()))
                    && bookingDTO.getEndTime().isAfter(r.getStartTime()) ||
                    (bookingDTO.getStartTime().isBefore(r.getEndTime())
                    && (bookingDTO.getEndTime().isEqual(r.getEndTime())
                        || bookingDTO.getEndTime().isAfter(r.getEndTime()) ||
                    (r.getStartTime().isBefore(bookingDTO.getStartTime())
                        || r.getStartTime().isEqual(bookingDTO.getStartTime()))
                    && (r.getEndTime().isEqual(bookingDTO.getEndTime())
                        || r.getEndTime().isAfter(bookingDTO.getEndTime()))))
            ) {
                if (r.getStatus().equals(BookingStatusConstant.CONFIRMED)) {
                    conflict = true;
                    break;
                }
            }
        }
        return conflict;
    }
}
