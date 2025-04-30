package com.escapsule.thalitera.transfer;

import com.escapsule.thalitera.dto.ReservationDTO;
import com.escapsule.thalitera.entity.Reservation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.UUID;

@Mapper
public interface ReservationTransfer {

    ReservationTransfer INSTANCE = org.mapstruct.factory.Mappers.getMapper(ReservationTransfer.class);

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
}
