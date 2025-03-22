package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.dto.MeetingRoomDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.entity.Reservation;
import com.escapsule.thalitera.json.MeetingRoomFacilities;
import com.escapsule.thalitera.mapper.MeetingRoomMapper;
import com.escapsule.thalitera.po.MeetingRoomPO;
import com.escapsule.thalitera.service.MeetingRoomService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Set;

@Service
@Slf4j
public class MeetingRoomServiceImpl implements MeetingRoomService {

    private MeetingRoomMapper meetingRoomMapper;

    public MeetingRoomServiceImpl(MeetingRoomMapper meetingRoomMapper) {
        this.meetingRoomMapper = meetingRoomMapper;
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
}
