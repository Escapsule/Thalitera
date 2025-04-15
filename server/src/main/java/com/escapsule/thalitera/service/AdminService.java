package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.UserEditDTO;
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
}
