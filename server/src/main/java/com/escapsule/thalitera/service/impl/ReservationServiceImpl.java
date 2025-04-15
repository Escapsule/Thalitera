package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.entity.Reservation;
import com.escapsule.thalitera.mapper.MeetingRoomMapper;
import com.escapsule.thalitera.mapper.ReservationMapper;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.service.ReservationService;
import com.escapsule.thalitera.transfer.ReservationTransfer;
import com.escapsule.thalitera.vo.ReservationVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationServiceImpl implements ReservationService {

    private final ReservationMapper reservationMapper;
    private final MeetingRoomMapper meetingRoomMapper;
    private final UserMapper userMapper;

    /**
     * Fetch all reservations
     *
     * @return List of all reservations
     */
    @Override
    public List<ReservationVO> getAllReservations() {
        List<Reservation> reservations = reservationMapper.getAllReservations();
        Function<UUID, String> getRoomNameByRoomId = roomId -> {
            // Fetch the room name using the room ID
            return meetingRoomMapper.getMeetingRoomByRoomId(roomId).getName();
        };
        Function<UUID, String> getUserNameByUserId = userId -> {
            // Fetch the user name using the user ID
            return userMapper.getUserById(userId).getUsername();
        };
        return reservations
                .stream()
                .map(reservation ->
                        ReservationTransfer.INSTANCE.reservation2ReservationVO(
                                reservation,
                                getRoomNameByRoomId,
                                getUserNameByUserId
                        )
                )
                .toList();
    }
}
