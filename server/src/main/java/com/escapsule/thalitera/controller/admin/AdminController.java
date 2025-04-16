package com.escapsule.thalitera.controller.admin;

import com.escapsule.thalitera.constant.UserStatusConstant;
import com.escapsule.thalitera.dto.UserEditDTO;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.response.ApiResult;
import com.escapsule.thalitera.service.AdminService;
import com.escapsule.thalitera.service.ReservationService;
import com.escapsule.thalitera.vo.ReservationVO;
import com.escapsule.thalitera.vo.UserVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
@Slf4j
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ReservationService reservationService;

    /**
     * Get all users
     *
     * @return List of users
     */
    @GetMapping("/users")
    public ApiResult<List<UserVO>> getAllUsers() {
        log.info("Get all users...");
        return ApiResult.success(adminService.getAllUsers());
    }

    /**
     * Edit user information
     *
     * @param userEditDTO UserEditDTO object containing user information
     * @return ApiResult with success message
     */
    @PostMapping("/edit")
    public ApiResult<String> editUser(@RequestBody @Valid UserEditDTO userEditDTO) {
        String status = userEditDTO.getStatus();
        if (!isValidStatus(status)) {
            throw new BaseException(ErrorCode.INVALID_STATUS);
        }
        boolean success = adminService.editUser(userEditDTO);
        log.info("Edit user {}, status: {}", userEditDTO.getUserId(), status);
        if (success) {
            return ApiResult.success("Edit successful.");
        } else {
            return ApiResult.success("Edit failed.");
        }
    }

    /**
     * Check if the target user status passed for editing is valid
     *
     * @param status The status to check
     * @return true if the status is "active", "disabled", or "locked"; false otherwise
     */
    private boolean isValidStatus(String status) {
        return status.equals(UserStatusConstant.ACTIVE) ||
               status.equals(UserStatusConstant.DISABLED) ||
               status.equals(UserStatusConstant.LOCKED);
    }

    /**
     * Get all reservations
     *
     * @return List of reservationVO
     */
    @GetMapping("/reservations")
    private ApiResult<List<ReservationVO>> getAllReservations() {
        return ApiResult.success(reservationService.getAllReservations());
    }
}
