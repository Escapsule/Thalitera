package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.constant.UserStatusConstant;
import com.escapsule.thalitera.dto.MailDTO;
import com.escapsule.thalitera.dto.UserRegisterDTO;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.service.EmailService;
import com.escapsule.thalitera.service.UserService;
import com.escapsule.thalitera.utils.PasswordUtils;
import com.escapsule.thalitera.utils.TokenUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class UserServiceImpl implements UserService {


    private final UserMapper userMapper;
    private final RedisTemplate<String, String> redisMailTemplate;
    private final EmailService emailService;
    private final TemplateEngine mailTemplateEngine;

    public UserServiceImpl(UserMapper userMapper,
                           RedisTemplate<String, String> redisTemplate,
                           TemplateEngine mailTemplateEngine,
                           EmailService emailService) {
        this.userMapper = userMapper;
        this.redisMailTemplate = redisTemplate;
        this.mailTemplateEngine = mailTemplateEngine;
        this.emailService = emailService;
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
        String url = "http://localhost:8080/user/verify" + "?email=" + dto.getTo() + "&token=" + token;

        Context context = new Context();
        context.setVariable("verification_url", url);

        String html = mailTemplateEngine.process(dto.getTemplateContent(), context);

        emailService.sendMail(
                dto.getTo(),
                dto.getSubject(),
                html
        );

        return token;
    }
}
