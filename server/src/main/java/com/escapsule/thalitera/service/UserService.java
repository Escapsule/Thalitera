package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.*;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.vo.CalendarVO;

import java.util.List;
import java.util.UUID;

public interface UserService {

    /**
     * Register user
     *
     * @param dto UserRegisterDTO include email and password
     */
    void register(UserRegisterDTO dto);

    /**
     * Verify user email
     *
     * @param email user email
     * @param token user token
     */
    void verifyEmail(String email, String token);

    /**
     * Login user
     *
     * @param dto UserLoginDTO include email and password
     * @param ip  user ip
     * @param userAgent user agent
     * @param fingerprint user fingerprint
     * @return User
     */
    User login(UserLoginDTO dto, String ip, String userAgent, String fingerprint);

    /**
     * Get user's calendar
     *
     * @param userId user id
     * @return List of CalendarVO
     */
    List<CalendarVO> getUserCalendar(UUID userId);

    /**
     * Change user password
     *
     * @param user User
     * @param dto ChangePasswordDTO include old password and new password
     */
    void changePassword(User user, ChangePasswordDTO dto);

    /**
     * Send password reset code to user email
     *
     * @param email user email
     */
    void sendPasswordResetCode(String email);

    /**
     * Verify password reset code
     *
     * @param dto ResetPasswordDTO include email, code and new password
     */
    void verifyPasswordResetCode(ResetPasswordDTO dto);

    /**
     * Get user info
     *
     * @param email user email
     * @return qr code (base64 / png)
     */
    MfaSetupDTO mfaSetup(String email);

    /**
     * Enable user mfa
     *
     * @param email user email
     * @param totpCode user totp code
     */
    void enableMfa(String email, String totpCode);

    void rollbackToNoMfa(String email);
}
