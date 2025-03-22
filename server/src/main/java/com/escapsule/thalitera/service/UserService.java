package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.UserRegisterDTO;

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
}
