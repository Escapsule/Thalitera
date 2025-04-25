package com.escapsule.thalitera.admin;

import com.escapsule.thalitera.controller.admin.AdminController;
import com.escapsule.thalitera.dto.UserLoginDTO;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.handler.GlobalExceptionHandler;
import com.escapsule.thalitera.service.AdminService;
import com.escapsule.thalitera.service.ReservationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminLoginTest {

    private MockMvc mockMvc;

    @Mock
    private AdminService adminService;

    @Mock
    private ReservationService reservationService;

    @InjectMocks
    private AdminController adminController;

    private ObjectMapper objectMapper;
    private UserLoginDTO loginDTO;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(adminController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        loginDTO = new UserLoginDTO();
        loginDTO.setEmail("admin@example.com");
        loginDTO.setPassword("123456");
    }
    @Test
    void testAdminLoginSuccess() throws Exception {
        String email = "admin@example.com";
        String password = "123456";
        String userAgent = "PostmanRuntime/7.34.0";
        String fingerprint = "abc123";
        String ip = "192.168.1.1";

        UserLoginDTO dto = new UserLoginDTO();
        dto.setEmail(email);
        dto.setPassword(password);

        User mockUser = new User();
        mockUser.setEmail(email);
        mockUser.setUsername("admin");

        when(adminService.login(
                argThat(argument -> argument.getEmail().equals(email)
                        && argument.getPassword().equals(password)),
                eq(ip),
                eq(userAgent),
                eq(fingerprint)
        )).thenReturn(mockUser);

        mockMvc.perform(post("/admin/login")
                        .header("User-Agent", userAgent)
                        .header("thalitera_fingerprint", fingerprint)
                        .with(request -> {
                            request.setRemoteAddr(ip);
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }


    @Test
    void testAdminLoginFailure() throws Exception {
        UserLoginDTO dto = new UserLoginDTO();
        dto.setEmail("admin@example.com");
        dto.setPassword("wrongpassword");

        when(adminService.login(
                argThat(argument -> argument.getEmail().equals("admin@example.com")
                        && argument.getPassword().equals("wrongpassword")),
                eq("127.0.0.1"),
                eq("JUnit-Agent"),
                eq("fake-fingerprint")
        )).thenThrow(new BaseException(ErrorCode.USER_PASSWORD_INCORRECT));


        mockMvc.perform(post("/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .header("User-Agent", "JUnit-Agent")
                        .header("thalitera_fingerprint", "fake-fingerprint")
                        .with(request -> {
                            request.setRemoteAddr("127.0.0.1");
                            return request;
                        }))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCode.USER_PASSWORD_INCORRECT.getCode()))
                .andExpect(jsonPath("$.message").value(ErrorCode.USER_PASSWORD_INCORRECT.getMessage()));
    }

}

