package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.constant.UserStatusConstant;
import com.escapsule.thalitera.dto.*;
import com.escapsule.thalitera.entity.LoginHistory;
import com.escapsule.thalitera.entity.MfaRecoveryCode;
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
import com.escapsule.thalitera.mapper.MfaRecoveryCodeMapper;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.properties.ConfigProperties;
import com.escapsule.thalitera.service.LoginHistoryService;
import com.escapsule.thalitera.service.UserService;
import com.escapsule.thalitera.transfer.MeetingRoomTransfer;
import com.escapsule.thalitera.utils.GeometryUtils;
import com.escapsule.thalitera.utils.PasswordUtils;
import com.escapsule.thalitera.utils.TotpUtils;
import com.escapsule.thalitera.utils.UserAgentUtils;
import com.escapsule.thalitera.vo.CalendarVO;
import com.escapsule.thalitera.vo.TrustDeviceVO;
import com.jthinking.common.util.ip.IPInfoUtils;
import com.pig4cloud.captcha.GifCaptcha;
import com.pig4cloud.captcha.base.Captcha;
import dev.samstevens.totp.exceptions.QrGenerationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.basjes.parse.useragent.UserAgent;
import org.locationtech.jts.geom.Point;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.FontFormatException;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final RedisTemplate<String, String> redisTemplate;
    private final RedisTemplate<String, List<String>> redisTemplateList;
    private final LoginHistoryMapper loginHistoryMapper;
    private final LoginHistoryService loginHistoryService;
    private final ApplicationEventPublisher eventPublisher;
    private final ConfigProperties configProperties;
    private final UserAgentUtils userAgentUtils;
    private final MeetingRoomMapper meetingRoomMapper;
    private final MfaRecoveryCodeMapper mfaRecoveryCodeMapper;

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

        RegisterVerifyContent content = new RegisterVerifyContent(
                user.getEmail(),
                configProperties.getBaseUrl(),
                user.getUserId()
        );

        eventPublisher.publishEvent(
                new RegisterVerifyEvent(
                        this,
                        content
                )
        );

        storeVerificationToken(dto.getEmail().toLowerCase(), content.getToken());
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
     * @param fingerprint User fingerprint
     * @return User
     */
    @Override
    @Transactional
    public User login(UserLoginDTO dto,
                      String ip,
                      String userAgent,
                      String fingerprint) {

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
                .print(fingerprint)
                .ip(ip)
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

        // verify if user has MFA enabled
        if (!user.isMfaEnable()) {
            log.error("User does not have MFA enabled: {}", dto.getEmail());
            logLoginAttempt(user, ip, df, location, false, ErrorCode.USER_NOT_MFA);
            throw new BaseException(ErrorCode.USER_NOT_MFA);
        }

        if (isNewDevice(user, df)) {
            if (dto.getTotpCode() == null && dto.getRecoveryCode() == null) {
                log.warn("User has new device: {}, please add the MFA code or Recovery code", dto.getEmail());
                logLoginAttempt(user, ip, df, location, false, ErrorCode.USER_HAS_NEW_DEVICE);
                throw new BaseException(ErrorCode.USER_HAS_NEW_DEVICE);
            }
            verifyMfaOrRecovery(user, dto.getTotpCode(), dto.getRecoveryCode(), df, location);
            addTrustedDevice(user, df);
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
                        user.getUserId()
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
     * MFA setup
     *
     * @param email user email
     * @return QR code (Base64 / png)
     */
    @Override
    @Transactional
    public MfaSetupDTO mfaSetup(String email) {
        User user = userMapper.getUserByEmail(email);
        if (user == null) {
            throw new BaseException(ErrorCode.USER_NOT_FOUND);
        }

        // get random TOTP secret
        String secret = TotpUtils.generateSecret();
        String qrcode;
        try {
            qrcode = TotpUtils.getQrCode(
                    configProperties.getProjectName(),
                    user.getEmail(),
                    secret
            );
        } catch (QrGenerationException e) {
            throw new BaseException(ErrorCode.TOTP_QR_CODE_GENERATION_FAILED);
        }


        List<String> plainCodes = TotpUtils.generateRecoveryCodes(5);

        // save secret to redis
        redisTemplate.opsForValue().set(
                "mfa_secret:" + user.getUserId(),
                secret,
                8,
                TimeUnit.MINUTES
        );

        redisTemplateList.opsForValue().set(
                "mfa_recovery_codes:" + user.getUserId(),
                plainCodes,
                8,
                TimeUnit.MINUTES
        );

        return MfaSetupDTO.builder()
                .qrCode(qrcode)
                .recoveryCodes(plainCodes)
                .build();
    }

    /**
     * Enable MFA
     *
     * @param email   user email
     * @param totpCode TOTP code
     */
    @Override
    @Transactional
    public void enableMfa(String email, String totpCode, String userAgent, String fingerprint, String ip) {
        User user = userMapper.getUserByEmail(email);
        if (user == null) {
            throw new BaseException(ErrorCode.USER_NOT_FOUND);
        }

        String secret = redisTemplate.opsForValue().get("mfa_secret:" + user.getUserId());
        if (secret == null) {
            throw new BaseException(ErrorCode.TOTP_SECRET_NOT_FOUND);
        }

        if (!TotpUtils.verifyCode(secret, totpCode)) {
            log.error("TOTP code is incorrect: {}", totpCode);
            throw new BaseException(ErrorCode.TOTP_CODE_INCORRECT);
        }

        List<String> plainCodes = redisTemplateList.opsForValue().get("mfa_recovery_codes:" + user.getUserId());
        if (plainCodes == null) {
            throw new BaseException(ErrorCode.TOTP_RECOVERY_CODES_NOT_FOUND);
        }

        userMapper.updateMfaSecret(user.getUserId(), true, secret);
        mfaRecoveryCodeMapper.insertBatch(
                TotpUtils.hashCodes(plainCodes),
                user.getUserId()
        );

        UserAgent ua = userAgentUtils.parse(userAgent);

        DeviceFingerprint df = DeviceFingerprint.builder()
                .browser(userAgentUtils.parseBrowser(ua))
                .os(userAgentUtils.parseOS(ua))
                .print(fingerprint)
                .ip(ip)
                .build();

        addTrustedDevice(user, df);
        log.info("User MFA enabled successfully: {}", email);
    }

    /**
     * Rollback to no MFA
     *
     * @param email user email
     */
    @Override
    public void rollbackToNoMfa(String email) {
        User user = userMapper.getUserByEmail(email);
        if (user == null) {
            throw new BaseException(ErrorCode.USER_NOT_FOUND);
        }

        userMapper.updateMfaSecret(user.getUserId(), false, null);
        userMapper.updateTrustedDevice(user.getUserId(), null);
        mfaRecoveryCodeMapper.deleteByUserId(user.getUserId());

        log.info("User MFA rollback to no MFA successfully: {}", email);
    }

    /**
     * Retrieves and converts trusted device information for a specified user.
     * <p>
     * This method performs the following operations:
     * <ol>
     *   <li>Fetches user entity from persistence layer using provided user ID</li>
     *   <li>Handles potential null values using safe navigation patterns</li>
     *   <li>Transforms device fingerprint entities to value objects</li>
     *   <li>Enriches location data through IP information resolution</li>
     * </ol>
     *
     * @param userId Universal Unique Identifier of the target user (RFC 4122)
     * @return Immutable list of trusted device value objects. Returns empty list
     *         when:
     *         <ul>
     *           <li>User entity not found</li>
     *           <li>User has no trusted devices</li>
     *           <li>Trusted devices collection exists but is empty</li>
     *         </ul>
     */
    @Override
    public List<TrustDeviceVO> getTrustDevice(UUID userId) {
        return Optional.ofNullable(userMapper.getUserById(userId))
                .map(User::getTrustedDevice)
                .orElseGet(Collections::emptyList)
                .stream()
                .map(this::buildTrustDeviceVO)
                .collect(Collectors.toList());
    }

    /**
     * Deletes a trusted device for a specific user.
     *
     * @param userId      The unique identifier of the user.
     * @param fingerprint The fingerprint of the device to be deleted.
     * @return The updated user entity after the device deletion.
     * @throws BaseException If the user or device is not found.
     */
    @Override
    public User deleteTrustDevice(UUID userId, String fingerprint) {
        User user = Optional.ofNullable(userMapper.getUserById(userId))
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        List<DeviceFingerprint> devices = user.getTrustedDevice();

        if (!(devices != null && devices.removeIf(d -> fingerprint.equals(d.getPrint())))) {
            throw new BaseException(ErrorCode.DEVICE_NOT_FOUND);
        }

        userMapper.updateTrustedDevice(userId, devices);
        log.info("User {} deleted trusted device {}", user.getEmail(), fingerprint);
        return user;
    }


    /**
     * Constructs TrustDevice Value Object from DeviceFingerprint entity.
     * <p>
     * Augments device fingerprint data with geographical information resolved
     * through IP address lookup. Implements graceful degradation pattern for
     * IP information resolution failures.
     *
     * @param deviceFingerprint Device authentication fingerprint entity containing
     *        technical identification parameters. Must not be null.
     * @return Fully populated value object with combined technical and
     *         geographical data. Guaranteed non-null.
     */
    private TrustDeviceVO buildTrustDeviceVO(DeviceFingerprint deviceFingerprint) {
        String location = Optional.ofNullable(IPInfoUtils.getIpInfo(deviceFingerprint.getIp()))
                .map(ipInfo -> String.join(" ",
                        ipInfo.getCountry(),
                        ipInfo.getProvince(),
                        ipInfo.getAddress()))
                .orElse("");

        return TrustDeviceVO.builder()
                .browser(deviceFingerprint.getBrowser())
                .os(deviceFingerprint.getOs())
                .ip(deviceFingerprint.getIp())
                .fingerprint(deviceFingerprint.getPrint())
                .location(location)
                .build();
    }


    /**
     * Verify MFA or recovery code
     *
     * @param user       User
     * @param totpCode   TOTP code
     * @param recoveryCode Recovery code
     * @param df         Device fingerprint
     * @param location   Location
     */
    private void verifyMfaOrRecovery(User user,
                                     String totpCode,
                                     String recoveryCode,
                                     DeviceFingerprint df,
                                     Point location) {
        if (totpCode != null && TotpUtils.verifyCode(user.getMfaSecret(), totpCode)) {
            return;
        }

        if (recoveryCode != null) {
            List<MfaRecoveryCode> recoveryCodes = mfaRecoveryCodeMapper.findValidCodes(user.getUserId());
            for (MfaRecoveryCode rc : recoveryCodes) {
                if (PasswordUtils.matches(recoveryCode, rc.getCodeHash())) {
                    mfaRecoveryCodeMapper.updateCodeUsed(rc.getId());
                    return;
                }
            }
        }
        logLoginAttempt(user, df.getIp(), df, location, false, null);
        throw new BaseException(ErrorCode.TOTP_CODE_INCORRECT);
    }

    /**
     * Add a trusted device for the specified user.
     * <p>
     * The function first checks whether the user already has a trusted device list.
     * If the user does not have a trusted device list, a new list is created.
     * Then the incoming device fingerprint is added to this list, and the user's trusted device list is updated.
     *
     * @param user You need to add a user object for a trusted device, and it cannot be null.
     * @param df The device fingerprint object to be added cannot be null.
     */
    private void addTrustedDevice(User user, DeviceFingerprint df) {
        List<DeviceFingerprint> trustedDevices;
        if (user.getTrustedDevice() == null) {
            trustedDevices = new ArrayList<>();
        } else {
            trustedDevices = new ArrayList<>(user.getTrustedDevice());
        }
        trustedDevices.add(df);
        user.setTrustedDevice(trustedDevices);
        userMapper.updateTrustedDevice(user.getUserId(), trustedDevices);
    }

    /**
     * Check if the device is a new device for the specified user.
     * <p>
     * The function first checks whether the user already has a trusted device list.
     * If the user does not have a trusted device list, it returns true.
     * Then the incoming device fingerprint is compared with each device in the trusted device list.
     * If the incoming device fingerprint does not match any device in the trusted device list, it returns true.
     *
     * @param user You need to add a user object for a trusted device, and itcannot be null.
     * @param df The device fingerprint object to be compared cannot be null.
     */
    private boolean isNewDevice(User user, DeviceFingerprint df) {
        List<DeviceFingerprint> trustedDevice = user.getTrustedDevice();
        return trustedDevice == null || trustedDevice.stream()
                .noneMatch(deviceFingerprint ->
                        deviceFingerprint.getPrint().equals(df.getPrint())
                                && deviceFingerprint.getOs().equals(df.getOs())
                                && deviceFingerprint.getBrowser().equals(df.getBrowser())
                                && deviceFingerprint.getIp().equals(df.getIp())
                );
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
        redisTemplate.opsForValue().set(email + ":token", token, 30, TimeUnit.MINUTES);
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
