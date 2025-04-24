package com.escapsule.thalitera.mapper;

import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.handler.PGMeetingRoomFacilitiesTypeHandler;
import com.escapsule.thalitera.po.MeetingRoomPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;
import java.util.UUID;

@Mapper
public interface MeetingRoomMapper {

    List<MeetingRoom> getActiveMeetingRoomsByFilter(MeetingRoomPO meetingRoomPO);

    @Select("SELECT * FROM meeting_rooms WHERE room_id = #{roomId}")
    @Result(property = "facilities",
            column = "facilities",
            typeHandler = PGMeetingRoomFacilitiesTypeHandler.class)
    MeetingRoom getMeetingRoomByRoomId(UUID roomId);

    void updateMeetingRoom(MeetingRoom newMeetingRoom);

    void addMeetingRoom(MeetingRoom meetingRoom);

    @Select("SELECT * FROM meeting_rooms")
    List<MeetingRoom> getAllMeetingRooms();

    int batchDeleteMeetingRoom(List<UUID> roomIds);

    /**
     * Update the image url of a meeting room
     *
     * @param url the image url
     * @param roomId the room id
     */
    @Update("UPDATE meeting_rooms SET image = #{url} WHERE room_id = #{roomId}")
    void updateMeetingRoomImage(String url, UUID roomId);
}
