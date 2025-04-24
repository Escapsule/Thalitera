package com.escapsule.thalitera.admin;

import com.escapsule.thalitera.controller.admin.AdminController;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.service.AdminService;
import com.escapsule.thalitera.service.ReservationService;
import com.escapsule.thalitera.vo.ReservationVO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
public class GetReservationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @MockBean
    private ReservationService reservationService;

    @Autowired
    private ObjectMapper objectMapper;

    private User mockAdminUser;

    @BeforeEach
    void setUp() {
        mockAdminUser = new User();
        mockAdminUser.setUserId(UUID.randomUUID());
        mockAdminUser.setEmail("admin@example.com");
        mockAdminUser.setUsername("admin");
        mockAdminUser.setStatus("admin");
    }

    @Test
    void testGetAllReservationsSuccess() throws Exception {
        ReservationVO reservation = new ReservationVO();
        when(reservationService.getAllReservations()).thenReturn(List.of(reservation));

        mockMvc.perform(get("/admin/reservations")
                        .sessionAttr("user", mockAdminUser)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    void testGetAllReservationsUnauthorized() throws Exception {
        mockMvc.perform(get("/admin/reservations")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(2011)) // USER_NOT_LOGIN
                .andExpect(jsonPath("$.message").value("User not login"));
    }
}
