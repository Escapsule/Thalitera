package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.constant.UserStatusConstant;
import com.escapsule.thalitera.dto.MailDTO;
import com.escapsule.thalitera.dto.UserLoginDTO;
import com.escapsule.thalitera.dto.UserRegisterDTO;
import com.escapsule.thalitera.entity.LoginHistory;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.json.DeviceFingerprint;
import com.escapsule.thalitera.mapper.LoginHistoryMapper;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.service.EmailService;
import com.escapsule.thalitera.service.LoginHistoryService;
import com.escapsule.thalitera.service.UserService;
import com.escapsule.thalitera.utils.GeometryUtils;
import com.escapsule.thalitera.utils.PasswordUtils;
import com.escapsule.thalitera.utils.TokenUtils;
import com.escapsule.thalitera.utils.UserAgentUtils;
import com.jthinking.common.util.ip.IPInfoUtils;
import lombok.extern.slf4j.Slf4j;
import nl.basjes.parse.useragent.UserAgent;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    @Value("${spring.mail.url}")
    private String VERIFICATION_URL; // TODO: Move to config until Notification System is ready
    private final UserMapper userMapper;
    private final RedisTemplate<String, String> redisMailTemplate;
    private final EmailService emailService;
    private final TemplateEngine mailTemplateEngine;
    private final LoginHistoryMapper loginHistoryMapper;
    private final LoginHistoryService loginHistoryService;

    public UserServiceImpl(UserMapper userMapper,
                           RedisTemplate<String, String> redisTemplate,
                           TemplateEngine mailTemplateEngine,
                           EmailService emailService,
                           LoginHistoryMapper loginHistoryMapper,
                           LoginHistoryService loginHistoryService) {
        this.userMapper = userMapper;
        this.redisMailTemplate = redisTemplate;
        this.mailTemplateEngine = mailTemplateEngine;
        this.emailService = emailService;
        this.loginHistoryMapper = loginHistoryMapper;
        this.loginHistoryService = loginHistoryService;
    }

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
                .email(dto.getEmail())
                .username(dto.getEmail().substring(0, dto.getEmail().indexOf("@")))
                .passwordHash(PasswordUtils.encode(dto.getPassword()))
                .build();

        userMapper.insert(user);

        // TODO: We need Notification System
        MailDTO mailDTO = MailDTO.builder()
                .to(dto.getEmail())
                .subject("[Thalitera] Verify your email address")
                .templateContent("registration-verification-template")
                .build();
        String token = sendEmail(mailDTO);

        storeVerificationToken(dto.getEmail(), token);
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

        UserAgent ua = UserAgentUtils.parse(userAgent);

        DeviceFingerprint df = DeviceFingerprint.builder()
                .browser(UserAgentUtils.parseBrowser(ua))
                .os(UserAgentUtils.parseOS(ua))
                .build();

        Point location = GeometryUtils.createPoint(IPInfoUtils.getIpInfo(ip).getLng(),IPInfoUtils.getIpInfo(ip).getLat());

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
     * Store mailboxes and tokens to Redis and set expiration time to 5 minutes
     *
     * @param email user email
     * @param token Validation Token
     */
    private void storeVerificationToken(String email, String token) {
        redisMailTemplate.opsForValue().set(email, token, 5, TimeUnit.MINUTES);
    }

    /**
     * Verify the mailbox token, delete the key-value pair in Redis after successful verification
     *
     * @param email user email
     * @param token User-provided Tokens
     */
    private void verifyEmailToken(String email, String token) {
        String storedToken = redisMailTemplate.opsForValue().get(email);

        if (storedToken == null) {
            log.error("The mailbox does not exist or the token has expired: {}", email);
            throw new BaseException(ErrorCode.USER_EMAIL_OR_TOKEN_INVALID);
        }

        if (!storedToken.equals(token)) {
            log.error("Token mismatch, user provided: {}, expect: {}", token, storedToken);
            throw new BaseException(ErrorCode.USER_TOKEN_MISMATCH);
        }

        redisMailTemplate.delete(email);
    }

    /**
     * Send email to user
     *
     * @param dto MailDTO
     * @return Token
     */
    private String sendEmail(MailDTO dto) {
        log.info("Send email message initializing: {}", dto);
        String token = TokenUtils.generateShortToken();
        // TODO: notification module need dynamically generate email template
        // hard code for now
        // String url = "http://localhost:8080/user/verify" + "?email=" + dto.getTo() + "&token=" + token;
        String url = VERIFICATION_URL + "?email=" + dto.getTo() + "&token=" + token;

        Context context = new Context();
        context.setVariable("verification_url", url);
        context.setVariable("email", dto.getTo());

        String html = mailTemplateEngine.process(dto.getTemplateContent(), context);

        emailService.sendMail(
                dto.getTo(),
                dto.getSubject(),
                html
        );

        return token;
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
