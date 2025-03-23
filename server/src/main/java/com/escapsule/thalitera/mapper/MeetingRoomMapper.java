package com.escapsule.thalitera.mapper;

import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.entity.Reservation;
import com.escapsule.thalitera.po.MeetingRoomPO;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface MeetingRoomMapper {

    List<MeetingRoom> getMeetingRoom(MeetingRoomPO meetingRoomPO);

    @Select("SELECT * FROM meeting_rooms WHERE status = 'active'")
    List<MeetingRoom> getAllActiveMeetingRooms();

    @Select("SELECT * FROM reservations WHERE room_id = #{roomId}::uuid")
    List<Reservation> getReservationsByRoomId(String roomId);

    void bookMeetingRoom(Reservation reservation);

    @Delete("DELETE FROM reservations WHERE reservation_id = #{reservationId}::uuid")
    void deleteReservation(String reservationId);

    @Update("UPDATE reservations SET status = #{confirmed} WHERE reservation_id = #{reservationId}::uuid")
    void updateReservationStatus(String reservationId, String confirmed);

    @Select("SELECT * FROM reservations WHERE reservation_id = #{reservationId}::uuid")
    Reservation getReservationsByReservationId(String reservationId);

    void updateReservation(Reservation newReservation);
}
