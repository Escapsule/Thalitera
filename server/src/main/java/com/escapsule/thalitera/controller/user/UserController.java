package com.escapsule.thalitera.controller.user;

import com.escapsule.thalitera.dto.UserRegisterDTO;
import com.escapsule.thalitera.response.ApiResult;
import com.escapsule.thalitera.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.web.bind.annotation.*;

/**
 * UserController is a REST controller responsible for handling user-related operations.
 * It provides endpoints for user login, registration, querying user details, and disabling users.
 */
@RestController
@RequestMapping("/user")
public class UserController {

    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // user login

    /**
     * Handles user registration requests.
     *
     * @param email The email address provided by the user for registration.
     * @param password The password provided by the user for registration.
     * @return Returns the result of the registration.
     * <p>
     * Explanation:
     * This method is annotated with @PostMapping, indicating that it handles POST requests to the /register path.
     * The @Operation and @ApiResponse annotations provide documentation for the API, describing the purpose of the interface and the expected response.
     * The method calls userService.register to perform the specific registration logic, which is not detailed here.
     * Finally, it returns a registration success message using ApiResult.success.
     */
    @Operation(summary = "User register",
            description = "The user provides the email address and password for registration.")
    @ApiResponse(responseCode = "200", description = "User registered successfully")
    @PostMapping("/register")
    public ApiResult register(@RequestBody UserRegisterDTO dto) {
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
    @ApiResponse(responseCode = "200", description = "User verified successfully")
    @GetMapping("/verify")
    public ApiResult verifyEmail(@RequestParam String email,
                                  @RequestParam String token) {
        userService.verifyEmail(email, token);
        return ApiResult.success();
    }
    // user queries
    // disabling of users
}
