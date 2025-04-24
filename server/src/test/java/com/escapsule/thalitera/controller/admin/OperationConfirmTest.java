package com.escapsule.thalitera.admin;

import com.escapsule.thalitera.controller.admin.AdminController;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.service.AdminService;
import com.escapsule.thalitera.service.ReservationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.anyString;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.Mockito.verify;
import static org.mockito.ArgumentMatchers.eq;

import static org.mockito.Mockito.when;
import static org.mockito.Mockito.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
public class OperationConfirmTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @MockBean
    private ReservationService reservationService;

    private User mockAdminUser;
    private final String passwordInput = "123456";

    @BeforeEach
    void setUp() {
        mockAdminUser = new User();
        mockAdminUser.setUserId(UUID.randomUUID());
        mockAdminUser.setEmail("admin@example.com");
        mockAdminUser.setUsername("admin");
        mockAdminUser.setStatus("admin");
        mockAdminUser.setPasswordHash("mockedHash");
    }

    @Test
    void testOperationConfirmSuccess() throws Exception {

        when(adminService.operationConfirm(anyString(), anyString())).thenReturn(true);

        mockMvc.perform(post("/admin/operation-confirm")
                        .sessionAttr("user", mockAdminUser)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("\"123456\""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value("Operation confirmed."));
    }

    @Test
    void testOperationConfirmFail() throws Exception {
        when(adminService.operationConfirm(eq("mockedHash"), eq(passwordInput))).thenReturn(false);

        mockMvc.perform(post("/admin/operation-confirm")
                        .sessionAttr("user", mockAdminUser)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("\"123456\""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value("Operation failed."));
    }

    @Test
    void testOperationConfirmUnauthorized() throws Exception {
        mockMvc.perform(post("/admin/operation-confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("\"123456\""))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCode.USER_NOT_LOGIN.getCode()))
                .andExpect(jsonPath("$.message").value(ErrorCode.USER_NOT_LOGIN.getMessage()));
    }
}
