package com.escapsule.thalitera.controller.admin;

import com.escapsule.thalitera.dto.UserLoginDTO;
import com.escapsule.thalitera.entity.User;  // Import User class
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.service.AdminService;
import com.escapsule.thalitera.service.ReservationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import com.escapsule.thalitera.enumeration.ErrorCode;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
public class AdminLoginTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private ReservationService reservationService;


    @Autowired
    private ObjectMapper objectMapper;

    private UserLoginDTO loginDTO;

    @BeforeEach
    void setUp() {
        loginDTO = new UserLoginDTO();
        loginDTO.setEmail("admin@example.com");
        loginDTO.setPassword("123456");
    }

    @Test
    void testAdminLoginSuccess() throws Exception {
        String userAgent = "PostmanRuntime/7.34.0";
        String fingerprint = "abc123";
        String ip = "192.168.1.1";

        User mockUser = new User();
        mockUser.setEmail("admin@example.com");
        mockUser.setUsername("admin");

        when(adminService.login(loginDTO, ip, userAgent, fingerprint)).thenReturn(mockUser);

        mockMvc.perform(post("/admin/login")
                        .header("User-Agent", userAgent)
                        .header("thalitera_fingerprint", fingerprint)
                        .with(request -> { request.setRemoteAddr(ip); return request; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }
    @Test
    void testAdminLoginFailure() throws Exception {
        String userAgent = "PostmanRuntime/7.34.0";
        String fingerprint = "abc123";
        String ip = "192.168.1.1";

        when(adminService.login(loginDTO, ip, userAgent, fingerprint))
                .thenThrow(new BaseException(ErrorCode.USER_PASSWORD_INCORRECT));

        mockMvc.perform(post("/admin/login")
                        .header("User-Agent", userAgent)
                        .header("thalitera_fingerprint", fingerprint)
                        .with(request -> { request.setRemoteAddr(ip); return request; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCode.USER_PASSWORD_INCORRECT.getCode()))
                .andExpect(jsonPath("$.message").value(ErrorCode.USER_PASSWORD_INCORRECT.getMessage()));
    }
}