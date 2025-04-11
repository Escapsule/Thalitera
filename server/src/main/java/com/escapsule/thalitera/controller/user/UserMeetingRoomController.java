package com.escapsule.thalitera.controller.user;

import com.escapsule.thalitera.dto.BookingDTO;
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
@RequestMapping("/user/meetingroom")
@Slf4j
public class UserMeetingRoomController {

    private final MeetingRoomService meetingRoomService;

    public UserMeetingRoomController(MeetingRoomService meetingRoomService) {
        this.meetingRoomService = meetingRoomService;
    }

    /**
     * Get all meeting rooms
     * @return List of meeting rooms
     */
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

    /**
     * Get meeting rooms based on required conditions
     * @param bookingDTO The DTO object containing the parameters for the meeting room.
     * @return List of suitable meeting rooms
     */
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

    /**
     * Book a meeting room
     * @param bookingDTO The DTO object containing the parameters for the meeting room.
     * @return Book result
     */
    @RequestMapping("/booking")
    public ApiResult<String> bookMeetingRoom(@RequestBody @Valid BookingDTO bookingDTO) {
        boolean success = meetingRoomService.bookMeetingRoom(bookingDTO);
        if (success) {
            return ApiResult.success("Booking successful.");
        } else {
            return ApiResult.success("Booking failed.");
        }
    }

    /**
     * Update a meeting room booking
     * @param bookingDTO The DTO object containing the parameters for the meeting room.
     * @return Update result
     */
    @RequestMapping("/update")
    public ApiResult<String> updateBooking(@RequestBody @Valid BookingDTO bookingDTO) {
        boolean success = meetingRoomService.updateBooking(bookingDTO);
        if (success) {
            return ApiResult.success("Update successful.");
        } else {
            return ApiResult.success("Update failed.");
        }
    }

    /**
     * Cancel a meeting room booking
     * @param reservationId The ID of the reservation to be canceled.
     * @return Cancel result
     */
    @RequestMapping("/cancel")
    public ApiResult<String> cancelMeetingRoom(@RequestBody @NotBlank String reservationId) {
        boolean success = meetingRoomService.cancelMeetingRoom(reservationId);
        if (success) {
            return ApiResult.success("Cancel successful.");
        } else {
            return ApiResult.success("Cancel failed.");
        }
    }
}
