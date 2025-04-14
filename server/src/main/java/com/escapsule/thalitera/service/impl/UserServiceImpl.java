package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.constant.UserStatusConstant;
import com.escapsule.thalitera.dto.ChangePasswordDTO;
import com.escapsule.thalitera.dto.ResetPasswordDTO;
import com.escapsule.thalitera.dto.UserLoginDTO;
import com.escapsule.thalitera.dto.UserRegisterDTO;
import com.escapsule.thalitera.entity.LoginHistory;
import com.escapsule.thalitera.entity.Reservation;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.event.ForgetPasswordVerifyEvent;
import com.escapsule.thalitera.event.RegisterVerifyEvent;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.json.DeviceFingerprint;
import com.escapsule.thalitera.json.RegisterVerifyContent;
import com.escapsule.thalitera.mapper.LoginHistoryMapper;
import com.escapsule.thalitera.mapper.MeetingRoomMapper;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.properties.ConfigProperties;
import com.escapsule.thalitera.service.LoginHistoryService;
import com.escapsule.thalitera.service.UserService;
import com.escapsule.thalitera.transfer.MeetingRoomTransfer;
import com.escapsule.thalitera.utils.GeometryUtils;
import com.escapsule.thalitera.utils.PasswordUtils;
import com.escapsule.thalitera.utils.UserAgentUtils;
import com.escapsule.thalitera.vo.CalendarVO;
import com.jthinking.common.util.ip.IPInfoUtils;
import com.pig4cloud.captcha.GifCaptcha;
import com.pig4cloud.captcha.base.Captcha;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.basjes.parse.useragent.UserAgent;
import org.locationtech.jts.geom.Point;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.*;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final RedisTemplate<String, String> redisTemplate;
    private final LoginHistoryMapper loginHistoryMapper;
    private final LoginHistoryService loginHistoryService;
    private final ApplicationEventPublisher eventPublisher;
    private final ConfigProperties configProperties;
    private final UserAgentUtils userAgentUtils;
    private final MeetingRoomMapper meetingRoomMapper;

    /**
     * Register user
     *
     * @param dto UserRegisterDTO include email and password
     */
    @Override
    @Transactional
    public void register(UserRegisterDTO dto) {
        User rawUser = userMapper.getUserByEmail(dto.getEmail());
        if (rawUser != null) throw new BaseException(ErrorCode.USER_EXIST);

        User user = User.builder()
                .userId(UUID.randomUUID())
                .email(dto.getEmail().toLowerCase())
                .username(dto.getEmail().substring(0, dto.getEmail().toLowerCase().indexOf("@")))
                .passwordHash(PasswordUtils.encode(dto.getPassword()))
                .build();

        userMapper.insert(user);

        log.info("Send email message initializing: {}", user.getEmail());

        RegisterVerifyContent content = new RegisterVerifyContent(user.getEmail(), configProperties.getBaseUrl());

        eventPublisher.publishEvent(
                new RegisterVerifyEvent(
                        this,
                        content
                )
        );

        storeVerificationToken(dto.getEmail(), content.getToken());
        log.info("User registering, status pending: {}", user.getEmail());
    }

    /**
     * Verify user email
     *
     * @param email user email
     * @param token User-provided Tokens
     */
    @Override
    @Transactional
    public void verifyEmail(String email, String token) {
        try {
            verifyEmailToken(email, token);
            userMapper.updateStatus(email, UserStatusConstant.ACTIVE);
            log.info("User verified successfully: {}", email);
        } catch (BaseException e) {
            log.error("Email verification failed for user: {}", email, e);
            throw new BaseException(ErrorCode.EMAIL_VERIFICATION_FAILED);
        }
    }

    /**
     * Login user
     *
     * @param dto       UserLoginDTO include email and password
     * @param ip        User IP
     * @param userAgent User Agent
     * @return User
     */
    @Override
    @Transactional
    public User login(UserLoginDTO dto,
                      String ip,
                      String userAgent) {

        // verify if user exist
        User user = userMapper.getUserByEmail(dto.getEmail());
        if (user == null) {
            log.error("User does not exist: {}", dto.getEmail());
            throw new BaseException(ErrorCode.USER_NOT_FOUND);
        }

        UserAgent ua = userAgentUtils.parse(userAgent);

        DeviceFingerprint df = DeviceFingerprint.builder()
                .browser(userAgentUtils.parseBrowser(ua))
                .os(userAgentUtils.parseOS(ua))
                .build();

        Point location = GeometryUtils.createPoint(
                IPInfoUtils.getIpInfo(ip).getLng(),
                IPInfoUtils.getIpInfo(ip).getLat()
        );

        // verify if user status active
        if (!user.getStatus().equals(UserStatusConstant.ACTIVE)) {
            log.error("User status is not active: {}", user.getEmail());
            logLoginAttempt(user, ip, df, location, false, ErrorCode.USER_NOT_ACTIVE);
            throw new BaseException(ErrorCode.USER_NOT_ACTIVE);
        }

        // verify if user password is correct
        if (!PasswordUtils.matches(dto.getPassword(), user.getPasswordHash())) {
            log.error("User password is incorrect: {}", user.getEmail());
            logLoginAttempt(user, ip, df, location, false, ErrorCode.USER_PASSWORD_INCORRECT);
            throw new BaseException(ErrorCode.USER_PASSWORD_INCORRECT);
        }

        logLoginAttempt(user, ip, df, location, true, null);

        return user;
    }

    /**
     * Get user's calendar
     *
     * @param userId user id
     * @return List of CalendarVO
     */
    @Override
    public List<CalendarVO> getUserCalendar(UUID userId) {
        List<Reservation> reservations = userMapper.getUserRelatedReservations(userId);
        return reservations.stream()
                .map(reservation -> CalendarVO.builder()
                        .startTime(reservation.getStartTime())
                        .endTime(reservation.getEndTime())
                        .meetingRoom(
                                MeetingRoomTransfer.INSTANCE.meetingRoom2MeetingRoomVO(
                                        meetingRoomMapper.getMeetingRoomByRoomId(reservation.getRoomId())
                                )
                        )
                        .build())
                .toList();
    }

    /**
     * Change user password
     *
     * @param user  User
     * @param dto   ChangePasswordDTO include old password and new password
     */
    @Override
    @Transactional
    public void changePassword(User user, ChangePasswordDTO dto) {
        if (!PasswordUtils.matches(dto.getOldPassword(), user.getPasswordHash())) {
            throw new BaseException(ErrorCode.USER_PASSWORD_INCORRECT);
        }

        if (PasswordUtils.matches(dto.getNewPassword(), user.getPasswordHash())) {
            throw new BaseException(ErrorCode.USER_NEW_PASSWORD_SAME_TO_OLD);
        }

        userMapper.updatePasswordHash(PasswordUtils.encode(dto.getNewPassword()), user.getEmail());

        log.info("User password changed successfully: {}", user.getEmail());
    }

    /**
     * Send password reset code
     *
     * @param email user email
     */
    @Override
    public void sendPasswordResetCode(String email) {
        User user = userMapper.getUserByEmail(email);
        if (user == null) throw new BaseException(ErrorCode.USER_NOT_FOUND);
        GifCaptcha captcha = (GifCaptcha) getCaptcha();

        log.info("Send password reset captcha code to: {}", email);

        eventPublisher.publishEvent(
                new ForgetPasswordVerifyEvent(
                        this,
                        captcha.toBase64(),
                        email
                )
        );

        storeForgetPasswordCaptcha(email, captcha.text());
    }

    /**
     * Verify password reset code
     *
     * @param dto ResetPasswordDTO include email, code and new password
     */
    @Override
    @Transactional
    public void verifyPasswordResetCode(ResetPasswordDTO dto) {
        verifyForgetPasswordCaptcha(dto.getEmail(), dto.getCode());

        if (PasswordUtils.matches(dto.getNewPassword(), userMapper.getUserByEmail(dto.getEmail()).getPasswordHash())) {
            throw new BaseException(ErrorCode.USER_NEW_PASSWORD_SAME_TO_OLD);
        }

        userMapper.updatePasswordHash(PasswordUtils.encode(dto.getNewPassword()), dto.getEmail());
        log.info("User password reset successfully: {}", dto.getEmail());
    }

    /**
     * Store forget password captcha
     *
     * @param email   user email
     * @param captcha captcha code
     */
    private void storeForgetPasswordCaptcha(String email, String captcha) {
        redisTemplate.opsForValue().set(email + ":captcha", captcha, 5, TimeUnit.MINUTES);
    }

    /**
     * Verify forget password captcha
     *
     * @param email   user email
     * @param captcha captcha code
     */
    private void verifyForgetPasswordCaptcha(String email, String captcha) {
        String storedCaptcha = redisTemplate.opsForValue().get(email + ":captcha");
        if (storedCaptcha == null) {
            throw new BaseException(ErrorCode.CAPTCHA_EXPIRED);
        }

        if (!captcha.equals(storedCaptcha)) {
            throw new BaseException(ErrorCode.CAPTCHA_INCORRECT);
        }

        redisTemplate.delete(email + ":captcha");
    }

    /**
     * Get captcha
     *
     * @return Captcha
     */
    private Captcha getCaptcha() {
        GifCaptcha captcha = new GifCaptcha(128, 48, 6);

        try {
            captcha.setCharType(Captcha.TYPE_DEFAULT);
            captcha.setFont(Captcha.FONT_7);
        } catch (IOException | FontFormatException e) {
            throw new BaseException(ErrorCode.CAPTCHA_GENERATION_FAILED);
        }

        return captcha;
    }

    /**
     * Store mailboxes and tokens to Redis and set expiration time to 5 minutes
     *
     * @param email user email
     * @param token Validation Token
     */
    private void storeVerificationToken(String email, String token) {
        redisTemplate.opsForValue().set(email + ":token", token, 5, TimeUnit.MINUTES);
    }

    /**
     * Verify the mailbox token, delete the key-value pair in Redis after successful verification
     *
     * @param email user email
     * @param token User-provided Tokens
     */
    private void verifyEmailToken(String email, String token) {
        String storedToken = redisTemplate.opsForValue().get(email + ":token");

        if (storedToken == null) {
            log.error("The mailbox does not exist or the token has expired: {}", email);
            throw new BaseException(ErrorCode.USER_EMAIL_OR_TOKEN_INVALID);
        }

        if (!storedToken.equals(token)) {
            log.error("Token mismatch, user provided: {}, expect: {}", token, storedToken);
            throw new BaseException(ErrorCode.USER_TOKEN_MISMATCH);
        }

        redisTemplate.delete(email + ":token");
    }

    /**
     * Log login attempts
     *
     * @param user          User
     * @param ip            IP Address
     * @param df            Device Fingerprint
     * @param location      Location
     * @param success       Success
     * @param errorCode     Error Code
     */
    private void logLoginAttempt(@Nullable User user,
                                 String ip,
                                 DeviceFingerprint df,
                                 Point location,
                                 boolean success,
                                 @Nullable ErrorCode errorCode) {
        LoginHistory history = LoginHistory.builder()
                .userId(user != null ? user.getUserId() : null)
                .ipAddress(ip)
                .deviceFingerprint(df)
                .success(success)
                .failureReason(errorCode != null ? errorCode.getMessage() : null)
                .location(location)
                .build();

        if (success) {
            loginHistoryMapper.insert(history);
        } else {
            loginHistoryService.addFailedAttempt(history);
        }
    }
}
