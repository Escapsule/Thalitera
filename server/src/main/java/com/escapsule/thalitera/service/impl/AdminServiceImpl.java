package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.dto.UserEditDTO;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.service.AdminService;
import com.escapsule.thalitera.transfer.UserTransfer;
import com.escapsule.thalitera.vo.UserVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {
    private final UserMapper userMapper;

    public AdminServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    /**
     * Get all users
     *
     * @return List of users
     */
    @Override
    public List<UserVO> getAllUsers() {
        List<User> users = userMapper.getAllUsers();
        return users.stream()
                .map(UserTransfer.INSTANCE::user2UserVO)
                .toList();
    }

    /**
     * Edit user information
     *
     * @param userDTO UserEditDTO object containing user information
     * @return true if edit is successful, false otherwise
     */
    @Override
    @Transactional
    public boolean editUser(UserEditDTO userDTO) {
        String status = userMapper.getUserById(userDTO.getUserId()).getStatus();
        if (status.equals(userDTO.getStatus())) {
            throw new BaseException(ErrorCode.USER_STATUS_SAME_TO_OLD);
        }
        userMapper.updateUserStatusById(userDTO.getUserId(), userDTO.getStatus());
        return true;
    }
}
