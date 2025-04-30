package com.escapsule.thalitera.controller.admin;

import com.escapsule.thalitera.dto.UserEditDTO;
import com.escapsule.thalitera.entity.User;
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

import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
public class EditUserTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private ReservationService reservationService;

    @Autowired
    private ObjectMapper objectMapper;

    private UserEditDTO userEditDTO;
    private User mockAdminUser;

    @BeforeEach
    void setUp() {
        userEditDTO = new UserEditDTO();
        userEditDTO.setUserId(UUID.fromString("2839ec61-b4d3-41b8-94f6-f28cab5c1b65")); // 可替换为动态值
        userEditDTO.setStatus("active");

        mockAdminUser = new User();
        mockAdminUser.setUserId(UUID.randomUUID());
        mockAdminUser.setEmail("admin@example.com");
        mockAdminUser.setUsername("admin");
        mockAdminUser.setStatus("admin");
    }

    @Test
    void testEditUserSuccess() throws Exception {
        // success case
        when(adminService.editUser(userEditDTO)).thenReturn(true);

        mockMvc.perform(post("/admin/edit")
                        .sessionAttr("user", mockAdminUser)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userEditDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value("Edit successful."));
    }

    @Test
    void testEditUserFailure() throws Exception {
        // fail case
        when(adminService.editUser(userEditDTO)).thenReturn(false);

        mockMvc.perform(post("/admin/edit")
                        .sessionAttr("user", mockAdminUser)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userEditDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").value("Edit failed."));
    }

    @Test
    void testEditUserWithInvalidStatus() throws Exception {
        userEditDTO.setStatus("shoutu");

        mockMvc.perform(post("/admin/edit")
                        .sessionAttr("user", mockAdminUser)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userEditDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(2014)) // ErrorCode.INVALID_STATUS
                .andExpect(jsonPath("$.message").value("Invalid user status."));
    }
}
