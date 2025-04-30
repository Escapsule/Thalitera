package com.escapsule.thalitera.controller.admin;


import com.escapsule.thalitera.constant.UserStatusConstant;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.response.ApiResult;
import com.escapsule.thalitera.service.ReservationService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController("AdminReservationController")
@RequestMapping("/admin/reservation")
@Slf4j
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * Cancel a reservation
     *
     * @param reservationId The ID of the reservation to cancel.
     * @param session       The HTTP session.
     * @return ApiResult with success message
     */
    @PostMapping("/cancel")
    public ApiResult<String> cancelReservation(@RequestBody UUID reservationId,
                                               HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new BaseException(ErrorCode.USER_NOT_LOGIN);
        }
        if (!user.getStatus().equals(UserStatusConstant.ADMIN)) {
            throw new BaseException(ErrorCode.USER_NOT_ADMIN);
        }
        boolean success = reservationService.cancelReservation(reservationId, user);
        log.info("Admin {} canceled a meeting room booking: {}", user.getUsername(), reservationId);
        if (success) {
            return ApiResult.success("Cancel successful.");
        } else {
            return ApiResult.success("Cancel failed.");
        }
    }
}
