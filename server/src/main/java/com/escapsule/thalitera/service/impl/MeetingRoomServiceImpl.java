package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.constant.MeetingRoomStatusConstant;
import com.escapsule.thalitera.dto.MeetingRoomDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.mapper.MeetingRoomMapper;
import com.escapsule.thalitera.service.MeetingRoomService;
import com.escapsule.thalitera.transfer.MeetingRoomTransfer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public boolean addMeetingRoom(MeetingRoomDTO meetingRoomDTO,
                                  UUID createdBy) {
        // Check if the capacity is valid
        if (meetingRoomDTO.getCapacityMin() > meetingRoomDTO.getCapacityMax()) {
            throw new BaseException(ErrorCode.CAPACITY_ERROR);
        }
        UUID roomId = UUID.randomUUID();
        MeetingRoom meetingRoom = MeetingRoomTransfer.INSTANCE.meetingRoomDTO2MeetingRoom(
                meetingRoomDTO,
                roomId,
                createdBy,
                MeetingRoomStatusConstant.MAINTENANCE
        );
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
        MeetingRoom newMeetingRoom = MeetingRoomTransfer.INSTANCE.modifyMeetingRoomDTO2MeetingRoom(
                meetingRoomDTO,
                meetingRoom.getCreatedBy(),
                meetingRoom.getCreatedAt()
        );
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

    @Override
    public int deleteMeetingRoom(List<UUID> roomIds) {
        return meetingRoomMapper.batchDeleteMeetingRoom(roomIds);
    }
}
