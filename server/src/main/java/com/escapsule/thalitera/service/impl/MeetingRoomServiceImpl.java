package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.constant.BookingStatusConstant;
import com.escapsule.thalitera.dto.BookingDTO;
import com.escapsule.thalitera.dto.MeetingRoomDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.entity.Reservation;
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
    public List<MeetingRoom> getMeetingRoom(MeetingRoomDTO meetingRoomDTO) {
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
                    .projector((Boolean) facilitiesMap.get("projector"))
                    .whiteboard((Integer) facilitiesMap.get("whiteboard"))
                    .powerSockets((Integer) facilitiesMap.get("powerSockets"))
                    .coffeeBreak((Boolean) facilitiesMap.get("coffeeBreak"))
                    .specialNotes((List<String>) facilitiesMap.get("specialNotes"))
                    .build();
            meetingRoomPO.setFacilities(facilities);
        }
        List<MeetingRoom> suitableMeetingRooms = meetingRoomMapper.getMeetingRoom(meetingRoomPO);
        // TODO: params validation
        if (meetingRoomDTO.getAttendeesCount() <= 0) {
            log.error("The number of attendees must be greater than 0.");
            throw new IllegalArgumentException("The number of attendees must be greater than 0.");
        }
        Set<String> conflictRoomIds = new HashSet<>();
        for (MeetingRoom meetingRoom : suitableMeetingRooms) {
            List<Reservation> reservations = meetingRoomMapper.getReservationsByRoomId(meetingRoom.getRoomId());
            for (Reservation reservation : reservations) {
                // 1. st < rst < et
                // 2. st < ret < et
                // 3. rst < st < et < ret
                if ((meetingRoomDTO.getStartTime().isBefore(reservation.getStartTime()) && meetingRoomDTO.getEndTime().isAfter(reservation.getStartTime())) ||
                        (meetingRoomDTO.getStartTime().isBefore(reservation.getEndTime()) && meetingRoomDTO.getEndTime().isAfter(reservation.getEndTime())) ||
                        (reservation.getStartTime().isBefore(meetingRoomDTO.getStartTime()) && reservation.getEndTime().isAfter(meetingRoomDTO.getEndTime()))) {
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
            return false;
        }
        meetingRoomMapper.updateReservationStatus(reservationId, BookingStatusConstant.CONFIRMED);
        return true;
    }

    @Override
    @Transactional
    public boolean updateMeetingRoom(BookingDTO bookingDTO) {
        Reservation oldReservation = meetingRoomMapper.getReservationsByReservationId(bookingDTO.getReservationId());
        // TODO: params validation
        if (oldReservation == null) {
            log.error("The reservation does not exist.");
            throw new IllegalArgumentException("The reservation does not exist.");
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
            return false;
        }
        meetingRoomMapper.updateReservationStatus(newReservation.getReservationId(), BookingStatusConstant.CONFIRMED);
        return true;
    }

    private boolean checkConflict(BookingDTO bookingDTO) {
        boolean conflict = false;
        List<Reservation> reservations = meetingRoomMapper.getReservationsByRoomId(bookingDTO.getRoomId());
        for (Reservation r : reservations) {
            if ((bookingDTO.getStartTime().isBefore(r.getStartTime()) && bookingDTO.getEndTime().isAfter(r.getStartTime())) ||
                    (bookingDTO.getStartTime().isBefore(r.getEndTime()) && bookingDTO.getEndTime().isAfter(r.getEndTime())) ||
                    (r.getStartTime().isBefore(bookingDTO.getStartTime()) && r.getEndTime().isAfter(bookingDTO.getEndTime()))) {
                if (r.getStatus().equals(BookingStatusConstant.CONFIRMED)) {
                    conflict = true;
                    break;
                }
            }
        }
        return conflict;
    }
}
