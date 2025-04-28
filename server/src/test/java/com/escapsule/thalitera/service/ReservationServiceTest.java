package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.ReservationDTO;
import com.escapsule.thalitera.dto.TimeRangeDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.entity.Reservation;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.mapper.MeetingRoomMapper;
import com.escapsule.thalitera.mapper.ReservationMapper;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.service.impl.ReservationServiceImpl;
import com.escapsule.thalitera.vo.ReservationVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.escapsule.thalitera.vo.MeetingRoomVO;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = ReservationServiceImpl.class)
class ReservationServiceTest {

    @Autowired
    private ReservationService service;

    @MockitoBean
    private ReservationMapper reservationMapper;

    @MockitoBean
    private MeetingRoomMapper meetingRoomMapper;

    @MockitoBean
    private UserMapper userMapper;

    @MockitoBean
    private ApplicationEventPublisher eventPublisher;

    private UUID userId;
    private UUID roomId;
    private UUID reservationId;
    private ReservationDTO reservationDTO;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        roomId = UUID.randomUUID();
        reservationId = UUID.randomUUID();

        reservationDTO = ReservationDTO.builder()
                .roomId(roomId)
                .attendees(List.of("test@example.com"))
                .startTime(OffsetDateTime.now().plusHours(1))
                .endTime(OffsetDateTime.now().plusHours(2))
                .build();
    }

    @Test
    void getAllActiveMeetingRooms() {
        when(meetingRoomMapper.getActiveMeetingRoomsByFilter(any())).thenReturn(List.of(new MeetingRoom()));

        List<MeetingRoom> rooms = service.getAllActiveMeetingRooms();

        assertNotNull(rooms);
        assertFalse(rooms.isEmpty());
        verify(meetingRoomMapper).getActiveMeetingRoomsByFilter(any());
    }

    @Test
    void getMeetingRoom_invalidTimeRange_throwsException() {
        reservationDTO.setStartTime(OffsetDateTime.now().plusHours(2));
        reservationDTO.setEndTime(OffsetDateTime.now().plusHours(1));

        BaseException ex = assertThrows(BaseException.class, () -> service.getMeetingRoom(reservationDTO));
        assertEquals(ErrorCode.INVALID_TIME_RANGE.getCode(), ex.getCode());
    }

    @Test
    void makeReservation_invalidAttendees_throwsException() {
        reservationDTO.setAttendees(List.of());
        reservationDTO.setStartTime(OffsetDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0));
        reservationDTO.setEndTime(reservationDTO.getStartTime().plusHours(1));

        BaseException ex = assertThrows(BaseException.class, () -> service.makeReservation(reservationDTO, userId));
        assertEquals(ErrorCode.MISSING_ATTENDEES.getCode(), ex.getCode());
    }



    @Test
    void updateReservation_notFound_throwsException() {
        reservationDTO.setStartTime(OffsetDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0));
        reservationDTO.setEndTime(reservationDTO.getStartTime().plusHours(1));

        when(reservationMapper.getReservationByReservationId(any())).thenReturn(null);

        BaseException ex = assertThrows(BaseException.class, () -> service.updateReservation(reservationDTO, userId));

        assertEquals(ErrorCode.RESERVATION_NOT_FOUND.getCode(), ex.getCode());
    }


    @Test
    void cancelReservation_missingReservationId_throwsException() {
        BaseException ex = assertThrows(BaseException.class, () -> service.cancelReservation(null, userId));
        assertEquals(ErrorCode.MISSING_RESERVATION_ID.getCode(), ex.getCode());
    }

    @Test
    void getAllReservations_success() {
        ReservationVO vo = new ReservationVO();
        vo.setMeetingRoom(new MeetingRoomVO());
        vo.getMeetingRoom().setRoomId(UUID.randomUUID().toString());

        when(reservationMapper.getAllReservationDetails()).thenReturn(List.of(vo));

        List<ReservationVO> result = service.getAllReservations();

        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(reservationMapper).getAllReservationDetails();
    }

    @Test
    void getMyReservations_success() {
        ReservationVO vo = new ReservationVO();
        vo.setMeetingRoom(new MeetingRoomVO());
        vo.getMeetingRoom().setRoomId(UUID.randomUUID().toString());

        when(reservationMapper.getUserRelatedReservationDetailsByUserId(userId))
                .thenReturn(List.of(vo));

        List<ReservationVO> result = service.getMyReservations(userId);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(reservationMapper).getUserRelatedReservationDetailsByUserId(userId);
    }

    @Test
    void getMeetingRoomReservedTime_success() {
        Reservation r = new Reservation();
        r.setStartTime(OffsetDateTime.now().plusHours(1));
        r.setEndTime(OffsetDateTime.now().plusHours(2));

        when(reservationMapper.getConfirmedReservationsByRoomId(roomId))
                .thenReturn(List.of(r));

        List<TimeRangeDTO> ranges = service.getMeetingRoomReservedTime(roomId, OffsetDateTime.now());

        assertNotNull(ranges);
        assertFalse(ranges.isEmpty());
        verify(reservationMapper).getConfirmedReservationsByRoomId(roomId);
    }
}
