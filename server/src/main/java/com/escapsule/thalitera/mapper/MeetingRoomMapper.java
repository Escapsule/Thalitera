package com.escapsule.thalitera.mapper;

import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.entity.Reservation;
import com.escapsule.thalitera.po.MeetingRoomPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface MeetingRoomMapper {

    List<MeetingRoom> getMeetingRoom(MeetingRoomPO meetingRoomPO);

    @Select("SELECT * FROM reservations WHERE room_id = #{roomId}::uuid")
    List<Reservation> getReservationsByRoomId(String roomId);
}
