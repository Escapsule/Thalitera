package com.escapsule.thalitera.controller.admin;

import com.escapsule.thalitera.dto.MeetingRoomDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.response.ApiResult;
import com.escapsule.thalitera.service.MeetingRoomService;
import com.escapsule.thalitera.transfer.MeetingRoomTransfer;
import com.escapsule.thalitera.vo.MeetingRoomVO;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("admin")
@RequestMapping("/admin/meetingroom")
@Slf4j
public class MeetingRoomController {

    private final MeetingRoomService meetingRoomService;

    public MeetingRoomController(MeetingRoomService meetingRoomService) {
        this.meetingRoomService = meetingRoomService;
    }

    @RequestMapping("/all")
    public ApiResult<List<MeetingRoomVO>> getAllMeetingRooms() {
        List<MeetingRoom> meetingRooms = meetingRoomService.getAllActiveMeetingRooms();
        return ApiResult.success(
                meetingRooms
                        .stream()
                        .map(MeetingRoomTransfer.INSTANCE::meetingRoom2MeetingRoomVO)
                        .toList()
        );
    }

    @RequestMapping("/add")
    public ApiResult<String> addMeetingRoom(@RequestBody @Valid MeetingRoomDTO meetingRoomDTO) {
        boolean success = meetingRoomService.addMeetingRoom(meetingRoomDTO);
        if (success) {
            return ApiResult.success("Add successful.");
        } else {
            return ApiResult.success("Add failed.");
        }
    }

    @RequestMapping("/modify")
    public ApiResult<String> modifyMeetingRoom(@RequestBody @Valid MeetingRoomDTO meetingRoomDTO) {
        boolean success = meetingRoomService.modifyMeetingRoom(meetingRoomDTO);
        if (success) {
            return ApiResult.success("Modify successful.");
        } else {
            return ApiResult.success("Modify failed.");
        }
    }
}
