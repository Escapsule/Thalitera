package com.escapsule.thalitera.controller.user;

import com.escapsule.thalitera.dto.BookingDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.transfer.MeetingRoomTransfer;
import com.escapsule.thalitera.response.ApiResult;
import com.escapsule.thalitera.service.MeetingRoomService;
import com.escapsule.thalitera.vo.MeetingRoomVO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("user")
@RequestMapping("/user/meetingroom")
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
     *
     * @param bookingDTO The DTO object containing the parameters for the meeting room.
     * @return List of suitable meeting rooms
     */
    @PostMapping("/filter")
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
     *
     * @param bookingDTO The DTO object containing the parameters for the meeting room.
     * @return Book result
     */
    @PostMapping("/booking")
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
     *
     * @param bookingDTO The DTO object containing the parameters for the meeting room.
     * @return Update result
     */
    @PostMapping("/update")
    public ApiResult<String> updateMeetingRoom(@RequestBody @Valid BookingDTO bookingDTO) {
        boolean success = meetingRoomService.updateBooking(bookingDTO);
        if (success) {
            return ApiResult.success("Update successful.");
        } else {
            return ApiResult.success("Update failed.");
        }
    }

    /**
     * Cancel a meeting room booking
     *
     * @param reservationId The ID of the reservation to be canceled.
     * @return Cancel result
     */
    @PostMapping("/cancel")
    public ApiResult<String> cancelMeetingRoom(@RequestBody @NotBlank String reservationId) {
        boolean success = meetingRoomService.cancelMeetingRoom(reservationId);
        if (success) {
            return ApiResult.success("Cancel successful.");
        } else {
            return ApiResult.success("Cancel failed.");
        }
    }
}
