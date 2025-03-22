package com.escapsule.thalitera.mapper;

import com.escapsule.thalitera.dto.MeetingRoomDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper
public interface MeetingRoomMapper {

    List<MeetingRoom> getMeetingRoom(MeetingRoomDTO meetingRoomDTO);

}
