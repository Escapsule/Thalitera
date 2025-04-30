package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.MeetingRoomUtilizationDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.mapper.MeetingRoomMapper;
import com.escapsule.thalitera.mapper.ReservationMapper;
import com.escapsule.thalitera.service.impl.MeetingRoomStatisticsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = MeetingRoomStatisticsServiceImpl.class)
class MeetingRoomStatisticsServiceTest {

    @Autowired
    private MeetingRoomStatisticsService service;

    @MockitoBean
    private ReservationMapper reservationMapper;

    @MockitoBean
    private MeetingRoomMapper meetingRoomMapper;

    private OffsetDateTime start;
    private OffsetDateTime end;
    private UUID roomId1;
    private UUID roomId2;
    private MeetingRoom room1;
    private MeetingRoom room2;

    @BeforeEach
    void setUp() {
        start = OffsetDateTime.of(2025, 5, 5, 0, 0, 0, 0, ZoneOffset.UTC);  // Monday
        end   = OffsetDateTime.of(2025, 5, 9, 23,59,59, 0, ZoneOffset.UTC); // Friday

        roomId1 = UUID.randomUUID();
        roomId2 = UUID.randomUUID();

        room1 = new MeetingRoom();
        room1.setRoomId(roomId1);
        room1.setName("Alpha");

        room2 = new MeetingRoom();
        room2.setRoomId(roomId2);
        room2.setName("Beta");
    }

    @Test
    void getUtilizationReport_whenRoomIdNull_reportsAllRooms() {
        when(meetingRoomMapper.getAllMeetingRooms()).thenReturn(List.of(room1, room2));

        when(reservationMapper.getTotalBookedHours(roomId1, start, end)).thenReturn(10.0);
        when(reservationMapper.getTotalBookedHours(roomId2, start, end)).thenReturn(20.0);

        List<MeetingRoomUtilizationDTO> report =
                service.getUtilizationReport(start, end, null);

        assertThat(report).hasSize(2);

        MeetingRoomUtilizationDTO dto1 = report.get(0);
        assertThat(dto1.getRoomId()).isEqualTo(roomId1);
        assertThat(dto1.getRoomName()).isEqualTo("Alpha");
        assertThat(dto1.getBookedHours()).isEqualTo(10.0);
        assertThat(dto1.getAvailableHours()).isEqualTo(40.0);
        assertThat(dto1.getUtilizationRate()).isEqualByComparingTo(new BigDecimal("0.25"));

        MeetingRoomUtilizationDTO dto2 = report.get(1);
        assertThat(dto2.getRoomId()).isEqualTo(roomId2);
        assertThat(dto2.getBookedHours()).isEqualTo(20.0);
        assertThat(dto2.getAvailableHours()).isEqualTo(40.0);
        assertThat(dto2.getUtilizationRate()).isEqualByComparingTo(new BigDecimal("0.50"));

        verify(meetingRoomMapper).getAllMeetingRooms();
        verify(reservationMapper).getTotalBookedHours(roomId1, start, end);
        verify(reservationMapper).getTotalBookedHours(roomId2, start, end);
    }

    @Test
    void getUtilizationReport_whenRoomIdSpecified_andExists() {

        when(meetingRoomMapper.getMeetingRoomByRoomId(roomId1)).thenReturn(room1);
        when(reservationMapper.getTotalBookedHours(roomId1, start, end)).thenReturn(16.0);

        List<MeetingRoomUtilizationDTO> report =
                service.getUtilizationReport(start, end, roomId1);

        assertThat(report).hasSize(1);
        MeetingRoomUtilizationDTO dto = report.get(0);
        assertThat(dto.getRoomId()).isEqualTo(roomId1);
        assertThat(dto.getBookedHours()).isEqualTo(16.0);
        assertThat(dto.getAvailableHours()).isEqualTo(40.0);
        assertThat(dto.getUtilizationRate()).isEqualByComparingTo(new BigDecimal("0.40"));

        verify(meetingRoomMapper).getMeetingRoomByRoomId(roomId1);
        verify(reservationMapper).getTotalBookedHours(roomId1, start, end);
    }

    @Test
    void getUtilizationReport_whenRoomIdSpecified_andNotFound_returnsEmpty() {
        when(meetingRoomMapper.getMeetingRoomByRoomId(roomId1)).thenReturn(null);

        List<MeetingRoomUtilizationDTO> report =
                service.getUtilizationReport(start, end, roomId1);

        assertThat(report).isEmpty();

        verify(meetingRoomMapper).getMeetingRoomByRoomId(roomId1);
        verifyNoInteractions(reservationMapper);
    }
}
