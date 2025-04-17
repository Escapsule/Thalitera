package com.escapsule.thalitera.controller.user;

import com.escapsule.thalitera.dto.*;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.response.ApiResult;
import com.escapsule.thalitera.service.UserService;
import com.escapsule.thalitera.utils.IpUtils;
import com.escapsule.thalitera.vo.CalendarVO;
import com.escapsule.thalitera.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * UserController is a REST controller responsible for handling user-related operations.
 * It provides endpoints for user login, registration, querying user details, and disabling users.
 */
@RestController
@RequestMapping("/user")
@Slf4j
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Handles user login requests.
     * <p>
     * This interface allows users to log in to the system by providing an email address and password
     * After successful login, user information is stored in the session and a success response is returned
     *
     * @param dto       The email address and password provided by the user for login.
     * @param httpRequest The HTTP request object used to retrieve the client's IP address.
     * @param userAgent The user agent string of the client's browser.
     * @return Returns the result of the login operation.
     */
    @Operation(summary = "User login",
            description = "The user provides the email address and password for login.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User logged in successfully"),
            @ApiResponse(responseCode = "2001", description = "User does not exist."),
            @ApiResponse(responseCode = "2007", description = "User not active."),
            @ApiResponse(responseCode = "2008", description = "User password incorrect."),
            @ApiResponse(responseCode = "2009", description = "User ip address invalid."),
            @ApiResponse(responseCode = "2010", description = "User agent invalid."),
    })
    @PostMapping("/login")
    public ApiResult<?> login (@RequestBody UserLoginDTO dto,
                               @RequestHeader("User-Agent") String userAgent,
                               @RequestHeader("THALITERA_FINGERPRINT")String fingerprint,
                               HttpServletRequest httpRequest) {
        log.info("User login: {}", dto.getEmail());
        String ip = IpUtils.getClientIp(httpRequest);

        try {
            User user = userService.login(dto, ip, userAgent, fingerprint);

            HttpSession session = httpRequest.getSession(true);
            session.setAttribute("user", user);

            log.info("User login success: {}", dto.getEmail());
            return ApiResult.success();
        } catch (BaseException e) {
            log.warn("Login failed: {}", dto.getEmail());
            return ApiResult.error(ErrorCode.LOGIN_FAILED.getCode(), e.getMessage());
        }

    }

    /**
     * Handles user mfa setup requests.
     *
     * @param email The user's email address, used for identity verification
     * @return Returns the result of the mfa setup operation
     */
    @Operation(summary = "User mfa setup",
            description = "The user provides the email address and password for registration.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User mfa setup successfully"),
            @ApiResponse(responseCode = "2002", description = "User not exist."),
            @ApiResponse(responseCode = "2604", description = "TOTP QR code generation failed."),
    })
    @GetMapping("/mfa/setup")
    public ApiResult<MfaSetupDTO> mfaSetup(String email) {
        MfaSetupDTO dto = userService.mfaSetup(email);
        return ApiResult.success(dto);
    }

    /**
     * Handles user mfa enable requests.
     *
     * @param dto The email address and password provided by the user for registration.
     * @return Returns the result of the mfa enable operation
     */
    @Operation(summary = "User mfa enable",
            description = "The user provides the email address and password for registration.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User mfa enable successfully"),
            @ApiResponse(responseCode = "2002", description = "User not exist."),
            @ApiResponse(responseCode = "2605", description = "MFA code incorrect."),
    })
    @PostMapping("/mfa/enable")
    public ApiResult<String> enableMfa(@RequestBody MfaEnableDTO dto,
                                       @RequestHeader("User-Agent") String userAgent,
                                       @RequestHeader("THALITERA_FINGERPRINT")String fingerprint,
                                       HttpServletRequest httpRequest) {
        String ip = IpUtils.getClientIp(httpRequest);
        userService.enableMfa(dto.getEmail(), dto.getTotpCode(), userAgent, fingerprint, ip);
        return ApiResult.success();
    }

    /**
     * TODO: Prod need to delete
     * Handles user mfa rollback requests.
     *
     * @param email The user's email address, used for identity verification
     * @return Returns the result of the mfa rollback operation
     */
    @GetMapping("/mfa/rollback")
    public ApiResult<?> rollbackToNoMfa(String email) {
        userService.rollbackToNoMfa(email);
        return ApiResult.success();
    }

    /**
     * Handles user registration requests.
     *
     * @param dto The email address and password provided by the user for registration.
     * @return Returns the result of the registration.
     */
    @Operation(summary = "User register",
            description = "The user provides the email address and password for registration.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User registered successfully"),
            @ApiResponse(responseCode = "2003", description = "User exist."),
            @ApiResponse(responseCode = "2402", description = "Email error."),
    })
    @PostMapping("/register")
    public ApiResult<?> register(@RequestBody UserRegisterDTO dto) {
        userService.register(dto);
        return ApiResult.success();
    }

    /**
     * User verification interface
     * <p>
     * This interface is used for users to verify their identity by providing an email address and token
     *
     * @param email The user's email address, used for identity verification
     * @param token The verification token, used to ensure the legitimacy of the email
     * @return Returns the result of the verification operation
     */
    @Operation(summary = "User verify",
            description = "The user provides the email address and token for verification.")

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User verified successfully"),
            @ApiResponse(responseCode = "2004", description = "User email error or token expired."),
            @ApiResponse(responseCode = "2006", description = "User register failed, please try again."),
    })
    @GetMapping("/verify")
    public ApiResult<?> verifyEmail(@RequestParam String email,
                                    @RequestParam String token) {
        userService.verifyEmail(email, token);
        return ApiResult.success();
    }

    /**
     * Check user auth
     *
     * @param request The HTTP request object used to get the user's information.
     * @return Returns the result of the login operation.
     */
    @Operation(summary = "Check user auth",
            description = "Check user auth.")
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
     * Get user info
     *
     * @param session The HTTP session object used to store the user's information.
     * @return Returns the result of the login operation.
     */
    @Operation(summary = "User info",
            description = "Get user info.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User info"),
            @ApiResponse(responseCode = "2011", description = "User not login"),
    })
    @GetMapping("/info")
    public ApiResult<?> getUserInfo(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) throw new BaseException(ErrorCode.USER_NOT_LOGIN);
        UserVO vo = UserVO.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .status(user.getStatus())
                .build();
        log.info("User check info: {}", vo.getEmail());
        return ApiResult.success(vo);
    }

    /**
     * Get user's calendar
     *
     * @param session The HTTP session object used to store the user's information.
     * @return Returns the result of the user's calendar.
     */
    @Operation(summary = "User calendar",
            description = "Get user calendar.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User calendar"),
            @ApiResponse(responseCode = "2011", description = "User not login"),
    })
    @GetMapping("/calendar")
    public ApiResult<List<CalendarVO>> getUserCalendar(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) throw new BaseException(ErrorCode.USER_NOT_LOGIN);
        List<CalendarVO> calendar = userService.getUserCalendar(user.getUserId());
        return ApiResult.success(calendar);
    }

    /**
     * Handles the user password change request.
     * <p>
     * This method accepts only POST requests,
     * where the user provides the current password and new password for changing.
     *
     * @param dto A DTO object containing the user's current password and new password.
     * @param session The current user session, used to retrieve user information.
     * @return Returns an ApiResult object indicating the result of the password change operation.
     * @throws BaseException If the user is not logged in, this exception is thrown.
     */
    @Operation(summary = "User change password",
            description = "User change password.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User change password successfully"),
            @ApiResponse(responseCode = "2011", description = "User not login"),
            @ApiResponse(responseCode = "2008", description = "User password incorrect."),
            @ApiResponse(responseCode = "2013", description = "New password cannot be the same as the old password.")
    })
    @PostMapping("/change-password")
    public ApiResult<?> changePassword (@RequestBody ChangePasswordDTO dto, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) throw new BaseException(ErrorCode.USER_NOT_LOGIN);
        log.info("User changing password: {}", user.getEmail());
        userService.changePassword(user, dto);
        session.invalidate();
        return ApiResult.success();
    }


    /**
     * Handles the user password forgetting process.
     * <p>
     * When a user forgets their password, they can request a password reset email through this interface.
     * Security: This interface is public, but the email must be valid and registered in the system.
     * Limitations: None.
     *
     * @param email The user's email, used to send the password reset code.
     * @return Returns the result of the operation.
     */
    @Operation(summary = "User forget password",
            description = "User forget password.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User forget password successfully"),
            @ApiResponse(responseCode = "2402", description = "Email error."),
    })
    @PostMapping("/forget-password/request")
    public ApiResult<?> forgetPassword(@RequestParam String email) {
        userService.sendPasswordResetCode(email);
        return ApiResult.success();
    }

    /**
     * Handles password reset requests for users who have forgotten their passwords.
     * <p>
     * This endpoint verifies the user's password reset code and resets the password if the verification is successful.
     *
     * @param dto The password reset request data, containing the necessary information for password reset.
     * @return Returns the result of the password reset operation.
     */
    @Operation(summary = "User forget password",
            description = "User forget password.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User forget password successfully"),
            @ApiResponse(responseCode = "2013", description = "New password cannot be the same as the old password."),
            @ApiResponse(responseCode = "2602", description = "Captcha expired."),
            @ApiResponse(responseCode = "2603", description = "Captcha incorrect."),
    })
    @PostMapping("/forget-password/reset")
    public ApiResult<?> resetPassword(@RequestBody ResetPasswordDTO dto) {
        userService.verifyPasswordResetCode(dto);
        return ApiResult.success();
    }

    /**
     * Handles user logout requests.
     * <p>
     * This endpoint invalidates the user's session and logs them out of the system.
     *
     * @param session The user's session, used to invalidate the session and log them out.
     * @return Returns the result of the logout operation.
     */
    @Operation(summary = "User logout",
            description = "User logout.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User logout successfully"),
    })
    @GetMapping("/logout")
    public ApiResult<?> logout(HttpSession session) {
        session.invalidate();
        log.info("User logout: {}", session.getId());
        return ApiResult.success();
    }
}
