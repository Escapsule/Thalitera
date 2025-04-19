package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.*;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.vo.CalendarVO;
import com.escapsule.thalitera.vo.LoginHistoryVO;
import com.escapsule.thalitera.vo.TrustDeviceVO;
import com.escapsule.thalitera.vo.UserVO;

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
     * @param userAgent user agent
     * @param fingerprint user fingerprint
     * @param ip user ip
     */
    void enableMfa(String email, String totpCode, String userAgent, String fingerprint, String ip);

    /**
     * TODO: Prod need to delete
     * Rollback user mfa
     *
     * @param email user email
     */
    void rollbackToNoMfa(String email);

    /**
     * Get user trust device
     *
     * @param userId user id
     * @return List of TrustDeviceVO
     */
    List<TrustDeviceVO> getTrustDevice(UUID userId);

    /**
     * Delete user trust device
     *
     * @param userId user id
     * @param fingerprint user fingerprint
     * @return User
     */
    User deleteTrustDevice(UUID userId, String fingerprint);

    /**
     * Update user info
     *
     * @param userId user id
     * @param username user username
     * @return user vo info
     */
    UserVO updateUserInfo(UUID userId, String username);
}
