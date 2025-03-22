package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.dto.MeetingRoomDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.mapper.MeetingRoomMapper;
import com.escapsule.thalitera.service.MeetingRoomService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class MeetingRoomServiceImpl implements MeetingRoomService {

    private MeetingRoomMapper meetingRoomMapper;

    public MeetingRoomServiceImpl(MeetingRoomMapper meetingRoomMapper) {
        this.meetingRoomMapper = meetingRoomMapper;
    }

    @Override
    public List<MeetingRoom> getMeetingRoom(MeetingRoomDTO meetingRoomDTO) {
        if (meetingRoomDTO.getAttendeesCount() <= 0) {
            log.error("The number of attendees must be greater than 0.");
            throw new IllegalArgumentException("The number of attendees must be greater than 0.");
        }
        // TODO: To be decided whether Facilities or String should be used
        List<MeetingRoom> suitableMeetingRooms = meetingRoomMapper.getMeetingRoom(meetingRoomDTO);
//        for (MeetingRoom meetingRoom : suitableMeetingRooms) {
//            log.info("Meeting room name: {}", meetingRoom.getName());
//            log.info("Meeting room building: {}", meetingRoom.getBuilding());
//            log.info("Meeting room floor: {}", meetingRoom.getFloor());
//            log.info("Meeting room facility: {}", meetingRoom.getFacilities());
//        }
        return suitableMeetingRooms;
    }
}
