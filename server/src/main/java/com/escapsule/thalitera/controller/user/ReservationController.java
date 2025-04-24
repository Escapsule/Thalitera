package com.escapsule.thalitera.controller.user;

import com.escapsule.thalitera.dto.ReservationDTO;
import com.escapsule.thalitera.dto.TimeRangeDTO;
import com.escapsule.thalitera.dto.TimeRangeQueryDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.service.ReservationService;
import com.escapsule.thalitera.transfer.MeetingRoomTransfer;
import com.escapsule.thalitera.response.ApiResult;
import com.escapsule.thalitera.vo.MeetingRoomVO;
import com.escapsule.thalitera.vo.ReservationVO;
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
@RequestMapping("/user/meetingroom")
@Slf4j
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * Get all meeting rooms
     *
     * @return List of meeting rooms
     */
    @GetMapping("/all")
    public ApiResult<List<MeetingRoomVO>> getAllActiveMeetingRooms() {
        List<MeetingRoom> meetingRooms = reservationService.getAllActiveMeetingRooms();
        log.info("Get all active meeting rooms: {}", meetingRooms);
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
     * @param reservationDTO The DTO object containing the parameters for the meeting room.
     * @return List of suitable meeting rooms
     */
    @PostMapping("/filter")
    public ApiResult<List<MeetingRoomVO>> getMeetingRoomByFilter(@RequestBody @Valid ReservationDTO reservationDTO) {
        List<MeetingRoom> suitableMeetingRooms = reservationService.getMeetingRoom(reservationDTO);
        log.info("Get meeting rooms by filter: {}", suitableMeetingRooms);
        return ApiResult.success(
                suitableMeetingRooms
                        .stream()
                        .map(MeetingRoomTransfer.INSTANCE::meetingRoom2MeetingRoomVO)
                        .toList()
        );
    }

    /**
     * Get reserved time ranges for a specific meeting room
     *
     * @param dto The DTO object containing the parameters for the query of reserved time ranges.
     * @return List of all reserved time ranges
     */
    @PostMapping("/reserved-time-ranges")
    public ApiResult<List<TimeRangeDTO>> getMeetingRoomUnavailableTime(@RequestBody TimeRangeQueryDTO dto) {
        log.info("Get reserved time ranges for room: {}, date: {}", dto.getRoomId(), dto.getDateTime().toLocalDate());
        return ApiResult.success(reservationService.getMeetingRoomReservedTime(dto.getRoomId(), dto.getDateTime()));
    }

    /**
     * Book a meeting room
     *
     * @param reservationDTO The DTO object containing the parameters for the meeting room.
     * @param session The HTTP session object.
     * @return Book result
     */
    @PostMapping("/booking")
    public ApiResult<String> makeReservation(@RequestBody @Valid ReservationDTO reservationDTO,
                                             HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new BaseException(ErrorCode.USER_NOT_LOGIN);
        }
        boolean success = reservationService.makeReservation(reservationDTO, user.getUserId());
        log.info("User {} booked a meeting room: {}", user.getUserId(), reservationDTO);
        if (success) {
            return ApiResult.success("Booking successful.");
        } else {
            return ApiResult.success("Booking failed.");
        }
    }

    /**
     * Update a meeting room booking
     *
     * @param reservationDTO The DTO object containing the parameters for the meeting room.
     * @param session The HTTP session object.
     * @return Update result
     */
    @PostMapping("/update")
    public ApiResult<String> updateReservation(@RequestBody @Valid ReservationDTO reservationDTO,
                                               HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new BaseException(ErrorCode.USER_NOT_LOGIN);
        }
        boolean success = reservationService.updateReservation(reservationDTO, user.getUserId());
        log.info("User {} updated a meeting room booking: {}", user.getUserId(), reservationDTO);
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
     * @param session The HTTP session object.
     * @return Cancel result
     */
    @PostMapping("/cancel")
    public ApiResult<String> cancelReservation(@RequestBody UUID reservationId,
                                               HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new BaseException(ErrorCode.USER_NOT_LOGIN);
        }
        boolean success = reservationService.cancelReservation(reservationId, user.getUserId());
        log.info("User {} canceled a meeting room booking: {}", user.getUserId(), reservationId);
        if (success) {
            return ApiResult.success("Cancel successful.");
        } else {
            return ApiResult.success("Cancel failed.");
        }
    }

    /**
     * View user related reservations
     *
     * @param session The HTTP session object.
     * @return List of reservations
     */
    @GetMapping("/reservations")
    public ApiResult<List<ReservationVO>> getMyReservations(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new BaseException(ErrorCode.USER_NOT_LOGIN);
        }
        log.info("Get reservations for user: {}", user.getUserId());
        List<ReservationVO> myReservations = reservationService.getMyReservations(user.getUserId());
        return ApiResult.success(myReservations);
    }
}
