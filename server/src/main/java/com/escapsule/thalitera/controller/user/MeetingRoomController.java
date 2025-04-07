package com.escapsule.thalitera.controller.user;

import com.escapsule.thalitera.dto.BookingDTO;
import com.escapsule.thalitera.dto.MeetingRoomDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.transfer.MeetingRoomTransfer;
import com.escapsule.thalitera.response.ApiResult;
import com.escapsule.thalitera.service.MeetingRoomService;
import com.escapsule.thalitera.vo.MeetingRoomVO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/meetingroom")
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

    @RequestMapping("/filter")
    public ApiResult<List<MeetingRoomVO>> getMeetingRoom(@RequestBody @Valid BookingDTO bookingDTO) {
        List<MeetingRoom> suitableMeetingRooms = meetingRoomService.getMeetingRoom(bookingDTO);
        return ApiResult.success(
                suitableMeetingRooms
                        .stream()
                        .map(MeetingRoomTransfer.INSTANCE::meetingRoom2MeetingRoomVO)
                        .toList()
        );
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

    @RequestMapping("/booking")
    public ApiResult<String> bookMeetingRoom(@RequestBody @Valid BookingDTO bookingDTO) {
        boolean success = meetingRoomService.bookMeetingRoom(bookingDTO);
        if (success) {
            return ApiResult.success("Booking successful.");
        } else {
            return ApiResult.success("Booking failed.");
        }
    }

    @RequestMapping("/update")
    public ApiResult<String> updateMeetingRoom(@RequestBody @Valid BookingDTO bookingDTO) {
        boolean success = meetingRoomService.updateMeetingRoom(bookingDTO);
        if (success) {
            return ApiResult.success("Update successful.");
        } else {
            return ApiResult.success("Update failed.");
        }
    }

    @RequestMapping("/cancel")
    public ApiResult<String> cancelMeetingRoom(@RequestBody @NotBlank String reservationId) {
        boolean success = meetingRoomService.cancelMeetingRoom(reservationId);
        if (success) {
            return ApiResult.success("Delete successful.");
        } else {
            return ApiResult.success("Delete failed.");
        }
    }
}
