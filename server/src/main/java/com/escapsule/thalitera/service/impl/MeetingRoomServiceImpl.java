package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.constant.FacilitiesItemsConstant;
import com.escapsule.thalitera.constant.MeetingRoomStatusConstant;
import com.escapsule.thalitera.dto.MeetingRoomDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.json.MeetingRoomFacilities;
import com.escapsule.thalitera.mapper.MeetingRoomMapper;
import com.escapsule.thalitera.service.MeetingRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class MeetingRoomServiceImpl implements MeetingRoomService {

    private final MeetingRoomMapper meetingRoomMapper;

    /**
     * Add a new meeting room.
     *
     * @param meetingRoomDTO The DTO object containing the parameters for the meeting room.
     * @return True if the addition is successful, throw an exception otherwise.
     */
    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public boolean addMeetingRoom(MeetingRoomDTO meetingRoomDTO) {
        // Check if the capacity is valid
        if (meetingRoomDTO.getCapacityMin() > meetingRoomDTO.getCapacityMax()) {
            throw new BaseException(ErrorCode.CAPACITY_ERROR);
        }
        UUID roomId = UUID.randomUUID();
        MeetingRoomFacilities facilities = MeetingRoomFacilities.builder()
                .projector((Boolean) meetingRoomDTO.getFacilities().get(FacilitiesItemsConstant.PROJECTOR))
                .whiteboard((Integer) meetingRoomDTO.getFacilities().get(FacilitiesItemsConstant.WHITEBOARD))
                .powerSockets((Integer) meetingRoomDTO.getFacilities().get(FacilitiesItemsConstant.POWER_SOCKETS))
                .coffeeBreak((Boolean) meetingRoomDTO.getFacilities().get(FacilitiesItemsConstant.COFFEE_BREAK))
                .specialNotes((List<String>) meetingRoomDTO.getFacilities().get(FacilitiesItemsConstant.SPECIAL_NOTES))
                .build();
        MeetingRoom meetingRoom = MeetingRoom.builder()
                .roomId(roomId)
                .name(meetingRoomDTO.getName())
                .capacityMin(meetingRoomDTO.getCapacityMin())
                .capacityMax(meetingRoomDTO.getCapacityMax())
                .building(meetingRoomDTO.getBuilding())
                .floor(meetingRoomDTO.getFloor())
                .status(MeetingRoomStatusConstant.MAINTENANCE)
                .facilities(facilities)
                .createdBy(meetingRoomDTO.getCreatedBy())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .image(meetingRoomDTO.getImage())
                .build();
        // Insert the meeting room
        meetingRoomMapper.addMeetingRoom(meetingRoom);
        return true;
    }

    /**
     * Modify an existing meeting room.
     *
     * @param meetingRoomDTO The DTO object containing the parameters for the meeting room.
     * @return True if the modification is successful, throw an exception otherwise.
     */
    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public boolean modifyMeetingRoom(MeetingRoomDTO meetingRoomDTO) {
        // Check if the room ID is provided
        if (meetingRoomDTO.getRoomId() == null) {
            throw new BaseException(ErrorCode.MISSING_ROOM_ID);
        }
        // Get the meeting room
        MeetingRoom meetingRoom = meetingRoomMapper.getMeetingRoomByRoomId(meetingRoomDTO.getRoomId());
        // Check if the meeting room exists
        if (meetingRoom == null) {
            throw new BaseException(ErrorCode.MEETING_ROOM_NOT_FOUND);
        }
        // Check if the capacity is valid
        if (meetingRoomDTO.getCapacityMin() > meetingRoomDTO.getCapacityMax()) {
            throw new BaseException(ErrorCode.CAPACITY_ERROR);
        }
        MeetingRoomFacilities facilities = MeetingRoomFacilities.builder()
                .projector((Boolean) meetingRoomDTO.getFacilities().get(FacilitiesItemsConstant.PROJECTOR))
                .whiteboard((Integer) meetingRoomDTO.getFacilities().get(FacilitiesItemsConstant.WHITEBOARD))
                .powerSockets((Integer) meetingRoomDTO.getFacilities().get(FacilitiesItemsConstant.POWER_SOCKETS))
                .coffeeBreak((Boolean) meetingRoomDTO.getFacilities().get(FacilitiesItemsConstant.COFFEE_BREAK))
                .specialNotes((List<String>) meetingRoomDTO.getFacilities().get(FacilitiesItemsConstant.SPECIAL_NOTES))
                .build();
        MeetingRoom newMeetingRoom = MeetingRoom.builder()
                .roomId(meetingRoomDTO.getRoomId())
                .name(meetingRoomDTO.getName())
                .capacityMin(meetingRoomDTO.getCapacityMin())
                .capacityMax(meetingRoomDTO.getCapacityMax())
                .building(meetingRoomDTO.getBuilding())
                .floor(meetingRoomDTO.getFloor())
                .status(meetingRoomDTO.getStatus())
                .facilities(facilities)
                .createdBy(meetingRoom.getCreatedBy())
                .createdAt(meetingRoom.getCreatedAt())
                .updatedAt(OffsetDateTime.now())
                .image(meetingRoomDTO.getImage())
                .build();
        log.info("Facilities {}", meetingRoomDTO.getFacilities());
        // Update the meeting room
        meetingRoomMapper.updateMeetingRoom(newMeetingRoom);
        return true;
    }

    /**
     * Get all meeting rooms.
     *
     * @return The list of all meeting rooms.
     */
    @Override
    public List<MeetingRoom> getAllMeetingRooms() {
        return meetingRoomMapper.getAllMeetingRooms();
    }
}
