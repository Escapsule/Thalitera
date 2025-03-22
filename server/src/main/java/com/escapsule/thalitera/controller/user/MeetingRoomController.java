package com.escapsule.thalitera.controller.user;

import com.escapsule.thalitera.dto.MeetingRoomDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.transfer.MeetingRoomTransfer;
import com.escapsule.thalitera.response.ApiResult;
import com.escapsule.thalitera.service.MeetingRoomService;
import com.escapsule.thalitera.vo.MeetingRoomVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Slf4j
public class MeetingRoomController {

    private MeetingRoomService meetingRoomService;


    public MeetingRoomController(MeetingRoomService meetingRoomService) {
        this.meetingRoomService = meetingRoomService;
    }

    @RequestMapping("/meetingroom")
    public ApiResult<List<MeetingRoomVO>> getMeetingRoom(MeetingRoomDTO meetingRoomDTO) {
        List<MeetingRoom> suitableMeetingRooms = meetingRoomService.getMeetingRoom(meetingRoomDTO);
        return ApiResult.success(
                suitableMeetingRooms
                        .stream()
                        .map(MeetingRoomTransfer.INSTANCE::meetingRoom2MeetingRoomVO)
                        .toList()
        );
    }
}
