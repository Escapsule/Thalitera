package com.escapsule.thalitera.mapper;

import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.handler.PGMeetingRoomFacilitiesTypeHandler;
import com.escapsule.thalitera.po.MeetingRoomPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.UUID;

@Mapper
public interface MeetingRoomMapper {

    List<MeetingRoom> getMeetingRoom(MeetingRoomPO meetingRoomPO);

    @Select("SELECT * FROM meeting_rooms WHERE status = 'active'")
    List<MeetingRoom> getAllActiveMeetingRooms();


    @Select("SELECT * FROM meeting_rooms WHERE room_id = #{roomId}")
    @Result(property = "facilities",
            column = "facilities",
            typeHandler = PGMeetingRoomFacilitiesTypeHandler.class)
    MeetingRoom getMeetingRoomByRoomId(UUID roomId);

    void updateMeetingRoom(MeetingRoom newMeetingRoom);

    void addMeetingRoom(MeetingRoom meetingRoom);
}
