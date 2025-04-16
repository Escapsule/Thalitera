package com.escapsule.thalitera.controller.admin;

import com.escapsule.thalitera.dto.MeetingRoomDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.response.ApiResult;
import com.escapsule.thalitera.service.MeetingRoomService;
import com.escapsule.thalitera.transfer.MeetingRoomTransfer;
import com.escapsule.thalitera.vo.MeetingRoomVO;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/meetingroom")
@Slf4j
@RequiredArgsConstructor
public class MeetingRoomController {

    private final MeetingRoomService meetingRoomService;

    /**
     * Get all meeting rooms
     *
     * @return List of meeting rooms
     */
    @GetMapping("/all")
    public ApiResult<List<MeetingRoomVO>> getAllMeetingRooms() {
        List<MeetingRoom> meetingRooms = meetingRoomService.getAllMeetingRooms();
        log.info("Get all meeting rooms: {}", meetingRooms);
        return ApiResult.success(
                meetingRooms
                        .stream()
                        .map(MeetingRoomTransfer.INSTANCE::meetingRoom2MeetingRoomVO)
                        .toList()
        );
    }

    /**
     * add new meeting room (one by one)
     *
     * @param meetingRoomDTO MeetingRoomDTO object containing meeting room information
     * @return ApiResult with success message
     */
    @PostMapping("/add")
    public ApiResult<String> addMeetingRoom(@RequestBody @Valid MeetingRoomDTO meetingRoomDTO,
                                            HttpSession session) {
        User user = (User) session.getAttribute("user");
        boolean success = meetingRoomService.addMeetingRoom(meetingRoomDTO, user.getUserId());
        if (success) {
            log.info("Add meeting room: {}", meetingRoomDTO);
            return ApiResult.success("Add successful.");
        } else {
            log.info("Add meeting room failed: {}", meetingRoomDTO);
            return ApiResult.success("Add failed.");
        }
    }

    /**
     * modify the requested meeting room
     *
     * @param meetingRoomDTO MeetingRoomDTO object containing target meeting room information
     * @return ApiResult with success message
     */
    @PostMapping("/modify")
    public ApiResult<String> modifyMeetingRoom(@RequestBody @Valid MeetingRoomDTO meetingRoomDTO) {
        if (meetingRoomDTO.getRoomId() == null) {
            throw new BaseException(ErrorCode.MISSING_ROOM_ID);
        }
        boolean success = meetingRoomService.modifyMeetingRoom(meetingRoomDTO);
        if (success) {
            log.info("Modify meeting room: {}", meetingRoomDTO);
            return ApiResult.success("Modify successful.");
        } else {
            log.info("Modify meeting room failed: {}", meetingRoomDTO);
            return ApiResult.success("Modify failed.");
        }
    }

    @PostMapping("/delete")
    public ApiResult<String> deleteMeetingRoom(@RequestBody List<UUID> roomIds) {
        if (roomIds == null || roomIds.isEmpty()) {
            throw new BaseException(ErrorCode.MISSING_ROOM_ID);
        }
        log.info("Delete meeting room: {}", roomIds);
        int rows = meetingRoomService.deleteMeetingRoom(roomIds);
        log.info("{} meeting rooms deleted", rows);
        return ApiResult.success(rows + " meeting rooms deleted.");
    }
}
