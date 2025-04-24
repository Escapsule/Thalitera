package com.escapsule.thalitera.controller.admin;

import com.escapsule.thalitera.constant.UserStatusConstant;
import com.escapsule.thalitera.dto.UserEditDTO;
import com.escapsule.thalitera.dto.UserLoginDTO;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.response.ApiResult;
import com.escapsule.thalitera.service.AdminService;
import com.escapsule.thalitera.service.ReservationService;
import com.escapsule.thalitera.utils.IpUtils;
import com.escapsule.thalitera.vo.ReservationVO;
import com.escapsule.thalitera.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@Slf4j
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ReservationService reservationService;

    /**
     * Admin login
     *
     * @param dto          UserLoginDTO object containing user login information
     * @param userAgent    User-Agent header
     * @param fingerprint  thalitera_fingerprint header
     * @param httpRequest  HttpServletRequest object
     * @return ApiResult with success message
     */
    @PostMapping("/login")
    @Operation(summary = "Admin login",
            description = "Admin login with email and password.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login success"),
            @ApiResponse(responseCode = "2001", description = "User does not exist."),
            @ApiResponse(responseCode = "2017", description = "User is not admin."),
            @ApiResponse(responseCode = "2002", description = "Invalid encoded password."),

    })
    public ApiResult<?> login(@RequestBody UserLoginDTO dto,
                              @RequestHeader("User-Agent") String userAgent,
                              @RequestHeader("thalitera_fingerprint") String fingerprint,
                              HttpServletRequest httpRequest) {
        log.info("Admin login: {}", dto.getEmail());
        String ip = IpUtils.getClientIp(httpRequest);

        User user = adminService.login(dto, ip, userAgent, fingerprint);

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute("user", user);

        log.info("Admin login success: {}", dto.getEmail());
        return ApiResult.success();
    }


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
    public ApiResult<List<ReservationVO>> getAllReservations() {
        return ApiResult.success(reservationService.getAllReservations());
    }

    /**
     * Confirm operation with password
     *
     * @param password The password to confirm the operation
     * @param session  The HTTP session object
     * @return ApiResult with success message
     */
    @PostMapping("/operation-confirm")
    public ApiResult<String> operationConfirm(@RequestBody String password,
                                              HttpSession session) {
        log.info("Operation confirm with password: {}", password);
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new BaseException(ErrorCode.USER_NOT_LOGIN);
        }
        boolean success = adminService.operationConfirm(user.getPasswordHash(), password);
        if (success) {
            return ApiResult.success("Operation confirmed.");
        } else {
            return ApiResult.success("Operation failed.");
        }
    }

    /**
     * Check admin authentication
     *
     * @param request The HTTP request object
     * @return ApiResult with success message
     */
    @Operation(summary = "Check admin auth",
            description = "Check admin auth.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User verified successfully"),
            @ApiResponse(responseCode = "2011", description = "User not login"),
    })
    @GetMapping("/check-auth")
    public ApiResult<?> checkAuth(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) throw new BaseException(ErrorCode.USER_NOT_LOGIN);

        User user = (User) session.getAttribute("user");
        if (user == null) throw new BaseException(ErrorCode.USER_NOT_LOGIN);

        log.info("user {} still logged in", user.getEmail());
        return ApiResult.success(true);
    }

    /**
     * Admin logout
     *
     * @param session The HTTP session object
     * @return ApiResult with success message
     */
    @Operation(summary = "Admin logout",
            description = "Admin logout.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Admin logout successfully"),
    })
    @GetMapping("/logout")
    public ApiResult<?> logout(HttpSession session) {
        session.invalidate();
        log.info("User logout: {}", session.getId());
        return ApiResult.success();
    }
}
