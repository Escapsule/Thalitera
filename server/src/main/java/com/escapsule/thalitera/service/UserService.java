package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.UserLoginDTO;
import com.escapsule.thalitera.dto.UserRegisterDTO;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.vo.CalendarVO;

import java.util.List;
import java.util.UUID;

public interface UserService {
    /**
     * Register user
     *
     * @param dto UserRegisterDTO include email and password
     */
    void register(UserRegisterDTO dto);

    /**
     * Verify user email
     *
     * @param email user email
     * @param token user token
     */
    void verifyEmail(String email, String token);

    /**
     * Login user
     *
     * @param dto UserLoginDTO include email and password
     * @param ip  user ip
     * @param userAgent user agent
     * @return User
     */
    User login(UserLoginDTO dto, String ip, String userAgent);

    /**
     * Get user's calendar
     *
     * @param userId user id
     * @return List of CalendarVO
     */
    List<CalendarVO> getUserCalendar(UUID userId);
}
