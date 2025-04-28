package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.*;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.mapper.LoginHistoryMapper;
import com.escapsule.thalitera.mapper.MeetingRoomMapper;
import com.escapsule.thalitera.mapper.MfaRecoveryCodeMapper;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.properties.ConfigProperties;
import com.escapsule.thalitera.service.impl.UserServiceImpl;
import com.escapsule.thalitera.utils.PasswordUtils;
import com.escapsule.thalitera.utils.UserAgentUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UserServiceImpl.class)
class UserServiceTest {

    @Autowired
    private UserService userService;

    @MockitoBean
    private ApplicationEventPublisher eventPublisher;

    @MockitoBean
    private UserMapper userMapper;   // mock你的Mapper

    @MockitoBean
    private LoginHistoryMapper loginHistoryMapper; // 如果Service里面有用到

    @MockitoBean
    private RedisTemplate<String, String> redisTemplate;

    @MockitoBean
    private RedisTemplate<String, List<String>> redisTemplateList;

    @MockitoBean
    private ConfigProperties configProperties;

    @MockitoBean
    private MeetingRoomMapper meetingRoomMapper;

    @MockitoBean
    private MfaRecoveryCodeMapper mfaRecoveryCodeMapper;

    @MockitoBean
    private LoginHistoryService loginHistoryService;

    @MockitoBean
    private UserAgentUtils userAgentUtils;

    private UserRegisterDTO registerDTO;
    private UserLoginDTO loginDTO;
    private User user;
    private ValueOperations<String, String> valueOperations;


    @BeforeEach
    void setup() {
        registerDTO = UserRegisterDTO.builder()
                .email("test@example.com")
                .password("Test@123")
                .build();

        loginDTO = UserLoginDTO.builder()
                .email("test@example.com")
                .password("Test@123")
                .build();

        user = new User();
        user.setUserId(UUID.randomUUID());
        user.setEmail("test@example.com");
        user.setPasswordHash("$2a$10$dummyhash");
        user.setStatus("active");

    }

    @Test
    void register_whenUserExists_thenThrowException() {
        when(userMapper.getUserByEmail(anyString())).thenReturn(user);

        BaseException ex = assertThrows(BaseException.class, () -> userService.register(registerDTO));
        assertEquals(ErrorCode.USER_EXIST.getCode(), ex.getCode());
    }

    @Test
    void login_whenUserNotFound_thenThrowException() {
        when(userMapper.getUserByEmail(anyString())).thenReturn(null);

        BaseException ex = assertThrows(BaseException.class,
                () -> userService.login(loginDTO, "127.0.0.1", "user-agent", "fingerprint"));
        assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), ex.getCode());
    }

    @Test
    void getUserCalendar_whenUserHasNoReservations_thenReturnEmpty() {
        UUID userId = UUID.randomUUID();
        when(userMapper.getUserRelatedReservations(userId)).thenReturn(Collections.emptyList());

        var calendar = userService.getUserCalendar(userId);

        assertNotNull(calendar);
        assertTrue(calendar.isEmpty());
    }

    @Test
    void changePassword_whenOldPasswordWrong_thenThrowException() {
        // Arrange
        String correctOldPassword = "correctOldPassword";
        String encodedPassword = PasswordUtils.encode(correctOldPassword);

        User existingUser = new User();
        existingUser.setPasswordHash(encodedPassword);

        ChangePasswordDTO dto = new ChangePasswordDTO("wrongOldPassword", "newPassword");

        // Act
        BaseException ex = assertThrows(BaseException.class,
                () -> userService.changePassword(existingUser, dto));

        // Assert
        assertEquals(ErrorCode.USER_PASSWORD_INCORRECT.getCode(), ex.getCode());
    }

    @Test
    void deleteTrustDevice_whenDeviceNotFound_thenThrowException() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setTrustedDevice(Collections.emptyList());

        when(userMapper.getUserById(userId)).thenReturn(user);

        BaseException ex = assertThrows(BaseException.class,
                () -> userService.deleteTrustDevice(userId, "someFingerprint"));
        assertEquals(ErrorCode.DEVICE_NOT_FOUND.getCode(), ex.getCode());
    }
}
