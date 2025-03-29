package com.escapsule.thalitera.controller.user;

import com.escapsule.thalitera.dto.UserLoginDTO;
import com.escapsule.thalitera.dto.UserRegisterDTO;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.response.ApiResult;
import com.escapsule.thalitera.service.UserService;
import com.escapsule.thalitera.utils.IpUtils;
import com.escapsule.thalitera.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * UserController is a REST controller responsible for handling user-related operations.
 * It provides endpoints for user login, registration, querying user details, and disabling users.
 */
@RestController
@RequestMapping("/user")
@Slf4j
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Handles user login requests.
     * <p>
     * This interface allows users to log in to the system by providing an email address and password
     * After successful login, user information is stored in the session and a success response is returned
     *
     * @param dto       The email address and password provided by the user for login.
     * @param httpRequest The HTTP request object used to retrieve the client's IP address.
     * @param session   The HTTP session object used to store the user's information.
     * @param userAgent The user agent string of the client's browser.
     * @return Returns the result of the login operation.
     */
    @Operation(summary = "User login",
            description = "The user provides the email address and password for login.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User logged in successfully"),
            @ApiResponse(responseCode = "2001", description = "User does not exist."),
            @ApiResponse(responseCode = "2008", description = "User not active."),
            @ApiResponse(responseCode = "2009", description = "User password incorrect."),
            @ApiResponse(responseCode = "2010", description = "User ip address invalid."),
            @ApiResponse(responseCode = "2011", description = "User agent invalid."),
    })
    @PostMapping("/login")
    public ApiResult<?> login (@RequestBody UserLoginDTO dto,
                               @RequestHeader("User-Agent") String userAgent,
                               HttpServletRequest httpRequest,
                               HttpSession session) {
        log.info("User login: {}", dto.getEmail());
        String ip = IpUtils.getClientIp(httpRequest);
        User user = userService.login(dto, ip, userAgent);
        session.setAttribute("user", user);
        log.info("User login success: {}", dto.getEmail());
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
            @ApiResponse(responseCode = "2002", description = "Email error."),
            @ApiResponse(responseCode = "2004", description = "User exist."),
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
            @ApiResponse(responseCode = "2005", description = "User email error or token expired."),
            @ApiResponse(responseCode = "2007", description = "User register failed, please try again."),
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
     * @param session The HTTP session object used to store the user's information.
     * @return Returns the result of the login operation.
     */
    @Operation(summary = "Check user auth",
            description = "Check user auth.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User verified successfully"),
            @ApiResponse(responseCode = "2012", description = "User not login"),
    })
    @GetMapping("/check-auth")
    public ApiResult<?> checkAuth(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if ( user == null) throw new BaseException(ErrorCode.USER_NOT_LOGIN);
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
            @ApiResponse(responseCode = "2012", description = "User not login"),
    })
    @GetMapping("/info")
    public ApiResult<?> getUserInfo(HttpSession session) {
        User user = (User) session.getAttribute("user");
        UserVO vo = UserVO.builder()
                .email(user.getEmail())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .build();
        if ( user == null) throw new BaseException(ErrorCode.USER_NOT_LOGIN);
        log.info("User check info: {}", vo.getEmail());
        return ApiResult.success(vo);
    }


    // user queries
    // disabling of users
}
