package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.constant.UserStatusConstant;
import com.escapsule.thalitera.dto.UserEditDTO;
import com.escapsule.thalitera.dto.UserLoginDTO;
import com.escapsule.thalitera.entity.LoginHistory;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.json.DeviceFingerprint;
import com.escapsule.thalitera.mapper.LoginHistoryMapper;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.service.AdminService;
import com.escapsule.thalitera.service.LoginHistoryService;
import com.escapsule.thalitera.transfer.UserTransfer;
import com.escapsule.thalitera.utils.GeometryUtils;
import com.escapsule.thalitera.utils.PasswordUtils;
import com.escapsule.thalitera.utils.UserAgentUtils;
import com.escapsule.thalitera.vo.UserVO;
import com.jthinking.common.util.ip.IPInfoUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.basjes.parse.useragent.UserAgent;
import org.locationtech.jts.geom.Point;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final UserMapper userMapper;
    private final UserAgentUtils userAgentUtils;
    private final LoginHistoryMapper loginHistoryMapper;
    private final LoginHistoryService loginHistoryService;
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

    /**
     * Login user
     *
     * @param dto           UserLoginDTO object containing user login information
     * @param ip            IP address of the user
     * @param userAgent     User agent of the user
     * @param fingerprint   Fingerprint of the user
     * @return User object if login is successful, null otherwise
     */
    @Override
    @Transactional
    public User login(UserLoginDTO dto,
                      String ip,
                      String userAgent,
                      String fingerprint) {

        // verify if user exist
        User user = userMapper.getUserByEmail(dto.getEmail());
        if (user == null) {
            log.error("User does not exist: {}", dto.getEmail());
            throw new BaseException(ErrorCode.USER_NOT_FOUND);
        }

        UserAgent ua = userAgentUtils.parse(userAgent);

        DeviceFingerprint df = DeviceFingerprint.builder()
                .browser(userAgentUtils.parseBrowser(ua))
                .os(userAgentUtils.parseOS(ua))
                .print(fingerprint)
                .build();

        Point location = GeometryUtils.createPoint(
                IPInfoUtils.getIpInfo(ip).getLng(),
                IPInfoUtils.getIpInfo(ip).getLat()
        );

        // verify if admin
        if (!user.getStatus().equals(UserStatusConstant.ADMIN)) {
            log.error("User status is not admin: {}", user.getEmail());
            logLoginAttempt(user, ip, df, location, false, ErrorCode.USER_NOT_ADMIN);
            throw new BaseException(ErrorCode.USER_NOT_ADMIN);
        }

        // verify if user password is correct
        if (!PasswordUtils.matches(dto.getPassword(), user.getPasswordHash())) {
            log.error("User password is incorrect: {}", user.getEmail());
            logLoginAttempt(user, ip, df, location, false, ErrorCode.USER_PASSWORD_INCORRECT);
            throw new BaseException(ErrorCode.USER_PASSWORD_INCORRECT);
        }

        logLoginAttempt(user, ip, df, location, true, null);

        return user;
    }

    @Override
    public boolean operationConfirm(String passwordHash, String password) {
        if (!PasswordUtils.matches(password, passwordHash)) {
            throw new BaseException(ErrorCode.USER_PASSWORD_INCORRECT);
        }
        return true;
    }

    private void logLoginAttempt(@Nullable User user,
                                 String ip,
                                 DeviceFingerprint df,
                                 Point location,
                                 boolean success,
                                 @Nullable ErrorCode errorCode) {
        LoginHistory history = LoginHistory.builder()
                .userId(user != null ? user.getUserId() : null)
                .ipAddress(ip)
                .deviceFingerprint(df)
                .success(success)
                .failureReason(errorCode != null ? errorCode.getMessage() : null)
                .location(location)
                .build();

        if (success) {
            loginHistoryMapper.insert(history);
        } else {
            loginHistoryService.addFailedAttempt(history);
        }
    }
}
