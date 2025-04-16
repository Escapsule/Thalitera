package com.escapsule.thalitera.transfer;

import com.escapsule.thalitera.dto.ReservationDTO;
import com.escapsule.thalitera.entity.Reservation;
import com.escapsule.thalitera.mapper.MeetingRoomMapper;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.vo.ReservationVO;
import com.escapsule.thalitera.vo.UserVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.UUID;
import java.util.function.Function;

@Mapper
public interface ReservationTransfer {

    ReservationTransfer INSTANCE = org.mapstruct.factory.Mappers.getMapper(ReservationTransfer.class);

    @Mapping(target = "roomName", expression = "java(getRoomNameById(getRoomNameByRoomId, source.getRoomId()))")
    @Mapping(target = "userName", expression = "java(getUserNameById(getUserNameByUserId, source.getUserId()))")
    @Mapping(target = "attendees", expression = "java(mapUUIDList2UserVOList(source.getAttendees(), userMapper))")
    ReservationVO reservation2ReservationVO(Reservation source,
                                            Function<UUID, String> getRoomNameByRoomId,
                                            Function<UUID, String> getUserNameByUserId,
                                            UserMapper userMapper);

    @Mapping(target = "reservationId", expression = "java(reservationId)")
    @Mapping(target = "qrToken", expression = "java(qrToken)")
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "attendees", expression = "java(new java.util.ArrayList<>())")
    @Mapping(target = "userId", expression = "java(userId)")
    Reservation newReservationDTO2Reservation(ReservationDTO source,
                                              UUID reservationId,
                                              String qrToken,
                                              UUID userId);

    @Mapping(target = "version", expression = "java(version + 1)")
    @Mapping(target = "qrToken", expression = "java(qrToken)")
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "attendees", expression = "java(new java.util.ArrayList<>())")
    @Mapping(target = "userId", expression = "java(userId)")
    Reservation updateReservationDTO2Reservation(ReservationDTO source,
                                                 int version,
                                                 String qrToken,
                                                 UUID userId);

    default String getRoomNameById(Function<UUID, String> getRoomNameByRoomId, UUID roomId) {
        return getRoomNameByRoomId.apply(roomId);
    }

    default String getUserNameById(Function<UUID, String> getUserNameByUserId, UUID userId) {
        return getUserNameByUserId.apply(userId);
    }

    default List<ReservationVO> mapReservation2ReservationVO(List<Reservation> reservations,
                                                             MeetingRoomMapper meetingRoomMapper,
                                                             UserMapper userMapper) {
        Function<UUID, String> getRoomNameByRoomId = roomId -> {
            // Fetch the room name using the room ID
            return meetingRoomMapper.getMeetingRoomByRoomId(roomId).getName();
        };
        Function<UUID, String> getUserNameByUserId = userId -> {
            // Fetch the username using the user ID
            return userMapper.getUserById(userId).getUsername();
        };
        return reservations
                .stream()
                .map(reservation ->
                        reservation2ReservationVO(
                                reservation,
                                getRoomNameByRoomId,
                                getUserNameByUserId,
                                userMapper
                        )
                )
                .toList();
    }

    default List<UserVO> mapUUIDList2UserVOList(List<UUID> userIds,
                                                UserMapper userMapper) {
        return userIds.stream()
                .map(userMapper::getUserById)
                .map(UserTransfer.INSTANCE::user2UserVO)
                .toList();
    }
}
