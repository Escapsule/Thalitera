package com.escapsule.thalitera.transfer;

import com.escapsule.thalitera.entity.Reservation;
import com.escapsule.thalitera.vo.ReservationVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.UUID;
import java.util.function.Function;

@Mapper
public interface ReservationTransfer {

    ReservationTransfer INSTANCE = org.mapstruct.factory.Mappers.getMapper(ReservationTransfer.class);

    @Mapping(target = "roomName", expression = "java(getRoomNameById(getRoomNameByRoomId, source.getRoomId()))")
    @Mapping(target = "userName", expression = "java(getUserNameById(getUserNameByUserId, source.getUserId()))")
    ReservationVO reservation2ReservationVO(Reservation source,
                                            Function<UUID, String> getRoomNameByRoomId,
                                            Function<UUID, String> getUserNameByUserId);

    default String getRoomNameById(Function<UUID, String> getRoomNameByRoomId, UUID roomId) {
        return getRoomNameByRoomId.apply(roomId);
    }

    default String getUserNameById(Function<UUID, String> getUserNameByUserId, UUID userId) {
        return getUserNameByUserId.apply(userId);
    }
}
