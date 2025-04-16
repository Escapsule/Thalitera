package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.UserEditDTO;
import com.escapsule.thalitera.dto.UserLoginDTO;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.vo.UserVO;

import java.util.List;

public interface AdminService {

    /**
     * Get all users
     *
     * @return List of users
     */
    List<UserVO> getAllUsers();

    /**
     * Edit user information
     *
     * @param userEditDTO UserEditDTO object containing user information
     * @return true if edit is successful, false otherwise
     */
    boolean editUser(UserEditDTO userEditDTO);

    /**
     * Login user
     *
     * @param dto           UserLoginDTO object containing user login information
     * @param ip            IP address of the user
     * @param userAgent     User agent of the user
     * @param fingerprint   Fingerprint of the user
     * @return User object if login is successful, null otherwise
     */
    User login(UserLoginDTO dto, String ip, String userAgent, String fingerprint);
}
