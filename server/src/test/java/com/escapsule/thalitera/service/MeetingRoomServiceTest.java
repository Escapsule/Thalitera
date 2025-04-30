package com.escapsule.thalitera.service;

import com.escapsule.thalitera.constant.MeetingRoomStatusConstant;
import com.escapsule.thalitera.dto.MeetingRoomDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.mapper.MeetingRoomMapper;
import com.escapsule.thalitera.service.impl.MeetingRoomServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = MeetingRoomServiceImpl.class)
class MeetingRoomServiceTest {

    @Autowired
    private MeetingRoomService service;

    @MockitoBean
    private MeetingRoomMapper meetingRoomMapper;

    private MeetingRoomDTO dto;
    private UUID creator;
    private UUID roomId;
    private Map<String,Object> facilities;

    @BeforeEach
    void setUp() {
        creator = UUID.randomUUID();
        roomId = UUID.randomUUID();

        dto = new MeetingRoomDTO();
        dto.setName("Conference A");
        dto.setCapacityMin(1);
        dto.setCapacityMax(5);

        facilities = new HashMap<>();
        facilities.put("Projector", true);
        facilities.put("Whiteboard", true);
        dto.setFacilities(facilities);
        dto.setRoomId(roomId);
    }

    @Test
    void addMeetingRoom_valid_returnsTrueAndCallsMapper() {
        dto.setCapacityMin(2);
        dto.setCapacityMax(10);

        boolean result = service.addMeetingRoom(dto, creator);
        assertTrue(result);

        verify(meetingRoomMapper).addMeetingRoom(argThat(mr ->
                mr.getCreatedBy().equals(creator) &&
                        mr.getStatus().equals(MeetingRoomStatusConstant.MAINTENANCE) &&
                        mr.getCapacityMin() == 2 &&
                        mr.getCapacityMax() == 10 &&
                        mr.getFacilities() != null
        ));
    }

    @Test
    void addMeetingRoom_invalidCapacity_throwsBaseException() {
        dto.setCapacityMin(10);
        dto.setCapacityMax(5);

        BaseException ex = assertThrows(BaseException.class,
                () -> service.addMeetingRoom(dto, creator));
        assertEquals(ErrorCode.CAPACITY_ERROR.getCode(), ex.getCode());

        verifyNoInteractions(meetingRoomMapper);
    }

    @Test
    void modifyMeetingRoom_missingId_throwsBaseException() {
        dto.setRoomId(null);

        BaseException ex = assertThrows(BaseException.class,
                () -> service.modifyMeetingRoom(dto));
        assertEquals(ErrorCode.MISSING_ROOM_ID.getCode(), ex.getCode());

        verifyNoInteractions(meetingRoomMapper);
    }

    @Test
    void modifyMeetingRoom_notFound_throwsBaseException() {
        when(meetingRoomMapper.getMeetingRoomByRoomId(eq(roomId))).thenReturn(null);

        BaseException ex = assertThrows(BaseException.class,
                () -> service.modifyMeetingRoom(dto));
        assertEquals(ErrorCode.MEETING_ROOM_NOT_FOUND.getCode(), ex.getCode());

        verify(meetingRoomMapper).getMeetingRoomByRoomId(roomId);
        verify(meetingRoomMapper, never()).updateMeetingRoom(any());
    }

    @Test
    void modifyMeetingRoom_valid_callsUpdateAndReturnsTrue() {
        MeetingRoom stored = new MeetingRoom();
        stored.setRoomId(roomId);
        stored.setCreatedBy(creator);
        stored.setCreatedAt(stored.getCreatedAt());
        when(meetingRoomMapper.getMeetingRoomByRoomId(roomId)).thenReturn(stored);

        dto.setCapacityMin(2);
        dto.setCapacityMax(8);

        boolean ok = service.modifyMeetingRoom(dto);
        assertTrue(ok);

        verify(meetingRoomMapper).updateMeetingRoom(argThat(mr ->
                mr.getRoomId().equals(roomId) &&
                        mr.getCreatedBy().equals(creator) &&
                        mr.getCapacityMin() == 2 &&
                        mr.getCapacityMax() == 8 &&
                        mr.getFacilities() != null
        ));
    }


    @Test
    void getAllMeetingRooms_delegatesToMapper() {
        List<MeetingRoom> list = List.of(new MeetingRoom(), new MeetingRoom());
        when(meetingRoomMapper.getAllMeetingRooms()).thenReturn(list);

        List<MeetingRoom> out = service.getAllMeetingRooms();
        assertSame(list, out);
        verify(meetingRoomMapper).getAllMeetingRooms();
    }

    @Test
    void deleteMeetingRoom_delegatesToMapper() {
        List<UUID> ids = List.of(UUID.randomUUID(), UUID.randomUUID());
        when(meetingRoomMapper.batchDeleteMeetingRoom(ids)).thenReturn(2);

        int count = service.deleteMeetingRoom(ids);
        assertEquals(2, count);
        verify(meetingRoomMapper).batchDeleteMeetingRoom(ids);
    }
}
