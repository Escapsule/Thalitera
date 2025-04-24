package com.escapsule.thalitera.controller.admin;

import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.service.AdminService;
import com.escapsule.thalitera.service.ReservationService;
import com.escapsule.thalitera.vo.UserVO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
public class GetUserTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private ReservationService reservationService;

    @Test
    void testGetAllUsers() throws Exception {
        User mockUser = new User();
        mockUser.setUserId(UUID.randomUUID());
        mockUser.setEmail("admin@example.com");
        mockUser.setUsername("admin");
        mockUser.setStatus("admin");

        UserVO user1 = new UserVO();
        user1.setUserId(UUID.randomUUID());
        user1.setEmail("user1@example.com");
        user1.setUsername("user1");

        UserVO user2 = new UserVO();
        user2.setUserId(UUID.randomUUID());
        user2.setEmail("user2@example.com");
        user2.setUsername("user2");

        when(adminService.getAllUsers()).thenReturn(List.of(user1, user2));

        mockMvc.perform(get("/admin/users")
                        .sessionAttr("user", mockUser)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())  // HTTP 200
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].email", is("user1@example.com")))
                .andExpect(jsonPath("$.data[1].email", is("user2@example.com")));
    }
}
