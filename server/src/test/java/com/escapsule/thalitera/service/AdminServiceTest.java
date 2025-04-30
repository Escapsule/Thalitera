package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.UserEditDTO;
import com.escapsule.thalitera.dto.UserLoginDTO;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.json.DeviceFingerprint;
import com.escapsule.thalitera.mapper.LoginHistoryMapper;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.service.impl.AdminServiceImpl;
import com.escapsule.thalitera.utils.PasswordUtils;
import com.escapsule.thalitera.utils.UserAgentUtils;
import com.escapsule.thalitera.vo.UserVO;
import nl.basjes.parse.useragent.UserAgent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Point;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = AdminServiceImpl.class)
class AdminServiceTest {

    @Autowired
    private AdminService adminService;

    @MockitoBean
    private UserMapper userMapper;

    @MockitoBean
    private UserAgentUtils userAgentUtils;

    @MockitoBean
    private LoginHistoryMapper loginHistoryMapper;

    @MockitoBean
    private LoginHistoryService loginHistoryService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(UUID.randomUUID());
        user.setEmail("admin@example.com");
        user.setPasswordHash("$2a$10$dummyhash");
        user.setStatus("admin");
    }

    @Test
    void getAllUsers_shouldReturnList() {
        when(userMapper.getAllUsers()).thenReturn(Collections.singletonList(user));

        List<UserVO> users = adminService.getAllUsers();

        assertNotNull(users);
        assertEquals(1, users.size());
        assertEquals(user.getEmail(), users.get(0).getEmail());
    }

    @Test
    void editUser_whenStatusNotSame_thenSuccess() {
        UserEditDTO userEditDTO = UserEditDTO.builder()
                .userId(UUID.randomUUID())
                .status("inactive")
                .build();

        User existingUser = new User();
        existingUser.setStatus("admin");

        when(userMapper.getUserById(userEditDTO.getUserId())).thenReturn(existingUser);

        boolean result = adminService.editUser(userEditDTO);

        assertTrue(result);
        verify(userMapper).updateUserStatusById(userEditDTO.getUserId(), userEditDTO.getStatus());
    }

    @Test
    void editUser_whenStatusSame_thenThrowException() {
        UserEditDTO userEditDTO = UserEditDTO.builder()
                .userId(UUID.randomUUID())
                .status("admin")
                .build();

        User existingUser = new User();
        existingUser.setStatus("admin");

        when(userMapper.getUserById(userEditDTO.getUserId())).thenReturn(existingUser);

        BaseException ex = assertThrows(BaseException.class, () -> adminService.editUser(userEditDTO));
        assertEquals(ErrorCode.USER_STATUS_SAME_TO_OLD.getCode(), ex.getCode());
    }

    @Test
    void login_whenUserNotFound_thenThrowException() {
        when(userMapper.getUserByEmail(anyString())).thenReturn(null);

        UserLoginDTO loginDTO = new UserLoginDTO();
        loginDTO.setEmail("notfound@example.com");
        loginDTO.setPassword("password");

        BaseException ex = assertThrows(BaseException.class,
                () -> adminService.login(loginDTO, "127.0.0.1", "user-agent", "fingerprint"));
        assertEquals(ErrorCode.USER_NOT_FOUND.getCode(), ex.getCode());
    }

    @Test
    void login_whenPasswordIncorrect_thenThrowException() {
        user.setStatus("admin");

        user.setPasswordHash(PasswordUtils.encode("correctpassword"));

        when(userMapper.getUserByEmail(anyString())).thenReturn(user);

        when(userAgentUtils.parse(anyString())).thenReturn(mock(UserAgent.class));
        when(userAgentUtils.parseBrowser(any(UserAgent.class))).thenReturn("browser");
        when(userAgentUtils.parseOS(any(UserAgent.class))).thenReturn("os");

        UserLoginDTO loginDTO = new UserLoginDTO();
        loginDTO.setEmail(user.getEmail());
        loginDTO.setPassword("wrongpassword");

        BaseException ex = assertThrows(BaseException.class,
                () -> adminService.login(loginDTO, "127.0.0.1", "user-agent", "fingerprint"));

        assertEquals(ErrorCode.USER_PASSWORD_INCORRECT.getCode(), ex.getCode());
    }

    @Test
    void operationConfirm_whenPasswordIncorrect_thenThrowException() {
        String correctPassword = "correctPassword";
        String hashedPassword = com.escapsule.thalitera.utils.PasswordUtils.encode(correctPassword);

        BaseException ex = assertThrows(BaseException.class,
                () -> adminService.operationConfirm(hashedPassword, "wrongPassword"));
        assertEquals(ErrorCode.USER_PASSWORD_INCORRECT.getCode(), ex.getCode());
    }

    @Test
    void operationConfirm_whenPasswordCorrect_thenReturnTrue() {
        String password = "password";
        String hashedPassword = com.escapsule.thalitera.utils.PasswordUtils.encode(password);

        boolean result = adminService.operationConfirm(hashedPassword, password);

        assertTrue(result);
    }
}
