package com.escapsule.thalitera.mapper;

import com.escapsule.thalitera.entity.Reservation;
import com.escapsule.thalitera.handler.PGListTypeHandler;
import org.apache.ibatis.annotations.*;

import java.time.OffsetDateTime;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ReservationMapper {

    @Select("""
        SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600), 0)
        FROM reservations
        WHERE room_id = #{roomId}
          AND start_time >= #{start}
          AND end_time <= #{end}
          AND status = 'confirmed'
    """)

    double getTotalBookedHours(
            @Param("roomId") UUID roomId,
            @Param("start") OffsetDateTime start,
            @Param("end") OffsetDateTime end
    );


    @Select("SELECT * FROM reservations WHERE room_id = #{roomId} AND status = 'confirmed'")
    List<Reservation> getConfirmedReservationsByRoomId(UUID roomId);

    void makeReservation(Reservation reservation);

    @Delete("DELETE FROM reservations WHERE reservation_id = #{reservationId}")
    void deleteReservation(UUID reservationId);

    @Update("UPDATE reservations SET status = #{status}, updated_at = now() WHERE reservation_id = #{reservationId}")
    void updateReservationStatus(UUID reservationId, String status);

    @Select("SELECT * FROM reservations WHERE reservation_id = #{reservationId}")
    Reservation getReservationsByReservationId(UUID reservationId);

    void updateReservation(Reservation newReservation);

    @Select("SELECT * FROM reservations")
    @Result(property = "attendees", column = "attendees", typeHandler = PGListTypeHandler.class)
    List<Reservation> getAllReservations();
}
